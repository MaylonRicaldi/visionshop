import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATFQ3enTXLBKZDPG_biCQdMX8b0_HHzlc",
  authDomain: "vision-shop-6cb39.firebaseapp.com",
  projectId: "vision-shop-6cb39",
  storageBucket: "vision-shop-6cb39.firebasestorage.app",
  messagingSenderId: "168508253510",
  appId: "1:168508253510:web:89dfbe39558e4841793147"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);