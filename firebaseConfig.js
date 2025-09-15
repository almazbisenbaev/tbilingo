// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDvK27bcDeiyKIb3p9se7Lh7bAhx7eDifw",
  authDomain: "tbilingo.firebaseapp.com",
  projectId: "tbilingo",
  storageBucket: "tbilingo.firebasestorage.app",
  messagingSenderId: "220834756627",
  appId: "1:220834756627:web:30f5e1f239c837ebc7e7e6",
  measurementId: "G-F75W5FNJH2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
