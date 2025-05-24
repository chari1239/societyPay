
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
// mockUsers is not directly used here for auth, but keeping import if other parts of context might need it (currently not)
// import { mockUsers } from '@/lib/mockData'; 

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
      try {
        if (currentFirebaseUser) {
          const userDocRef = doc(db, "users", currentFirebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUser({ id: userDocSnap.id, ...userDocSnap.data() } as User);
          } else {
            setUser(null); 
            console.warn("User document not found in Firestore for UID:", currentFirebaseUser.uid);
            // This might occur if a user is in Firebase Auth but their Firestore document was deleted,
            // or if a new signup's Firestore document creation is pending or failed.
            // The signup function is responsible for creating this document.
          }
        } else {
          // User is signed out
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user profile from Firestore:", error);
        setUser(null); // Ensure user state is reset on error
      } finally {
        setLoading(false); // Ensure loading is set to false in all cases
      }
    });

    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs once on mount

  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle setting the user state and setLoading(false) via its effect
      return true;
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false); // Explicitly set loading to false on direct error
      return false;
    }
  };

  const signup = async (name: string, email: string, flat: string, pass: string): Promise<boolean> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newFirebaseUser = userCredential.user;
      
      const newUserProfile: Omit<User, 'id'> & { createdAt: any } = {
        name,
        email: newFirebaseUser.email || email,
        flatNumber: flat,
        avatarUrl: `https://placehold.co/100x100.png?text=${name.charAt(0)}`,
        isAdmin: false,
        createdAt: serverTimestamp()
      };
      await setDoc(doc(db, "users", newFirebaseUser.uid), newUserProfile);
      
      // onAuthStateChanged will handle setting the user state and setLoading(false)
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      setLoading(false); // Explicitly set loading to false on direct error
      return false;
    }
  }

  const logout = async () => {
    // setLoading(true); // Setting loading true here can cause a brief flash of the loader.
                       // onAuthStateChanged will handle state changes including loading.
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will set user to null and eventually loading to false.
    } catch (error) {
      console.error("Logout error: ", error);
      // setLoading(false); // Ensure loading is false if an error occurs before onAuthStateChanged reacts.
      // Decided to let onAuthStateChanged handle loading state for consistency, 
      // but if logout errors become an issue for loading state, this could be revisited.
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
