"use client"

import type React from "react"

import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: "white",
            border: "1px solid #e5e7eb",
            color: "#374151",
          },
        }}
      />
    </>
  )
}
