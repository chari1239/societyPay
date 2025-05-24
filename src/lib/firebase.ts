
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

// --- Explicit Environment Variable Check ---
// This will print to your SERVER console when the app starts.
console.log("--- Firebase Configuration Values Being Used ---");
console.log(`NEXT_PUBLIC_FIREBASE_API_KEY: ${firebaseConfig.apiKey || 'NOT SET or undefined'}`);
console.log(`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${firebaseConfig.authDomain || 'NOT SET or undefined'}`);
console.log(`NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${firebaseConfig.projectId || 'NOT SET or undefined'}`);
console.log(`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${firebaseConfig.storageBucket || 'NOT SET or undefined'}`);
console.log(`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${firebaseConfig.messagingSenderId || 'NOT SET or undefined'}`);
console.log(`NEXT_PUBLIC_FIREBASE_APP_ID: ${firebaseConfig.appId || 'NOT SET or undefined'}`);
console.log("-----------------------------------------------");

if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_ACTUAL_API_KEY_FROM_FIREBASE") {
  const errorMessage =
    "CRITICAL Firebase Setup Error: NEXT_PUBLIC_FIREBASE_API_KEY is missing, undefined, or still set to the placeholder value. " +
    "This value is essential for Firebase to initialize. " +
    "Please ensure it is correctly set in your .env.local file in the project root directory with your actual Firebase API key. " +
    "After creating or updating .env.local, you MUST RESTART your Next.js development server for the changes to take effect. " +
    "The .env.local file should look like:\n" +
    "NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key\n" +
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_actual_auth_domain\n" +
    "...and so on for other Firebase config values.";
  console.error(errorMessage);
  throw new Error(errorMessage); // This will stop execution and show a clear error.
}

// Initialize Firebase
let app: FirebaseApp;

if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log("Firebase app initialized successfully.");
  } catch (error) {
    console.error("Firebase critical initialization error during initializeApp:", error);
    // @ts-ignore // Allow app to be potentially unassigned if error occurs before assignment
    app = undefined;
    throw error; // Re-throw the error from initializeApp if it happens
  }
} else {
  app = getApp();
  console.log("Firebase app already initialized, getting existing app.");
}

// Ensure app is defined before trying to use it
if (!app) {
    const appNotDefinedError = "Firebase app object is not defined after initialization attempt. This should not happen if the API key is valid and initializeApp did not throw an unhandled error.";
    console.error(appNotDefinedError);
    throw new Error(appNotDefinedError);
}

let authInstance;
let dbInstance;

try {
  authInstance = getAuth(app);
  console.log("Firebase Auth instance created successfully.");
} catch (error) {
  console.error("Error getting Firebase Auth instance:", error);
  throw error; // Re-throw to halt further execution if auth can't be initialized
}

try {
  dbInstance = getFirestore(app);
  console.log("Firestore instance created successfully.");
} catch (error) {
  console.error("Error getting Firestore instance:", error);
  throw error; // Re-throw to halt further execution if db can't be initialized
}

export const auth = authInstance;
export const db = dbInstance;
export default app;
