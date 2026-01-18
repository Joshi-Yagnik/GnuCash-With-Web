import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCmcseCJ18eI-btGukHLhYhuQB_OURG4TA",
  authDomain: "summer-67e53.firebaseapp.com",
  projectId: "summer-67e53",
  storageBucket: "summer-67e53.firebasestorage.app",
  messagingSenderId: "462435725419",
  appId: "1:462435725419:web:70497499c930d8713d412e",
  measurementId: "G-5E5CYQKWFK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
