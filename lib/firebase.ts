// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBwwT71eT2zZMZlazVDynRJNCm6JyAgXrQ",
  authDomain: "jambalaia-5b794.firebaseapp.com",
  projectId: "jambalaia-5b794",
  storageBucket: "jambalaia-5b794.firebasestorage.app",
  messagingSenderId: "163056134616",
  appId: "1:163056134616:web:c6a1b6ed5f70c5f370aaad",
  measurementId: "G-NBMHQ2GD7J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;
