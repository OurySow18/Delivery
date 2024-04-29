import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Orders from "../screens/Orders";
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import OrderDetails from "../screens/OrderDetails";
import Delivered from "../screens/Delivered";
import ScannerScreen from "../screens/ScannerScreen";
import AntDesign from "react-native-vector-icons/AntDesign";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export const AppNav = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#ff6f00" },
        headerTintColor: "white",
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "black",
        tabBarInactiveBackgroundColor: "#ff4f00",
      }} 
    >
      <Tab.Screen
        name="Orders"
        component={Orders}
        options={{
          title: "Monmarche",
          tabBarLabel: "Ä livrer",
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons name="truck-delivery-outline" size={focused ? 40 : 24}  color="black" />
          ),
        }}
      />
         <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          tabBarLabel: 'Scanner',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="qrcode-scan" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Delivered"
        component={Delivered}
        options={{
          title: "Monmarche",
          tabBarLabel: "Dejä livrer",
          tabBarIcon: ({ focused }) => (
            <MaterialIcons name="inventory" size={focused ? 40 : 24}  color="black" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
 