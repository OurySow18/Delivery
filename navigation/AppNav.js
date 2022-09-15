import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"; 
import Orders from "../screens/Orders"
import OrderDetails from "../screens/OrderDetails"
import Delivered from "../screens/Delivered";


const Tab = createBottomTabNavigator();

export const AppNav = () =>{
    return(
            <Tab.Navigator
        screenOptions={{
            headerShown: false,             
            tabBarStyle: { backgroundColor: '#ff6f00' },
            headerTintColor: "white",
            tabBarActiveTintColor: '#fff',
            tabBarInactiveTintColor: 'black',
            tabBarInactiveBackgroundColor: '#ff4f00'
        }}
        >             
            <Tab.Screen
            name="Orders"
            component={Orders}/>
            
            <Tab.Screen
            name="Delivered"
            component={Delivered}/>
        </Tab.Navigator>
    )
} 