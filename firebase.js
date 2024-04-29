/**
 * Abgabe Bachelorarbeit
 * Author: Amadou Oury Sow
 * Date: 15.09.2022
 * 
 * Firebase konfiguration
 */

//importiert alle notwendige Tools für die Benutzung von Firebase im Projekt
import { initializeApp } from "firebase/app" 
import { getAuth } from "firebase/auth";
import {initializeFirestore} from 'firebase/firestore';
const firebaseConfig = {

  apiKey: "AIzaSyDCENsh0tZlNtbcNAZZHqt1RtkNIsWsNuE",

  authDomain: "monmarhe.firebaseapp.com",

  projectId: "monmarhe",

  storageBucket: "monmarhe.appspot.com",

  messagingSenderId: "810364309186",

  appId: "1:810364309186:web:29c2ffbcdf7bb17cdb755b",

  measurementId: "G-PZ6PL043EE"

};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
  });
    
  /**
   * Diese zwei Variable werden überall importiert, wo wir mit Firebase arbeiten möchten
   */
  export {auth, db};