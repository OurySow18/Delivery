import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { collection, doc, onSnapshot, query, serverTimestamp, where, writeBatch } from '@firebase/firestore';

import {
  getItemQuantityLabel,
  getVendorGroupItemKey,
  getVendorLabel,
  getVendorKey,
  groupOrdersByVendor,
  isItemPickedUp,
  type DeliverInfo,
  type OrderData,
  type PickupStatus,
} from '@/constants/OrderWorkflow';
import { hydrateOrdersWithVendorProfiles } from '@/constants/VendorDirectory';
import { db, getFirebaseAuth } from '@/firebase';

const buildPickupState = (order: OrderData) => {
  const cart = order.cart ?? [];
  const pickedUpItems = cart.filter(isItemPickedUp).length;
  const hasTrackedPickup = cart.some((item) => Boolean(item.vendorId || item.vendorName || item.pickedUp !== undefined));
  const readyForDelivery = hasTrackedPickup ? cart.length > 0 && pickedUpItems === cart.length : true;

  let pickupStatus: PickupStatus = 'pending';
  if (readyForDelivery && cart.length > 0) {
    pickupStatus = 'complete';
  } else if (pickedUpItems > 0) {
    pickupStatus = 'partial';
  }

  return {
    readyForDelivery,
    pickupCompleted: readyForDelivery,
    pickupStatus,
  };
};

