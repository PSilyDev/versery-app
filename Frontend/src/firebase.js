// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCLbRoLdDjoqxTXLO6_jQEMYipWhiKNlFw",
  authDomain: "poetry-postcards.firebaseapp.com",
  projectId: "poetry-postcards",
  storageBucket: "poetry-postcards.firebasestorage.app",
  messagingSenderId: "628877075445",
  appId: "1:628877075445:web:9c43858b565a4d2aff76bc",
  measurementId: "G-684QMQ8E40"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);