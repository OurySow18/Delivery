import {  FlatList, View, SafeAreaView } from 'react-native'
import React, {useEffect, useState} from 'react'

import OrderItem from '../components/OrderItem'
import EmptyMsg from "./EmptyMsg"
import { collection, onSnapshot  } from "firebase/firestore";
import {db} from "../firebase";

const Delivered = () => {
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
  const productToDisplay = data.filter( product => product.status === true && product.stock > 0)
  if (productToDisplay.length) {

  return (
    <SafeAreaView>
    <View>
      <FlatList
        data={productToDisplay}
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

return <EmptyMsg text="No Order delivered" />
}
export default Delivered
 