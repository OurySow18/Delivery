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
  
  export {auth, db};