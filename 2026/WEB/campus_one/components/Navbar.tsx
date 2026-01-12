"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, ShoppingBag, User } from "lucide-react";
import { useCart } from "./CartContext";
import { useUser } from "./UserContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { cartCount } = useCart();
  const { isLoggedIn, logout } = useUser();
  const router = useRouter();

  // No useEffect needed here anymore, Context handles initialization

  const handleLogout = () => {
      logout();
      // Router refresh happens in logout()
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4 bg-white/80 border-b border-stone-200 backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-200 group-hover:bg-blue-700 transition-colors">
            <GraduationCap className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
            <span className="text-lg font-bold text-stone-800 leading-none tracking-tight">CampusOne</span>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest leading-none">Student Store</span>
        </div>
      </Link>
      
      <div className="flex gap-6 md:gap-8 items-center text-sm font-medium text-stone-500">
        <Link href="/" className="hover:text-blue-600 transition-colors hidden md:block">Textbooks</Link>
        <Link href="/" className="hover:text-blue-600 transition-colors hidden md:block">Electronics</Link>
        
        {isLoggedIn ? (
             <button onClick={handleLogout} className="flex items-center gap-2 hover:text-red-500 transition-colors">
                <User className="w-4 h-4" />
                <span>Logout</span>
             </button>
        ) : (
             <Link href="/login" className="hover:text-blue-600 transition-colors">
                Login
             </Link>
        )}
        
        <Link href="/checkout">
            <button className="flex items-center gap-2 pl-6 border-l border-stone-200 text-stone-800 hover:text-blue-600 transition-colors relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="font-semibold">Cart ({cartCount})</span>
            </button>
        </Link>
      </div>
    </nav>
  );
}
