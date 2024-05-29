// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzeKYwATQH5RiHDOsxX0fZD0G1nN1Zmcc",
  authDomain: "placepicker-b5dea.firebaseapp.com",
  projectId: "placepicker-b5dea",
  storageBucket: "placepicker-b5dea.appspot.com",
  messagingSenderId: "719840383326",
  appId: "1:719840383326:web:52f193877cba158b2affcf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider;
export const db = getFirestore(app);