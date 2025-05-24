
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
import { useToast } from '@/hooks/use-toast'; // Added for potential error feedback

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
  const { toast } = useToast(); // Initialize toast

  useEffect(() => {
    console.log("AuthContext: useEffect for onAuthStateChanged mounting. Initial global loading state:", loading);
    const unsubscribe = onAuthStateChanged(auth, async (currentFirebaseUser) => {
      console.log("AuthContext: onAuthStateChanged triggered. Firebase UID:", currentFirebaseUser?.uid || 'none');
      setFirebaseUser(currentFirebaseUser); // Set FirebaseUser immediately

      try {
        if (currentFirebaseUser) {
          console.log("AuthContext: currentFirebaseUser exists, attempting to get user document.");
          const userDocRef = doc(db, "users", currentFirebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            console.log("AuthContext: User document found in Firestore for UID:", currentFirebaseUser.uid);
            setUser({ id: userDocSnap.id, ...userDocSnap.data() } as User);
          } else {
            console.warn("AuthContext: User document NOT found in Firestore for UID:", currentFirebaseUser.uid, ". This can happen if signup succeeded in Auth but Firestore document creation is pending/failed or not yet visible to this listener.");
            setUser(null); // User is authenticated but profile is missing
            // Optionally, you could toast here if this state is unexpected after a recent signup/login
            // toast({ title: "Profile Incomplete", description: "User profile data could not be loaded.", variant: "destructive" });
          }
        } else {
          console.log("AuthContext: No currentFirebaseUser (user is logged out).");
          setUser(null);
        }
      } catch (error) {
        console.error("AuthContext: Error in onAuthStateChanged while fetching user profile:", error);
        setUser(null); // Ensure user is null on error
        toast({
            title: "Profile Load Error",
            description: `Could not load user profile. ${error instanceof Error ? error.message : 'Please check your connection.'}`,
            variant: "destructive"
        });
      } finally {
        console.log("AuthContext: onAuthStateChanged finally block. Setting global loading state to false.");
        setLoading(false);
      }
    });

    return () => {
      console.log("AuthContext: useEffect for onAuthStateChanged unmounting.");
      unsubscribe();
    }
  }, [toast]); // Added toast to dependency array as it's used in the effect

  const login = async (email: string, pass: string): Promise<boolean> => {
    console.log("AuthContext: login initiated for", email);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle setting the user state and ultimately setLoading(false)
      console.log("AuthContext: signInWithEmailAndPassword successful for", email);
      return true;
    } catch (error) {
      console.error("AuthContext: Login error:", error);
      // setLoading(false); // Defer to onAuthStateChanged's finally block
      return false;
    }
  };

  const signup = async (name: string, email: string, flat: string, pass: string): Promise<boolean> => {
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
      
      const createdUserForContext: User = {
        id: newFirebaseUser.uid,
        name: newUserProfileData.name,
        email: newUserProfileData.email,
        flatNumber: newUserProfileData.flatNumber,
        avatarUrl: newUserProfileData.avatarUrl,
        isAdmin: newUserProfileData.isAdmin,
        // createdAt will be a server timestamp object initially
      };
      
      console.log("AuthContext: Optimistically setting user and global loading state post-signup.");
      setUser(createdUserForContext);
      setFirebaseUser(newFirebaseUser); 
      setLoading(false); // Crucial for optimistic UI update, onAuthStateChanged will run soon after

      return true;
    } catch (error) {
      console.error("AuthContext: Signup error:", error);
      // setLoading(false); // Defer to onAuthStateChanged's finally block for global loading state.
      // The form itself has local loading state.
      return false;
    }
  }

  const logout = async () => {
    console.log("AuthContext: logout initiated.");
    try {
      await firebaseSignOut(auth);
      console.log("AuthContext: firebaseSignOut successful.");
      // onAuthStateChanged will set user to null and setLoading(false).
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

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, logout, signup, updateUserProfileInContext }}>
      {children}
    </AuthContext.Provider>
  );
};
