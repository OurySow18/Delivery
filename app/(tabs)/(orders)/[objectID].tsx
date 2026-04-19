import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, doc, getDocs, query, serverTimestamp, where, writeBatch } from '@firebase/firestore';
import { db } from '@/firebase';
import Checkbox from 'expo-checkbox';
import { getItemQuantityLabel, getPickupSummary, isItemPickedUp, type DeliverInfo, type OrderData } from '@/constants/OrderWorkflow';

const OrderInfos = () => {
    const { objectID } = useLocalSearchParams<{ objectID: string }>();
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [isDelivered, setIsDelivered] = useState(false)

    useEffect(() => {
        if (!objectID) {
            setLoading(false);
            return;
        }
        loadOrders();
    }, [objectID]);

    const loadOrders = async () => {
        setLoading(true);
        setIsDelivered(false);
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

            if (userOrders.length > 1) {
                console.warn(`Plusieurs commandes trouvées pour scanNum ${objectID}. La plus récente sera utilisée.`);
            }

            setOrders(userOrders);
        } catch (error) {
            console.error("Erreur lors du chargement des commandes :", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (productId: string) => {
        setCheckedItems((prevCheckedItems) => ({
            ...prevCheckedItems,
            [productId]: !prevCheckedItems[productId],
        }));
    };

    const allItemsChecked = () => {
        return orders[0]?.cart?.every((item) => checkedItems[item.productId]) ?? false;
    };


    const handleValidation = async () => {
        if (!orders.length) {
            alert("Commande introuvable.");
            return;
        }

        if (allItemsChecked()) {
            alert("Tous les produits sont validés !");
            try {
                const latestOrder = orders[0];
                const orderRef = doc(db, "orders", latestOrder.id);
                const archivedOrderRef = doc(db, "archivedOrders", latestOrder.id);
                const deliveredAt = serverTimestamp();
                const archivedAt = serverTimestamp();

                const batch = writeBatch(db);
                batch.set(archivedOrderRef, {
                    ...latestOrder,
                    id: latestOrder.id,
                    archivedOrder: true,
                    delivered: true,
                    deliveredAt,
                    archivedAt,
                    sourceOrderId: latestOrder.id,
                });
                batch.delete(orderRef);

                await batch.commit();
                alert("La commande a été archivée et retirée des commandes actives.");
                router.replace('/(tabs)/(orders)');
            } catch (error) {
                console.error("Erreur lors de la mise à jour de la commande :", error);
                alert("Une erreur est survenue lors de l'archivage de la commande.");
            }
        } else {
            alert("Veuillez valider tous les produits avant de soumettre la commande.");
        }
    };

    if (loading) {
        return <Text style={styles.loadingText}>Loading...</Text>;
    }

    if (!orders.length) {
        return (
            <View style={styles.container}>
                <Text style={styles.header}>Details Commande</Text>
                <Text style={styles.emptyText}>Aucune commande trouvée pour ce QR code.</Text>
            </View>
        );
    }

    const pickupSummary = getPickupSummary(orders[0]);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Details Commande</Text>
            <View style={[styles.pickupBanner, pickupSummary.readyForDelivery ? styles.pickupBannerReady : styles.pickupBannerPending]}>
                <Text style={styles.pickupBannerTitle}>
                    {pickupSummary.readyForDelivery ? 'Commande prête à livrer' : 'Collecte en attente'}
                </Text>
                <Text style={styles.pickupBannerText}>
                    {pickupSummary.hasTrackedPickup
                        ? `${pickupSummary.pickedUpItems}/${pickupSummary.totalItems} produits récupérés`
                        : 'Commande legacy sans suivi de collecte'}
                </Text>
            </View>
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
                                    <Text style={styles.itemTitle}>{item.name}</Text>
                                    <Text style={styles.itemText}>{getItemQuantityLabel(item)}</Text>
                                    {!!item.vendorName && (
                                        <Text style={styles.itemMeta}>Vendeur: {item.vendorName}</Text>
                                    )}
                                    <Text style={[styles.itemMeta, isItemPickedUp(item) ? styles.itemPicked : styles.itemPending]}>
                                        {isItemPickedUp(item) ? 'Recupéré' : 'En attente de collecte'}
                                    </Text>
                                </View>
                            </View>
                        )}
                    />
                    <TouchableOpacity
                        style={[styles.button, (!allItemsChecked() || !pickupSummary.readyForDelivery) && styles.buttonDisabled]}
                        onPress={handleValidation}
                        disabled={!allItemsChecked() || !pickupSummary.readyForDelivery}
                    >
                        <Text style={styles.buttonText}>
                            {!pickupSummary.readyForDelivery
                                ? "Collecte incomplète"
                                : allItemsChecked()
                                    ? "Valider la commande"
                                    : "Cochez tous les produits"}
                        </Text>

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
    pickupBanner: {
        borderRadius: 14,
        marginBottom: 16,
        padding: 14,
    },
    pickupBannerReady: {
        backgroundColor: '#dff4e4',
    },
    pickupBannerPending: {
        backgroundColor: '#fff1de',
    },
    pickupBannerTitle: {
        color: '#2b2b2b',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    pickupBannerText: {
        color: '#555',
        fontSize: 14,
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
    itemTitle: {
        color: '#333',
        fontSize: 16,
        fontWeight: '700',
    },
    itemMeta: {
        color: '#666',
        fontSize: 13,
        marginTop: 4,
    },
    itemPicked: {
        color: '#14864d',
    },
    itemPending: {
        color: '#b26a00',
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
    emptyText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginTop: 20,
    },
});
export default OrderInfos;
