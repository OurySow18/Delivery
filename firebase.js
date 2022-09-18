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

  apiKey: apiKey,
  
  authDomain: authDomain,

  projectId: projectId,

  storageBucket: storageBucket,

  messagingSenderId: messagingSenderId,

  appId: appId
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