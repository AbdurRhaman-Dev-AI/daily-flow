"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";

export interface DemoUser {
  uid: string;
  email: string;
  displayName: string;
  isDemo: true;
}

interface AuthContextType {
  user: User | DemoUser | null;
  loading: boolean;
  isDemo: boolean;
  isConfigured: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
  error: string | null;
  setError: (err: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isDemo: false,
  isConfigured: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  enterDemoMode: () => {},
  error: null,
  setError: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | DemoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if demo user saved in sessionStorage
    if (typeof window !== "undefined") {
      const savedDemo = sessionStorage.getItem("daily_flow_demo_user");
      if (savedDemo) {
        setUser(JSON.parse(savedDemo));
        setIsDemo(true);
        setLoading(false);
        return;
      }
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!isDemo) {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemo]);

  const signIn = async (email: string, pass: string) => {
    setError(null);
    if (!auth || !isFirebaseConfigured) {
      throw new Error(
        "Firebase is running with placeholder credentials. Please update .env.local with your Firebase project keys, or use 'Explore Demo Mode' below."
      );
    }
    await signInWithEmailAndPassword(auth, email, pass);
    setIsDemo(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("daily_flow_demo_user");
    }
  };

  const signUp = async (email: string, pass: string) => {
    setError(null);
    if (!auth || !isFirebaseConfigured) {
      throw new Error(
        "Firebase is running with placeholder credentials. Please update .env.local with your Firebase project keys, or use 'Explore Demo Mode' below."
      );
    }
    await createUserWithEmailAndPassword(auth, email, pass);
    setIsDemo(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("daily_flow_demo_user");
    }
  };

  const signOut = async () => {
    setError(null);
    if (isDemo) {
      setIsDemo(false);
      setUser(null);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("daily_flow_demo_user");
      }
      return;
    }
    if (auth) {
      await fbSignOut(auth);
    }
    setUser(null);
  };

  const enterDemoMode = () => {
    const demoUser: DemoUser = {
      uid: "demo-user-flow-2026",
      email: "alex.rivers@dailyflow.design",
      displayName: "Alex Rivers",
      isDemo: true,
    };
    setUser(demoUser);
    setIsDemo(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("daily_flow_demo_user", JSON.stringify(demoUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemo,
        isConfigured: isFirebaseConfigured,
        signIn,
        signUp,
        signOut,
        enterDemoMode,
        error,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
