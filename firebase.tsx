/**
 * Abgabe Bachelorarbeit
 * Author: Amadou Oury Sow
 * Date: 15.09.2022
 * 
 * Firebase konfiguration
 */

//importiert alle notwendige Tools für die Benutzung von Firebase im Projekt
import { getApp, getApps, initializeApp } from "@firebase/app";
import '@firebase/auth';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from '@firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, initializeFirestore } from '@firebase/firestore';


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

  
  
  // Initialisiert Firebase App nur einmal (important with Fast Refresh / HMR)
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

  // Firestore: try custom RN settings once, then fallback to existing instance.
  const db = (() => {
    try {
      return initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });
    } catch {
      return getFirestore(app);
    }
  })();

  // Auth is lazily initialized to avoid crashing route module evaluation.
  let authInstance: Auth | null = null;
  const getFirebaseAuth = (): Auth => {
    if (authInstance) {
      return authInstance;
    }

    try {
      authInstance = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
      });
    } catch (error: any) {
      if (error?.code === 'auth/already-initialized') {
        authInstance = getAuth(app);
      } else {
        throw error;
      }
    }

    return authInstance;
  };
  
  /**
   * Diese zwei Variable werden überall importiert, wo wir mit Firebase arbeiten möchten
   */
  
//export const FIREBASE_DB = getFirestore(app);
  export { db, getFirebaseAuth };
