
"use client";

import type { User } from '@/types';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  type User as FirebaseUser,
  type FirebaseError
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null; 
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, flat: string, pass: string) => Promise<{ success: boolean; error?: { code?: string; message?: string } }>;
  updateUserProfileInContext: (updatedProfileData: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log("AuthContext: useEffect for onAuthStateChanged mounting. Initial global loading state (before this effect):", loading);
    setLoading(true); // Ensure loading is true when listener is being set up or auth state might change
    const unsubscribe = onAuthStateChanged(auth, async (currentFirebaseUser) => {
      console.log("AuthContext: onAuthStateChanged triggered. Firebase UID:", currentFirebaseUser?.uid || 'none');
      setFirebaseUser(currentFirebaseUser); 

      try {
        if (currentFirebaseUser) {
          console.log("AuthContext: currentFirebaseUser exists, attempting to get user document for UID:", currentFirebaseUser.uid);
          const userDocRef = doc(db, "users", currentFirebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            console.log("AuthContext: User document FOUND in Firestore for UID:", currentFirebaseUser.uid, "Data:", userDocSnap.data());
            setUser({ id: userDocSnap.id, ...userDocSnap.data() } as User);
          } else {
            console.warn("AuthContext: User document NOT FOUND in Firestore for UID:", currentFirebaseUser.uid, ". This might be temporary after signup or indicate an issue if user is expected.");
            setUser(null);
          }
        } else {
          console.log("AuthContext: No currentFirebaseUser (user is logged out). Clearing user state.");
          setUser(null);
        }
      } catch (error) {
        console.error("AuthContext: Error in onAuthStateChanged while fetching/processing user profile:", error);
        setUser(null);
        const firebaseError = error as FirebaseError;
        if (firebaseError.code !== 'unavailable' && firebaseError.code !== 'failed-precondition') {
            toast({
                title: "Profile Load Error",
                description: `Could not load user profile. ${firebaseError.message || 'Please check your connection.'}`,
                variant: "destructive"
            });
        }
      } finally {
        console.log("AuthContext: onAuthStateChanged finally block. Setting global loading state to false.");
        setLoading(false);
      }
    });

    return () => {
      console.log("AuthContext: useEffect for onAuthStateChanged unmounting.");
      unsubscribe();
    }
  }, [toast]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    console.log("AuthContext: login initiated for", email);
    // setLoading(true); // Let onAuthStateChanged handle this
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      console.log("AuthContext: signInWithEmailAndPassword successful for", email);
      // setLoading(false) will be handled by onAuthStateChanged
      return true;
    } catch (error) {
      console.error("AuthContext: Login error:", error);
      // setLoading(false); // Ensure loading becomes false if login fails before onAuthStateChanged can run
      return false;
    }
  };

  const signup = async (name: string, email: string, flat: string, pass: string): Promise<{ success: boolean; error?: { code?: string; message?: string } }> => {
    console.log("AuthContext: signup initiated for", email);
    // setLoading(true); // Handled by onAuthStateChanged for the main loading, form handles its own.
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newFirebaseUser = userCredential.user;
      console.log("AuthContext: Firebase user created via Auth:", newFirebaseUser.uid);
      
      const newUserProfileData = { 
        name,
        email: newFirebaseUser.email || email,
        flatNumber: flat,
        avatarUrl: `https://placehold.co/100x100.png?text=${name.charAt(0)}`,
        isAdmin: false,
        createdAt: serverTimestamp() 
      };
      await setDoc(doc(db, "users", newFirebaseUser.uid), newUserProfileData);
      console.log("AuthContext: Firestore user document created for:", newFirebaseUser.uid);
      
      const createdUserForContext: User = {
        id: newFirebaseUser.uid,
        name: newUserProfileData.name,
        email: newUserProfileData.email,
        flatNumber: newUserProfileData.flatNumber,
        avatarUrl: newUserProfileData.avatarUrl,
        isAdmin: newUserProfileData.isAdmin,
      };
      
      console.log("AuthContext: Optimistically setting user and firebaseUser in context post-signup. Setting global loading to false.");
      setUser(createdUserForContext); // Optimistic update
      setFirebaseUser(newFirebaseUser); // Optimistic update
      setLoading(false); // Crucial: Signal that this specific auth flow (signup) is complete.
                         // onAuthStateChanged will still run to confirm.
      
      return { success: true };
    } catch (error) {
      console.error("AuthContext: Signup error:", error);
      const firebaseError = error as FirebaseError;
      // setLoading(false); // Ensure loading is false if signup itself throws an error.
      return { success: false, error: { code: firebaseError.code, message: firebaseError.message } };
    }
  }

  const logout = async () => {
    console.log("AuthContext: logout initiated.");
    // setLoading(true); // To show loader briefly during logout process
    try {
      await firebaseSignOut(auth);
      console.log("AuthContext: firebaseSignOut successful.");
      // setUser(null) and setFirebaseUser(null) will be handled by onAuthStateChanged
      // setLoading(false) will also be handled by onAuthStateChanged
    } catch (error) {
      console.error("AuthContext: Logout error: ", error);
      // setLoading(false); // Ensure loading is false on error
    }
  };

  const updateUserProfileInContext = (updatedProfileData: Partial<User>) => {
    if (user) {
      console.log("AuthContext: updateUserProfileInContext called with data:", updatedProfileData);
      setUser(prevUser => ({ ...prevUser!, ...updatedProfileData }));
    }
  };

  console.log("AuthContext: Rendering AuthProvider. Current user:", user, "FirebaseUser:", firebaseUser, "Loading:", loading);
  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, logout, signup, updateUserProfileInContext }}>
      {children}
    </AuthContext.Provider>
  );
};

