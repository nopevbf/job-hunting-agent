import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let db: Firestore | null = null;

export function getFirestoreDb(): Firestore | null {
  if (typeof window === "undefined" && !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    return null;
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    return null;
  }
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    if (!db) {
      db = getFirestore(app);
    }
    return db;
  } catch (error) {
    console.warn("Firebase initialization skipped:", error);
    return null;
  }
}
