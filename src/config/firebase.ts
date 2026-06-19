// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCgmniUJIATTPwlcK9mn7ur3ZS1saDQ6Cs",
  authDomain: "aullevo-data.firebaseapp.com",
  projectId: "aullevo-data",
  storageBucket: "aullevo-data.firebasestorage.app",
  messagingSenderId: "248226640621",
  appId: "1:248226640621:web:859d11c34b6b00ddb892e4",
  measurementId: "G-T715FHZTDJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

