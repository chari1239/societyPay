
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseOptions, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// --- TEMPORARY DEBUGGING LOG ---
// This will print to your SERVER console when the app starts.
console.log("--- Firebase Configuration Check ---");
console.log("Attempting to use Firebase config:");
console.log(`API Key Loaded: ${firebaseConfig.apiKey ? 'YES (value hidden for security)' : 'NO - MISSING OR UNDEFINED'}`);
console.log(`Auth Domain: ${firebaseConfig.authDomain || 'MISSING or undefined'}`);
console.log(`Project ID: ${firebaseConfig.projectId || 'MISSING or undefined'}`);
console.log("------------------------------------");

if (!firebaseConfig.apiKey) {
  console.error(
    "CRITICAL Firebase Error: NEXT_PUBLIC_FIREBASE_API_KEY is missing or undefined. " +
    "Please ensure it is correctly set in your .env.local file in the project root, " +
    "and that you have RESTARTED your Next.js development server after any changes to .env.local."
  );
}
// --- END TEMPORARY DEBUGGING LOG ---

// Initialize Firebase
let app: FirebaseApp;

if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Firebase critical initialization error:", error);
    // If initializeApp fails, app will be undefined, and subsequent getAuth/getFirestore will fail.
    // This explicit catch is to make the initialization failure very clear in logs.
    // @ts-ignore // Allow app to be potentially unassigned if error occurs before assignment
    app = undefined;
  }
} else {
  app = getApp();
}

export const auth = getAuth(app!); // app should be defined if initialization didn't throw earlier
export const db = getFirestore(app!); // app should be defined
export default app;
