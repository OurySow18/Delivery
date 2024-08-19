import  { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router'; 
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase';
 

interface Order {
  id: string;
  objectID: string;
  total: number;
  payed: boolean;
  deliverInfos: DeliverInfo;
}

// Définir une interface pour les données de commande
interface CartItem {
  name: string;
  poids: number;
  price: number;
  img: string;
  priceDetail: number;
  amountDetail: number;
  quantityDetail: number;
  priceBulk: number;
  amountBulk: number;
  quantityBulk: number;
  totalAmount: number;
}

interface DeliverInfo {
  name: string;
  address: string;
  phone: string;
  additionalInfo: string;
}

interface OrderData {
  id: string;
  userId: string;
  orderDetails: string;
  payed: boolean;
  delivered: boolean;
  orderId: string;
  scanNum: string;
  paymentMethod: string;
  paymentType: string;
  total: number;
  cart?: CartItem[];
  timeStamp?: any;
  deliverInfos?: DeliverInfo;
}



const OrdersScreen = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const q = query(collection(db, "orders"),
                       where("payed", "==", true),
                       where("delivered", "==", false)
                      );
      const querySnapshot = await getDocs(q);
      const userOrders: OrderData[] = [];
      querySnapshot.forEach((doc) => {
        const orderData = doc.data() as OrderData;
        orderData.id = doc.id;
        // Initialiser deliverInfos si non défini
        if (!orderData.deliverInfos) {
          orderData.deliverInfos = {} as DeliverInfo;
        }
        userOrders.push(orderData);
        setLoading(false);
      });
      // Trier les commandes par timestamp de la plus récente à la plus ancienne
      userOrders.sort((a, b) => (b.timeStamp?.seconds || 0) - (a.timeStamp?.seconds || 0));
      setOrders(userOrders);
    } catch (error) {
      console.error("Erreur lors du chargement des commandes :", error);
    }
  };

  const filteredOrders = orders.filter(order =>
    order?.deliverInfos?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Monmarche" }} />
      <View style={styles.header}>        
        <Text style={styles.headerTitle}>Commandes à livrer</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by customer name..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Link
              key={item.id}
              href={{ pathname: `/${item.scanNum}`, params: { id: item.id } }}
              asChild>
              <Pressable>
                <View style={styles.cardContent}>
                  <Text style={styles.orderId}>No Commande: {item.id}</Text>
                  <Text style={styles.customerName}>Nom: {item.deliverInfos?.name}</Text>
                  <View style={styles.deliveryInfo}>
                    <Text style={styles.deliveryTitle}>Information de livraison:</Text>
                    <Text style={styles.deliveryText}>Adresse: {item.deliverInfos?.address}</Text>
                    <Text style={styles.deliveryText}>Téléphone: {item.deliverInfos?.phone}</Text>
                    {item.deliverInfos?.additionalInfo && (
                      <Text style={styles.deliveryText}>Info supplémentaires: {item.deliverInfos?.additionalInfo}</Text>
                    )}
                    <Text style={styles.payedStatus}>
                      Payé: {item.payed ? '✅ Oui' : '❌ Non'}
                    </Text>
                    <Text style={styles.payedStatus}>
                      Livré: {item.delivered ? '✅ Oui' : '❌ Non'}
                    </Text>
                    <Text style={styles.totalAmount}>Total: ${item.total?.toFixed(2)}</Text>
                  </View>
                </View>
              </Pressable>
            </Link>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No orders found.</Text>}
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
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default OrdersScreen;
