
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Added 'onValue' to the import list below:
import { getDatabase, ref, set, push, onValue, update, remove } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDgLrHIDn1SXxZMyW9y0GNS-7CRTsfjNjc",
  authDomain: "contactapp-990a6.firebaseapp.com",
  projectId: "contactapp-990a6",
  databaseURL: "https://contactapp-990a6-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "contactapp-990a6.firebasestorage.app",
  messagingSenderId: "585005004149",
  appId: "1:585005004149:web:9cb68c1b9143b202398f3c",
  measurementId: "G-4YGKCEV8YM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getDatabase(app);

export { ref, set, push, onValue, update, remove };


