import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const SECURE_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 1 week
};

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: "pkce",
        autoRefreshToken: false,
        persistSession: true,
        detectSessionInUrl: false,
      },
      cookies: {
        async get(name: string) {
          try {
            return (await cookieStore).get(name)?.value;
          } catch (error) {
            console.error('Cookie read error:', error);
            return undefined;
          }
        },
        async set(name: string, value: string, options: CookieOptions = {}) {
          try {
            (await cookieStore).set({ 
              name, 
              value,
              ...SECURE_COOKIE_OPTIONS,
              ...options 
            });
          } catch (error) {
            console.error("Secure cookie set failed:", error);
            throw error; // Re-throw in critical operations
          }
        },
        async remove(name: string, options: CookieOptions = {}) {
          try {
            (await cookieStore).set({ 
              name, 
              value: "", 
              ...SECURE_COOKIE_OPTIONS,
              ...options,
              maxAge: 0
            });
          } catch (error) {
            console.error("Cookie removal failed:", error);
          }
        },
      },
      global: {
        fetch: async (input, init) => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);

          try {
            const response = await fetch(input, {
              ...init,
              cache: "no-store",
              signal: controller.signal
            });
            
            if (!response.ok) {
              console.error('Fetch error:', response.status);
            }
            return response;
          } catch (error) {
            console.error('Network error:', error);
            throw error;
          } finally {
            clearTimeout(timeout);
          }
        },
      },
    }
  );
}