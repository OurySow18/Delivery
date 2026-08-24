import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TextInput, Pressable, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { collection, getDocs, query, where, Timestamp } from '@firebase/firestore';
import { db } from '@/firebase';
import type { DeliverInfo, OrderData } from '@/constants/OrderWorkflow';

const ExploreScreen = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDeliveredOrders();
  }, []);

  const loadDeliveredOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const twoDaysAgoDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      const twoDaysAgo = Timestamp.fromDate(twoDaysAgoDate);

      const q = query(
        collection(db, 'archivedOrders'),
        where('deliveredAt', '>=', twoDaysAgo)
      );

      const snapshot = await getDocs(q);
      const result: OrderData[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data() as OrderData;
        data.id = doc.id;
        if (!data.deliverInfos) {
          data.deliverInfos = {} as DeliverInfo;
        }
        result.push(data);
      });

      result.sort((a, b) => {
        const ta = a.deliveredAt?.toDate?.().getTime?.() || a.timeStamp?.toDate?.().getTime?.() || 0;
        const tb = b.deliveredAt?.toDate?.().getTime?.() || b.timeStamp?.toDate?.().getTime?.() || 0;
        return tb - ta;
      });

      setOrders(result);
    } catch (e) {
      console.error('Erreur chargement commandes livrées :', e);
      setError("Impossible de charger les commandes livrées.");
    } finally {
      setLoading(false);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const filteredOrders = orders.filter((order) =>
    (order.deliverInfos?.name ?? '').toLowerCase().includes(normalizedSearch)
  );

  if (loading && !orders.length) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Historique' }} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Commandes livrées (48h)</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par nom..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {error && (
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{error}</Text>
      )}

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadDeliveredOrders} />
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
                    <Text style={styles.totalAmount}>Total: {item.total?.toFixed(2)} GNF</Text>
                  </View>
                </View>
              </Pressable>
            </Link>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucune commande livrée récemment.</Text>}
      />
    </View>
  );
};

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
    fontSize: 26,
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

export default ExploreScreen;
