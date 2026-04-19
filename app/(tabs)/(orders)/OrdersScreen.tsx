import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TextInput, Pressable, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { collection, getDocs, query, where } from '@firebase/firestore';
import { db } from '@/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPickupSummary, type DeliverInfo, type OrderData } from '@/constants/OrderWorkflow';

const OrdersScreen = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    loadOrders();
    loadSortDirection();
  }, []);

  const loadSortDirection = async () => {
    try {
      const saved = await AsyncStorage.getItem('sortDirection');
      if (saved === 'asc' || saved === 'desc') {
        setSortDirection(saved);
      }
    } catch (e) {
      console.warn('Erreur chargement préférence tri :', e);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const q = query(
        collection(db, "orders"),
        where("payed", "==", true),
        where("delivered", "==", false)
      );
      const querySnapshot = await getDocs(q);
      const userOrders: OrderData[] = [];

      querySnapshot.forEach((doc) => {
        const orderData = doc.data() as OrderData;
        orderData.id = doc.id;
        if (!orderData.deliverInfos) {
          orderData.deliverInfos = {} as DeliverInfo;
        }
        userOrders.push(orderData);
      });

      setOrders(userOrders);
    } catch (err) {
      console.error("Erreur lors du chargement des commandes :", err);
      setError("Une erreur est survenue lors du chargement des commandes.");
    } finally {
      setLoading(false);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const deliverableOrders = orders.filter((order) => getPickupSummary(order).readyForDelivery);
  const filteredOrders = deliverableOrders
    .filter((order) =>
      (order.deliverInfos?.name ?? '').toLowerCase().includes(normalizedSearch)
    )
    .sort((a, b) => {
      const aTime = a.timeStamp?.seconds || 0;
      const bTime = b.timeStamp?.seconds || 0;
      return sortDirection === 'desc' ? bTime - aTime : aTime - bTime;
    });

  if (loading && !orders.length) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Monmarche" }} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Commandes prêtes à livrer</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by customer name..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <Pressable
          onPress={async () => {
            const newDir = sortDirection === 'desc' ? 'asc' : 'desc';
            setSortDirection(newDir);
            await AsyncStorage.setItem('sortDirection', newDir);
          }}
        >
          <Text style={{ color: '#007aff', fontWeight: '600', marginTop: 10 }}>
            Trier par date ({sortDirection === 'desc' ? '↓ récent' : '↑ ancien'})
          </Text>
        </Pressable>
      </View>

      {error && (
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{error}</Text>
      )}

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadOrders} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Link
              key={item.id}
              href={{ pathname: '/[objectID]', params: { objectID: item.scanNum } }}
              asChild
            >
              <Pressable>
                <View style={styles.cardContent}>
                  {(() => {
                    const pickup = getPickupSummary(item);
                    return (
                      <View style={[styles.pickupBadge, pickup.pickupStatus === 'complete' ? styles.pickupBadgeReady : styles.pickupBadgePending]}>
                        <Text style={styles.pickupBadgeText}>
                          {pickup.hasTrackedPickup
                            ? `Collecte ${pickup.pickedUpItems}/${pickup.totalItems}`
                            : 'Collecte legacy'}
                        </Text>
                      </View>
                    );
                  })()}
                  <Text style={styles.orderId}>Email Commande: {item.mail_invoice}</Text>
                  <Text style={styles.customerName}>Nom: {item.deliverInfos?.name}</Text>
                  <View style={styles.deliveryInfo}>
                    <Text style={styles.deliveryTitle}>Information de livraison:</Text>
                    <Text style={styles.deliveryText}>Adresse: {item.deliverInfos?.address}</Text>
                    <Text style={styles.deliveryText}>Téléphone: {item.deliverInfos?.phone}</Text>
                    {item.deliverInfos?.additionalInfo && (
                      <Text style={styles.deliveryText}>Info supplémentaires: {item.deliverInfos?.additionalInfo}</Text>
                    )}
                    <Text style={styles.payedStatus}>Payé: {item.payed ? '✅ Oui' : '❌ Non'}</Text>
                    <Text style={styles.payedStatus}>Livré: {item.delivered ? '✅ Oui' : '❌ Non'}</Text>
                    <Text style={styles.payedStatus}>Collecte terminée: {getPickupSummary(item).readyForDelivery ? '✅ Oui' : '❌ Non'}</Text>
                    <Text style={styles.totalAmount}>Total: ${item.total?.toFixed(2)}</Text>
                  </View>
                </View>
              </Pressable>
            </Link>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucune commande prête à livrer.</Text>}
      />
    </View>
  );
};
// 1F:B6:8E:44:41:BC:F4:97:B6:74:25:92:7D:9B:F9:0C:58:EA:36:7B:15:B8:7B:C5:D5:4E:43:AD:3D:F0:69:EB
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  searchInput: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'column',
  },
  pickupBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pickupBadgeReady: {
    backgroundColor: '#d7f5df',
  },
  pickupBadgePending: {
    backgroundColor: '#fff0d9',
  },
  pickupBadgeText: {
    color: '#444',
    fontSize: 12,
    fontWeight: '700',
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  customerName: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  payedStatus: {
    fontSize: 16,
    marginTop: 5,
    color: '#888',
  },
  deliveryInfo: {
    marginTop: 10,
    paddingTop: 10,
    borderTopColor: '#eee',
    borderTopWidth: 1,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
  },
  deliveryText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#10e82d',
    marginTop: 20,
  },
});

export default OrdersScreen;
