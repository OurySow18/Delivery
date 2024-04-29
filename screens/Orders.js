/**
 * Abgabe Bachelorarbeit
 * Author: Amadou Oury Sow
 * Date: 15.09.2022
 * 
 * Hier wird alle Bestellungen angezeigt
 */
import {  FlatList, View, SafeAreaView } from 'react-native'
import React, {useEffect, useState} from 'react'

import OrderItem from '../components/OrderItem'
import EmptyMsg from "./EmptyMsg"
import { collection, onSnapshot  } from "firebase/firestore";
import {db} from "../firebase";

const Orders = ({navigation}) => {
  const [data, setData] = useState([]);
  useEffect(() =>{
    const unsub = onSnapshot(
      collection(db, "orders"), 
      (snapShot) => {
      let list = [];
      snapShot.docs.forEach((doc)=>{
        list.push({ id: doc.id, ...doc.data() });
      });
      setData(list); 
    }, 
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, ["orders"]);
  const orderToDisplay = data.filter( product => product.status === true && product.payed === true)
  console.log(orderToDisplay[1])
  if (orderToDisplay.length) {

  return (
    <SafeAreaView>
    <View>
      <FlatList
        data={orderToDisplay}
        numColumns={2}
       
        renderItem={({ item }) => (
          <OrderItem                
             /> 
  )
}/>

</View>
        </SafeAreaView>
  )
}

return <EmptyMsg text="No Order" />
}
export default Orders
 