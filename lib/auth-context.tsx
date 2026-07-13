"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { UserRole } from "@/types/user";

interface AuthState {
  user: User | null;
  role: UserRole | null;
  displayName: string;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({
  user: null,
  role: null,
  displayName: "",
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    displayName: "",
    loading: true,
  });

  useEffect(() => {
    let unsubUser: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      unsubUser?.();
      if (!user) {
        setState({ user: null, role: null, displayName: "", loading: false });
        return;
      }
      unsubUser = onSnapshot(doc(db, "users", user.uid), (snap) => {
        const role = (snap.data()?.role as UserRole) ?? "student";
        const displayName = snap.data()?.displayName ?? user.displayName ?? "Student";
        setState({ user, role, displayName, loading: false });
      });
    });

    return () => {
      unsubAuth();
      unsubUser?.();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
