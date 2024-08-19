import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import Checkbox from 'expo-checkbox';

interface ProductData {
    id: string;
    objectID: string;
    description: string;
    img: string;
    name: string;
    poids: string;
    price: string;
    nbUnit: string;
    priceWholesale: string;
    category: string;
    content: string;
    status: boolean;
}

interface DeliverInfo {
    name: string;
    address: string;
    phone: string;
}

interface CartItem {
    productId: string;
    name: string;
    priceDetail: string;
    priceBulk: string;
    quantityDetail: number;
    quantityBulk: number;
    amountDetail: string;
    amountBulk: string;
    totalAmount: string;
    description: string;
    img: string;
    poids: string;
    nbUnit: string;
    category: string;
    content: string;
    selectedOption: "details" | "bulk";
    secondQuantity: number;
}

interface OrderData {
    id: string;
    userId: string;
    orderDetails: string;
    payed: boolean;
    delivered: boolean;
    orderId: string;
    paymentMethod: string;
    paymentType: string;
    total: number;
    cart?: CartItem[];
    timeStamp?: any;
    deliverInfos?: DeliverInfo;
}

const OrderInfos = () => {
    const { objectID } = useLocalSearchParams<{ objectID: string }>();
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [isDelivered, setIsDelivered] = useState(false)

    useEffect(() => {
        if (!objectID) return;
        loadOrders();
    }, [objectID]);

    const loadOrders = async () => {
        try {
            const q = query(collection(db, "orders"), where("scanNum", "==", objectID));
            const querySnapshot = await getDocs(q);
            const userOrders: OrderData[] = [];
            querySnapshot.forEach((doc) => {
                const orderData = doc.data() as OrderData;
                orderData.id = doc.id;
                if (!orderData.deliverInfos) {
                    orderData.deliverInfos = {} as DeliverInfo;
                }
                if (orderData.delivered) {
                    setIsDelivered(true)
                }
                userOrders.push(orderData);
            });
            userOrders.sort((a, b) => (b.timeStamp?.seconds || 0) - (a.timeStamp?.seconds || 0));
            setOrders(userOrders);
            setLoading(false);
        } catch (error) {
            console.error("Erreur lors du chargement des commandes :", error);
        }
    };

    const handleCheckboxChange = (productId: string) => {
        setCheckedItems((prevCheckedItems) => ({
            ...prevCheckedItems,
            [productId]: !prevCheckedItems[productId],
        }));
    };

    const allItemsChecked = () => {
        return orders[0]?.cart?.every((item) => checkedItems[item.productId]);
    };

    const handleValidation = async () => {
        if (allItemsChecked()) {
            alert("Tous les produits sont validés !");
            if (orders.length > 0) {
                try {
                    const orderRef = doc(db, "orders", orders[0].id);
                    await updateDoc(orderRef, { delivered: true });
                    alert("La commande a été marquée comme livrée.");
                    router.navigate('/(orders)')
                } catch (error) {
                    console.error("Erreur lors de la mise à jour de la commande :", error);
                    alert("Une erreur est survenue lors de la validation de la livraison.");
                }
            }
        } else {
            alert("Veuillez valider tous les produits avant de soumettre la commande.");
        }
    };

    if (loading) {
        return <Text style={styles.loadingText}>Loading...</Text>;
    }
    console.log(orders[0].id)
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Details Commande</Text>
            {isDelivered ? (
                <Text style={styles.deliveredText}>Cette commande a déjà été livrée.</Text>
            ) : (
                <>
                    <FlatList
                        data={orders[0]?.cart}
                        keyExtractor={(item) => item.productId}
                        renderItem={({ item }) => (
                            <View style={styles.itemContainer}>
                                <Checkbox
                                    value={checkedItems[item.productId] || false}
                                    onValueChange={() => handleCheckboxChange(item.productId)}
                                    color={checkedItems[item.productId] ? '#4CAF50' : undefined}
                                />
                                <View style={styles.textContainer}>
                                    {item.quantityBulk > 0 && (
                                        <Text style={[styles.itemText, styles.cartonText]}>
                                            {item.quantityBulk} x {item.name} {item.poids} - {item.amountBulk} GNF (Carton)
                                        </Text>
                                    )}
                                    {item.quantityDetail > 0 && (
                                        <Text style={[styles.itemText, styles.detailsText]}>
                                            {item.quantityDetail} x {item.name} {item.poids} - {item.amountDetail} GNF (Détails)
                                        </Text>
                                    )}
                                </View>
                            </View>
                        )}
                    />
                    <TouchableOpacity
                        style={[styles.button, !allItemsChecked() && styles.buttonDisabled]}
                        onPress={handleValidation}
                        disabled={!allItemsChecked()}
                    >
                        <Text style={styles.buttonText}>Valider la commande</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#F5F5F5',
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#333',
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      backgroundColor: '#FFFFFF',
      padding: 10,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    textContainer: {
      marginLeft: 10,
      flex: 1,
    },
    itemText: {
      fontSize: 16,
      color: '#555',
    },
    cartonText: {
      color: '#FF9800',
    },
    detailsText: {
      color: '#2196F3',
    },
    button: {
      marginTop: 20,
      backgroundColor: '#4CAF50',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonDisabled: {
      backgroundColor: '#BDBDBD',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    loadingText: {
      fontSize: 18,
      color: '#555',
      textAlign: 'center',
      marginTop: 20,
    },
    deliveredText: {
      fontSize: 18,
      color: '#4CAF50',
      textAlign: 'center',
      marginTop: 20,
    },
  });
export default OrderInfos;