export default function VendorPickupDetailScreen() {
  const { vendorKey } = useLocalSearchParams<{ vendorKey: string }>();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);

    const q = query(
      collection(db, 'orders'),
      where('payed', '==', true),
      where('delivered', '==', false)
    );

    let isActive = true;

    const unsubscribe = onSnapshot(
      q,
      async (querySnapshot) => {
        const nextOrders: OrderData[] = [];

        querySnapshot.forEach((docSnapshot) => {
          const orderData = docSnapshot.data() as OrderData;
          orderData.id = docSnapshot.id;
          if (!orderData.deliverInfos) {
            orderData.deliverInfos = {} as DeliverInfo;
          }
          nextOrders.push(orderData);
        });

        nextOrders.sort((a, b) => (b.timeStamp?.seconds || 0) - (a.timeStamp?.seconds || 0));
        const hydratedOrders = await hydrateOrdersWithVendorProfiles(nextOrders);

        if (!isActive) {
          return;
        }

        setOrders(hydratedOrders);
        setLoading(false);
      },
      (error) => {
        console.error('Erreur lors du chargement du vendeur :', error);
        Alert.alert('Chargement impossible', 'Une erreur est survenue lors du chargement de cette collecte.');
        if (isActive) {
          setLoading(false);
        }
      }
    );

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [vendorKey]);

  const vendorGroup = useMemo(
    () => groupOrdersByVendor(orders, { includePicked: true }).find((group) => group.vendorKey === vendorKey),
    [orders, vendorKey]
  );

  const toggleItemSelection = (selectionKey: string) => {
    setSelectedItems((current) => ({
      ...current,
      [selectionKey]: !current[selectionKey],
    }));
  };

  const handleValidateVendorPickup = async () => {
    if (!vendorGroup) {
      Alert.alert('Vendeur introuvable', 'Cette collecte n’est plus disponible.');
      return;
    }

    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert('Session invalide', 'Reconnecte-toi avant de valider une collecte.');
      return;
    }

    const itemsToValidate = vendorGroup.items.filter((groupItem) =>
      selectedItems[getVendorGroupItemKey(vendorGroup.vendorKey, groupItem)]
    );

    if (!itemsToValidate.length) {
      Alert.alert('Aucune selection', 'Selectionne au moins un produit avant de valider la collecte.');
      return;
    }

    const nowIso = new Date().toISOString();
    const updatedOrders = new Map<string, OrderData>();
    const touchedOrderIds = new Set<string>();

    for (const order of orders) {
      updatedOrders.set(order.id, {
        ...order,
        cart: [...(order.cart ?? [])],
      });
    }

    for (const groupItem of itemsToValidate) {
      const sourceOrder = updatedOrders.get(groupItem.orderId);
      const nextCart = sourceOrder?.cart;

      if (!sourceOrder || !nextCart || !nextCart[groupItem.itemIndex]) {
        continue;
      }

      const currentItem = nextCart[groupItem.itemIndex];
      if (isItemPickedUp(currentItem)) {
        continue;
      }

      nextCart[groupItem.itemIndex] = {
        ...currentItem,
        vendorId: currentItem.vendorId ?? getVendorKey(currentItem),
        vendorName: currentItem.vendorName ?? getVendorLabel(currentItem),
        vendorAddress: currentItem.vendorAddress ?? vendorGroup.vendorAddress,
        vendorPhone: currentItem.vendorPhone ?? vendorGroup.vendorPhone,
        vendorNotes: currentItem.vendorNotes ?? vendorGroup.vendorNotes,
        pickedUp: true,
        pickedUpAt: nowIso,
        pickedUpByUid: currentUser.uid,
        pickedUpByEmail: currentUser.email ?? '',
        pickupValidatedByVendor: true,
        pickupValidatedAt: nowIso,
      };

      touchedOrderIds.add(groupItem.orderId);
    }

    if (!touchedOrderIds.size) {
      Alert.alert('Aucune mise a jour', 'Les produits selectionnes etaient deja marques comme recuperes.');
      return;
    }

    try {
      setSaving(true);
      const batch = writeBatch(db);

      for (const orderId of touchedOrderIds) {
        const updatedOrder = updatedOrders.get(orderId);
        if (!updatedOrder) {
          continue;
        }

        const pickupState = buildPickupState(updatedOrder);
        const payload: Record<string, unknown> = {
          cart: updatedOrder.cart ?? [],
          pickupUpdatedAt: serverTimestamp(),
          pickupCompleted: pickupState.pickupCompleted,
          readyForDelivery: pickupState.readyForDelivery,
          pickupStatus: pickupState.pickupStatus,
        };

        if (pickupState.readyForDelivery) {
          payload.pickupCompletedAt = serverTimestamp();
        }

        batch.update(doc(db, 'orders', orderId), payload);

        updatedOrder.pickupCompleted = pickupState.pickupCompleted;
        updatedOrder.readyForDelivery = pickupState.readyForDelivery;
        updatedOrder.pickupStatus = pickupState.pickupStatus;
      }

      await batch.commit();

      setSelectedItems((current) => {
        const nextSelection = { ...current };
        for (const groupItem of itemsToValidate) {
          delete nextSelection[getVendorGroupItemKey(vendorGroup.vendorKey, groupItem)];
        }
        return nextSelection;
      });

      const nextOrders = orders.map((order) => updatedOrders.get(order.id) ?? order);
      setOrders(nextOrders);

      const hasRemainingItems = groupOrdersByVendor(nextOrders).some(
        (group) => group.vendorKey === vendorGroup.vendorKey
      );

      if (!hasRemainingItems) {
        Alert.alert(
          'Collecte validee',
          `${itemsToValidate.length} produit(s) recuperes chez ${vendorGroup.vendorName}.`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      Alert.alert(
        'Collecte validee',
        `${itemsToValidate.length} produit(s) recuperes chez ${vendorGroup.vendorName}.`
      );
    } catch (error) {
      console.error('Erreur lors de la validation de la collecte :', error);
      Alert.alert('Validation impossible', 'La collecte n’a pas pu etre enregistree.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !orders.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff6f00" />
      </View>
    );
  }

  if (!vendorGroup) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: 'Collecte' }} />
        <Text style={styles.emptyTitle}>Vendeur introuvable</Text>
        <Text style={styles.emptyText}>Cette collecte n’existe plus ou a deja ete finalisee.</Text>
      </View>
    );
  }

  const uniqueOrders = new Set(vendorGroup.items.map((groupItem) => groupItem.orderId)).size;
  const pendingItems = vendorGroup.items.filter((groupItem) => !isItemPickedUp(groupItem.item)).length;
  const pickedItems = vendorGroup.items.length - pendingItems;
  const selectedCount = vendorGroup.items.filter((groupItem) =>
    selectedItems[getVendorGroupItemKey(vendorGroup.vendorKey, groupItem)]
  ).length;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: vendorGroup.vendorName }} />

      <FlatList
        data={vendorGroup.items}
        keyExtractor={(item) => getVendorGroupItemKey(vendorGroup.vendorKey, item)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>{vendorGroup.vendorName}</Text>
            <Text style={styles.heroMeta}>{vendorGroup.vendorAddress}</Text>
            <Text style={styles.heroMeta}>{vendorGroup.vendorPhone}</Text>
            <Text style={styles.heroSubtle}>
              {pendingItems} en attente, {pickedItems} deja recuperes sur {uniqueOrders} commande(s)
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const selectionKey = getVendorGroupItemKey(vendorGroup.vendorKey, item);
          const isSelected = selectedItems[selectionKey] ?? false;
          const itemAlreadyPicked = isItemPickedUp(item.item);

          return (
            <View style={styles.itemRow}>
              {!!item.item.img && (
                <Image
                  source={{ uri: item.item.img }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              )}
              <Checkbox
                value={itemAlreadyPicked || isSelected}
                onValueChange={() => toggleItemSelection(selectionKey)}
                color={itemAlreadyPicked ? '#14864d' : isSelected ? '#00B761' : undefined}
                disabled={itemAlreadyPicked}
              />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.item.name}</Text>
                <Text style={styles.itemLine}>{getItemQuantityLabel(item.item)}</Text>
                <Text style={styles.itemLine}>Commande: {item.orderScanNum}</Text>
                <Text style={styles.itemLine}>Client: {item.customerName}</Text>
                <Text style={styles.itemSubtle}>{item.customerAddress}</Text>
                <Text style={[styles.itemStatus, itemAlreadyPicked ? styles.itemStatusPicked : styles.itemStatusPending]}>
                  {itemAlreadyPicked ? 'Deja recupere' : 'En attente de collecte'}
                </Text>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <TouchableOpacity
            style={[styles.validateButton, (!selectedCount || saving) && styles.validateButtonDisabled]}
            disabled={!selectedCount || saving}
            onPress={handleValidateVendorPickup}
          >
            <Text style={styles.validateButtonText}>
              {saving
                ? 'Validation...'
                : selectedCount
                  ? `Valider ${selectedCount} produit(s)`
                  : 'Selectionnez les produits recuperes'}
            </Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f5f7',
  },
  centered: {
    alignItems: 'center',
    backgroundColor: '#f3f5f7',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: '#111827',
    borderRadius: 18,
    marginBottom: 18,
    padding: 18,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroMeta: {
    color: '#d7dde5',
    fontSize: 14,
    marginTop: 2,
  },
  heroSubtle: {
    color: '#f59e0b',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
  },
  emptyTitle: {
    color: '#1f2a37',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  itemRow: {
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  itemImage: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    height: 68,
    marginRight: 12,
    width: 68,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    color: '#152033',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemLine: {
    color: '#344054',
    fontSize: 14,
    marginTop: 2,
  },
  itemSubtle: {
    color: '#8a94a6',
    fontSize: 13,
    marginTop: 2,
  },
  itemStatus: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  itemStatusPending: {
    color: '#b26a00',
  },
  itemStatusPicked: {
    color: '#14864d',
  },
  validateButton: {
    alignItems: 'center',
    backgroundColor: '#00B761',
    borderRadius: 14,
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  validateButtonDisabled: {
    backgroundColor: '#b8c2cc',
  },
  validateButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
