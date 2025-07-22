import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDiXS9__CFcMskOvrcFQxwaM27Afh5l0lQ",
  authDomain: "fintrack-a9496.firebaseapp.com",
  projectId: "fintrack-a9496",
  storageBucket: "fintrack-a9496.firebasestorage.app",
  messagingSenderId: "669120108469",
  appId: "1:669120108469:web:9caeca5aaa7d7fb7246bfc",
  measurementId: "G-X3BH7FMW17"
};
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);