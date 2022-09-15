import React from 'react'  
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignIn from './SignIn';
import { AppNav } from '../navigation/AppNav';

const stack = createNativeStackNavigator()
function Home  () {
  return(
     <NavigationContainer>
        <stack.Navigator
        screenOptions={{
          headerShown: false,             
          tabBarStyle: { backgroundColor: '#ff6f00' },
          headerTintColor: "white",
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: 'black',
          tabBarInactiveBackgroundColor: '#ff4f00'
      }}>
          <stack.Screen name="SignIn"
            component={SignIn}/>
          <stack.Screen name="Delivery"
            component={AppNav}/>
        </stack.Navigator>         
  </NavigationContainer>
  )
 
}

export default Home