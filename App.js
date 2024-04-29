/**
 * Abgabe Bachelorarbeit
 * Author: Amadou Oury Sow
 * Date: 15.09.2022
 * 
 * Die App.js ist die erste Komponent, die bei der Ausführung aufgerufen wird.
 * Mit Hilfe von Redux, fügen wir under store hier hinzu, damit überall im Projekt auf den Store zugegriffen werden kann
 * Nur die Home Seite wird hier aufgerufen
 */
import React from "react";
import "./firebase";
import { NativeBaseProvider } from "native-base"; 
import { SafeAreaView } from 'react-native';
import store from './redux/store';
import { Provider } from 'react-redux';
import 'react-native-gesture-handler'; 
import Home from './screens/Home'; 
import persistStore from "redux-persist/es/persistStore";
import { PersistGate } from "redux-persist/integration/react";   
 
let persistor = persistStore(store); 

export default function App() {  

 return (
   <Provider store={store}>      
   <NativeBaseProvider>
      <SafeAreaView style={{backgroundColor:"#eee", flex: 1}}>
       <PersistGate persistor={persistor}>
         <Home />
      </PersistGate>
      </SafeAreaView>
      </NativeBaseProvider>
   </Provider>
 );  
}