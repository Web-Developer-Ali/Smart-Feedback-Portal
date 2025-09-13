"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

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
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Memoized fetch function to prevent unnecessary recreations
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!supabaseUser) {
        setUser(null);
        return;
      }

      // Transform Supabase user to our app user format
      const appUser: AppUser = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.user_metadata?.full_name || 
              supabaseUser.user_metadata?.name || 
              supabaseUser.email?.split('@')[0] || 
              'User',
        avatar_url: supabaseUser.user_metadata?.avatar_url
      };

      setUser(appUser);
      
    } catch (err) {
      console.error("Error fetching user:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [supabase.auth]);

  useEffect(() => {
    fetchUser();
    
    // Set up real-time auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const appUser: AppUser = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.full_name || 
                session.user.user_metadata?.name || 
                session.user.email?.split('@')[0] || 
                'User',
          avatar_url: session.user.user_metadata?.avatar_url
        };
        setUser(appUser);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUser, supabase.auth]);

  const value: UserContextValue = {
    user,
    loading,
    error,
    refreshUser: fetchUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export function useUser() {
  const ctx = useContext(UserContext);
  
  if (!ctx) {
    throw new Error("useUser must be used within UserProvider");
  }
  
  return ctx;
}

// Optional: Create a hook for easy user access in components
export function useCurrentUser() {
  const { user, loading, error } = useUser();
  
  return {
    user,
    loading,
    error,
    isAuthenticated: !!user && !loading,
  };
}