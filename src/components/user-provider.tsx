"use client";

import { createContext, useContext } from "react";
import { useSession } from "next-auth/react";

interface AppUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

interface UserContextValue {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status, update } = useSession();

  const loading = status === "loading";
  const error = null; // NextAuth handles errors internally, but you could extend this

  const appUser: AppUser | null = session?.user
    ? {
        id: session.user.id as string, // make sure you set this in NextAuth callbacks
        email: session.user.email || "",
        name:
          session.user.name ||
          session.user.email?.split("@")[0] ||
          "User",
        avatar_url: session.user.avatar || undefined,
      }
    : null;

  const value: UserContextValue = {
    user: appUser,
    loading,
    error,
    refreshUser: async () => {
      await update();
    },
  };

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
};

export function useUser() {
  const ctx = useContext(UserContext);

  if (!ctx) {
    throw new Error("useUser must be used within UserProvider");
  }

  return ctx;
}

export function useCurrentUser() {
  const { user, loading, error } = useUser();

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user && !loading,
  };
}
