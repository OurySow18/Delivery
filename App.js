/**
 * Abgabe Bachelorarbeit
 * Author: Amadou Oury Sow
 * Date: 15.09.2022
 * 
 * Die App.js ist die erste Komponent, die bei der Ausführung aufgerufen wird.
 * Mit Hilfe von Redux, fügen wir under store hier hinzu, damit überall im Projekt auf den Store zugegriffen werden kann
 * Nur die Home Seite wird hier aufgerufen
 */
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