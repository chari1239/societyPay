
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
  const [loading, setLoading] = useState(true); // Initially true, set to false by onAuthStateChanged
  const { toast } = useToast();

  useEffect(() => {
    console.log("AuthContext: useEffect for onAuthStateChanged mounting. Initial global loading state:", loading);
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
            console.warn("AuthContext: User document NOT FOUND in Firestore for UID:", currentFirebaseUser.uid);
             // If a user is authenticated with Firebase but has no Firestore profile document (e.g., manual deletion in DB, or incomplete signup)
            // We should ensure the app user state is null.
            setUser(null);
          }
        } else {
          console.log("AuthContext: No currentFirebaseUser (user is logged out). Clearing user state.");
          setUser(null);
        }
      } catch (error) {
        console.error("AuthContext: Error in onAuthStateChanged while fetching/processing user profile:", error);
        setUser(null); // On error, ensure user is null
        const firebaseError = error as FirebaseError;
        if (firebaseError.code !== 'unavailable' && firebaseError.code !== 'failed-precondition' && firebaseError.code !== 'cancelled') {
            toast({
                title: "Profile Load Error",
                description: `Could not load user profile. ${firebaseError.message || 'Please check your connection.'}`,
                variant: "destructive"
            });
        }
      } finally {
        console.log("AuthContext: onAuthStateChanged finally block. Setting global loading state to false.");
        setLoading(false); // This is now the primary place global loading becomes false.
      }
    });

    return () => {
      console.log("AuthContext: useEffect for onAuthStateChanged unmounting.");
      unsubscribe();
    }
  }, [toast]); // Dependency array for onAuthStateChanged effect

  const login = async (email: string, pass: string): Promise<boolean> => {
    console.log("AuthContext: login initiated for", email);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      console.log("AuthContext: signInWithEmailAndPassword successful for", email);
      // onAuthStateChanged will handle setting user and loading states.
      return true;
    } catch (error) {
      console.error("AuthContext: Login error:", error);
      return false;
    }
  };

  const signup = async (name: string, email: string, flat: string, pass: string): Promise<{ success: boolean; error?: { code?: string; message?: string } }> => {
    console.log("AuthContext: signup initiated for", email);
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
      
      // Optimistic update for user and firebaseUser to allow immediate UI changes if needed,
      // but DO NOT set global loading to false here. onAuthStateChanged will handle that.
      const createdUserForContext: User = {
        id: newFirebaseUser.uid,
        name: newUserProfileData.name,
        email: newUserProfileData.email,
        flatNumber: newUserProfileData.flatNumber,
        avatarUrl: newUserProfileData.avatarUrl,
        isAdmin: newUserProfileData.isAdmin,
      };
      
      console.log("AuthContext: Optimistically setting user and firebaseUser in context post-signup.");
      setUser(createdUserForContext); 
      setFirebaseUser(newFirebaseUser);
      // DO NOT setLoading(false) here. Let onAuthStateChanged be the sole source of truth for global loading.
      
      return { success: true };
    } catch (error) {
      console.error("AuthContext: Signup error:", error);
      const firebaseError = error as FirebaseError;
      return { success: false, error: { code: firebaseError.code, message: firebaseError.message } };
    }
  }

  const logout = async () => {
    console.log("AuthContext: logout initiated.");
    try {
      await firebaseSignOut(auth);
      console.log("AuthContext: firebaseSignOut successful.");
      // onAuthStateChanged will handle setting user to null and loading to false.
    } catch (error) {
      console.error("AuthContext: Logout error: ", error);
    }
  };

  const updateUserProfileInContext = (updatedProfileData: Partial<User>) => {
    if (user) {
      console.log("AuthContext: updateUserProfileInContext called with data:", updatedProfileData);
      setUser(prevUser => ({ ...prevUser!, ...updatedProfileData }));
    }
  };

  console.log("AuthContext: Rendering AuthProvider. Current user:", user?.email, "FirebaseUser UID:", firebaseUser?.uid, "Loading:", loading);
  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, logout, signup, updateUserProfileInContext }}>
      {children}
    </AuthContext.Provider>
  );
};

