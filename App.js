import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaView } from 'react-native';
import { Provider } from 'react-redux';
import store from './redux/store';
import Home from './screens/Home';

export default function App() {
 
  return (
    <Provider store={store}>
       <SafeAreaView style={{backgroundColor:"#eee", flex: 1}}>
       <Home />
       </SafeAreaView>
    </Provider>
  );  
}