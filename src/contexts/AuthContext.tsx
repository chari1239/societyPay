
"use client";

import type { User } from '@/types';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  type User as FirebaseUser 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { mockUsers } from '@/lib/mockData'; // mockUsers might still be used elsewhere temporarily

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null; // Expose Firebase user object if needed
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, flat: string, pass: string) => Promise<boolean>;
  updateUserProfileInContext: (updatedProfileData: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentFirebaseUser) => {
      setFirebaseUser(currentFirebaseUser);
      if (currentFirebaseUser) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const userDocRef = doc(db, "users", currentFirebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUser({ id: userDocSnap.id, ...userDocSnap.data() } as User);
        } else {
          // This case might happen if user was deleted from Firestore but not Auth
          // Or if it's a new signup and profile isn't created yet (handled in signup)
          setUser(null); 
          console.warn("User document not found in Firestore for UID:", currentFirebaseUser.uid);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle setting the user state
      // setLoading(false) will be handled by onAuthStateChanged's effect
      return true;
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
      return false;
    }
  };

  const signup = async (name: string, email: string, flat: string, pass: string): Promise<boolean> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newFirebaseUser = userCredential.user;
      
      // Create user profile in Firestore
      const newUserProfile: Omit<User, 'id'> & { createdAt: any } = {
        name,
        email: newFirebaseUser.email || email, // Use email from auth if available
        flatNumber: flat,
        avatarUrl: `https://placehold.co/100x100.png?text=${name.charAt(0)}`, // Default avatar
        isAdmin: false, // Default to not admin
        createdAt: serverTimestamp()
      };
      await setDoc(doc(db, "users", newFirebaseUser.uid), newUserProfile);
      
      // setUser({ id: newFirebaseUser.uid, ...newUserProfile } as User); // onAuthStateChanged will handle this
      // setLoading(false) will be handled by onAuthStateChanged's effect
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      setLoading(false);
      return false;
    }
  }

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will handle setting user to null and loading to false
    } catch (error) {
      console.error("Logout error: ", error);
      setLoading(false); // Ensure loading is false on error
    }
  };

  const updateUserProfileInContext = (updatedProfileData: Partial<User>) => {
    if (user) {
      setUser(prevUser => ({ ...prevUser!, ...updatedProfileData }));
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, logout, signup, updateUserProfileInContext }}>
      {children}
    </AuthContext.Provider>
  );
};
