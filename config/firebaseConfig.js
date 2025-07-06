import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase, ref, set } from "firebase/database";
import { doc } from "firebase/firestore";

// 🔥 Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyB10mS9nC5dBRX82v9-M2l9xxim8-1HnR8",
  authDomain: "wardrobe-3f6db.firebaseapp.com",
  projectId: "wardrobe-3f6db",
  storageBucket: "wardrobe-3f6db.appspot.com",
  messagingSenderId: "856189915244",
  appId: "1:856189915244:android:b5334573653f1ab9994849",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const dbDatabase = getDatabase();

export { app, auth, db };
