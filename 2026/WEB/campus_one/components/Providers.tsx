"use client";

import { CartProvider } from "./CartContext";
import { UserProvider } from "./UserContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
        <CartProvider>
        {children}
        </CartProvider>
    </UserProvider>
  );
}
