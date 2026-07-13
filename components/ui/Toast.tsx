"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#0F172A",
          color: "#F8FAFC",
          borderRadius: "12px",
          fontSize: "14px",
          padding: "12px 16px",
        },
        success: { iconTheme: { primary: "#0D9488", secondary: "#F8FAFC" } },
        error: { iconTheme: { primary: "#DC2626", secondary: "#F8FAFC" } },
      }}
    />
  );
}
