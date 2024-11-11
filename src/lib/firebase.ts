import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAWyvYv9-XZEsFBCU_MWUzaJuEbCOfAy-M",
  authDomain: "objektcheck-c5ecd.firebaseapp.com",
  projectId: "objektcheck-c5ecd",
  storageBucket: "objektcheck-c5ecd.firebasestorage.app",
  messagingSenderId: "629849775608",
  appId: "1:629849775608:web:a28746322d252dbe4f8a0d",
  measurementId: "G-VNYC4Z1QDS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support persistence.');
  }
});