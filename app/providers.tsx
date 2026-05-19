"use client";

// Root client-side providers. Wraps the app in Auth + Cart contexts.
// Kept as a single component so app/layout.tsx (Server Component) can mount it
// without becoming a Client Component itself.

import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
