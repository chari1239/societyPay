
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

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null; 
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
  const [loading, setLoading] = useState(true); // Initialize loading to true

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
            console.warn("User document not found in Firestore for UID:", currentFirebaseUser.uid, "This can happen if signup succeeded in Auth but Firestore document creation is pending/failed or not yet visible to this listener.");
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error in onAuthStateChanged - fetching user profile:", error);
        setUser(null); 
      } finally {
        setLoading(false); 
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    // setLoading(true); // Removed: onAuthStateChanged handles loading state for auth transitions
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle setting the user state and ultimately setLoading(false)
      return true;
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false); // Ensure loading is false if login itself throws before onAuthStateChanged reacts
      return false;
    }
  };

  const signup = async (name: string, email: string, flat: string, pass: string): Promise<boolean> => {
    // setLoading(true); // Removed: onAuthStateChanged handles loading state for auth transitions
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newFirebaseUser = userCredential.user;
      
      const newUserProfileData = { // Data for Firestore, excluding id
        name,
        email: newFirebaseUser.email || email,
        flatNumber: flat,
        avatarUrl: `https://placehold.co/100x100.png?text=${name.charAt(0)}`,
        isAdmin: false,
        createdAt: serverTimestamp() // Firestore server timestamp
      };
      await setDoc(doc(db, "users", newFirebaseUser.uid), newUserProfileData);
      
      // Optimistically update context state immediately after successful signup and doc creation
      const createdUserForContext: User = {
        id: newFirebaseUser.uid,
        name: newUserProfileData.name,
        email: newUserProfileData.email,
        flatNumber: newUserProfileData.flatNumber,
        avatarUrl: newUserProfileData.avatarUrl,
        isAdmin: newUserProfileData.isAdmin,
      };
      setUser(createdUserForContext);
      setFirebaseUser(newFirebaseUser); // Keep raw firebase user in sync
      setLoading(false); // Set loading to false as user is now authenticated and profile is known client-side

      return true;
    } catch (error) {
      console.error("Signup error:", error);
      setLoading(false); // Ensure loading is false if signup itself throws
      return false;
    }
  }

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will set user to null and setLoading(false).
    } catch (error) {
      console.error("Logout error: ", error);
      // Consider if setLoading(false) is needed here if onAuthStateChanged doesn't fire on error
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
