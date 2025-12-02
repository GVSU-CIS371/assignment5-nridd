import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD8IGlNrOWqkY33rEMKlMuXI8NCTVmkALw",
  authDomain: "brew-and-save-b5dd9.firebaseapp.com",
  projectId: "brew-and-save-b5dd9",
  storageBucket: "brew-and-save-b5dd9.firebasestorage.app",
  messagingSenderId: "722960647714",
  appId: "1:722960647714:web:c3c2b2f979d260384c2c7b",
  measurementId: "G-KYHFTZ7VKT"
};

const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();


export const db = getFirestore(app);


export default db;