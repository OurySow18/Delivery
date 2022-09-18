 /**
 * Abgabe Bachelorarbeit
 * Author: Amadou Oury Sow
 * Date: 15.09.2022
 * 
 * Die Details einer ausgewählte Bestellung werden hier gezeigt
 */
import React from 'react'
import {
  View,
  TouchableHighlight,
  Text,
  StyleSheet, 
} from 'react-native';
import COLORS from '../assets/const/colors';
const OrderDetails = () => {
  return (
    <View>
      <TouchableHighlight
      activeOpacity={2} 
      underlayColor={COLORS.accentColor}      
      style={{ marginBottom: 30}}
      onPress={props.viewDetails}
    >
        <View style={{
         display: 'flex',                          
         backgroundColor: "white",                        
         justifyContent:"space-between",
         height: 50,
         width: 80,             
         marginTop: 10, 
         marginLeft: 15, 
         padding: 15, 
        }}>           
            <View style={styles.orderContainerDetails}>
             <Text style={styles.orderTitel}>{props.orderId}</Text>
             <Text style={ styles.orderTitel}> {props.userId} </Text>
             <Text style={ styles.orderPrice}>{props.total} $</Text>
           </View> 
        </View>
    </TouchableHighlight>
    </View>
  )
}
const styles = StyleSheet.create({
 
orderTitel: {
  justifyContent:'space-between',
  alignItems:'center',
  fontSize: 14,
  marginVertical: 2,
  color: COLORS.accentColor,
  fontWeight: 'bold',
  textTransform: 'uppercase',
},
orderPrice: {
  color:  "darkGrey",
  fontSize: 16,
  fontSize: 15, fontWeight: "bold" 
},
orderContainerDetails: {
  alignItems: 'center',
  height: '20%',
  padding: 10
},
});

export default OrderDetails 