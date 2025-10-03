"use client";

import { SessionProvider } from "next-auth/react";
import { UserProvider } from "@/components/user-provider";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UserProvider>
        {children}
         <Toaster
          toastOptions={{
            descriptionClassName: "text-black"
          }}
        />
      </UserProvider>
    </SessionProvider>
  );
}