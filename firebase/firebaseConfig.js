// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBoDtXISwD-eJ74tl2L5Ki0UOVUUe9zZ4",
  authDomain: "api-ricky-morty.firebaseapp.com",
  projectId: "api-ricky-morty",
  storageBucket: "api-ricky-morty.firebasestorage.app",
  messagingSenderId: "1082699929288",
  appId: "1:1082699929288:web:721833826ae7eadca177fd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Export para usar en otros componentes
export { auth, db };