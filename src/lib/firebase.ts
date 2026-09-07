import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBbAwMo2zEUK0MB83CD5cahWT0iKTmz9AQ",
  authDomain: "maturnik-f3a54.firebaseapp.com",
  projectId: "maturnik-f3a54",
  storageBucket: "maturnik-f3a54.firebasestorage.app",
  messagingSenderId: "57856548969",
  appId: "1:57856548969:web:3d246180532d21a64782f8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
