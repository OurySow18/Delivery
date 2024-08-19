/**
 * Abgabe Bachelorarbeit
 * Author: Amadou Oury Sow
 * Date: 15.09.2022
 * 
 * Firebase konfiguration
 */

//importiert alle notwendige Tools für die Benutzung von Firebase im Projekt
import { initializeApp } from "firebase/app" 
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {getFirestore, initializeFirestore } from 'firebase/firestore';


 // Packet die Zugriffsinformationen unseres Firebase-Projekts in die Variable firebaseConfig, die Daten sind für jedes Projekt unterschiedlich
 const firebaseConfig = {

  apiKey: "AIzaSyDCENsh0tZlNtbcNAZZHqt1RtkNIsWsNuE",

  authDomain: "monmarhe.firebaseapp.com",

  projectId: "monmarhe",

  storageBucket: "monmarhe.appspot.com",

  messagingSenderId: "810364309186",

  appId: "1:810364309186:web:29c2ffbcdf7bb17cdb755b",

  measurementId: "G-PZ6PL043EE"

};

  
  
  // Initialisiert Firebase
  
  const app = initializeApp(firebaseConfig);
  const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
  const db = initializeFirestore(app, {
    experimentalForceLongPolling: true, 
  });
  
  /**
   * Diese zwei Variable werden überall importiert, wo wir mit Firebase arbeiten möchten
   */
  
//export const FIREBASE_DB = getFirestore(app);
  export {auth, db};   