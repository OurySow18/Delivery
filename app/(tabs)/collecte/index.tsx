import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { collection, onSnapshot, query, where } from '@firebase/firestore';

import {
  groupOrdersByVendor,
  type DeliverInfo,
  type OrderData,
} from '@/constants/OrderWorkflow';
import { hydrateOrdersWithVendorProfiles } from '@/constants/VendorDirectory';
import { db } from '@/firebase';

export default function CollecteScreen() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

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
        console.error('Erreur lors du chargement des collectes :', error);
        Alert.alert('Chargement impossible', 'Une erreur est survenue lors du chargement des collectes.');
        if (isActive) {
          setLoading(false);
        }
      }
    );

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  const vendorGroups = useMemo(() => groupOrdersByVendor(orders), [orders]);

  if (loading && !orders.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff6f00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Collecte' }} />

      <FlatList
        data={vendorGroups}
        keyExtractor={(item) => item.vendorKey}
        contentContainerStyle={vendorGroups.length ? styles.listContent : styles.emptyListContent}
        ListHeaderComponent={
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Collecte</Text>
            <Text style={styles.heroText}>
              Affiche les vendeurs a visiter en premier. Le detail produit et la validation se font ensuite sur la fiche vendeur.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Aucune collecte en attente</Text>
            <Text style={styles.emptyText}>
              Tous les produits suivis sont deja recuperes ou les vendeurs ne sont pas encore renseignes.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const uniqueOrders = new Set(item.items.map((groupItem) => groupItem.orderId)).size;

          return (
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.vendorCard}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/collecte/[vendorKey]',
                  params: { vendorKey: item.vendorKey },
                })
              }
            >
              <View style={styles.vendorHeader}>
                <View style={styles.vendorBadge}>
                  <Text style={styles.vendorBadgeText}>{uniqueOrders} commande(s)</Text>
                </View>
                <Text style={styles.vendorName}>{item.vendorName}</Text>
                <Text style={styles.vendorMeta}>{item.vendorAddress}</Text>
                <Text style={styles.vendorMeta}>{item.vendorPhone}</Text>
              </View>

              <View style={styles.statsRow}>
                <View style={[styles.statCard, styles.statCardLeft]}>
                  <Text style={styles.statValue}>{item.items.length}</Text>
                  <Text style={styles.statLabel}>Produits a recuperer</Text>
                </View>
                <View style={[styles.statCard, styles.statCardRight]}>
                  <Text style={styles.statValue}>{uniqueOrders}</Text>
                  <Text style={styles.statLabel}>Commandes concernees</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <Text style={styles.actionText}>Voir details et valider</Text>
              </View>
            </TouchableOpacity>
          );
        }}
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
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyListContent: {
    flexGrow: 1,
    padding: 16,
  },
  hero: {
    backgroundColor: '#1f2a37',
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
  heroText: {
    color: '#d7dde5',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    justifyContent: 'center',
    marginTop: 12,
    padding: 24,
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
  vendorCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  vendorHeader: {
    marginBottom: 14,
  },
  vendorBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff0dd',
    borderRadius: 999,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  vendorBadgeText: {
    color: '#b35c00',
    fontSize: 12,
    fontWeight: '700',
  },
  vendorName: {
    color: '#152033',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  vendorMeta: {
    color: '#667085',
    fontSize: 14,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    flex: 1,
    padding: 14,
  },
  statCardLeft: {
    marginRight: 6,
  },
  statCardRight: {
    marginLeft: 6,
  },
  statValue: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 18,
  },
  actionRow: {
    borderTopColor: '#eef1f4',
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 14,
  },
  actionText: {
    color: '#00B761',
    fontSize: 14,
    fontWeight: '700',
  },
});
