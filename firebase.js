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
  
  export {auth, db};