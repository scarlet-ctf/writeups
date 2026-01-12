"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type UserContextType = {
  isLoggedIn: boolean;
  login: (email: string) => void;
  logout: () => void;
  userEmail: string | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const hasSession = document.cookie.includes('session_id=');
    if (hasSession) {
        setIsLoggedIn(true);
        // In a real app we'd decode the JWT or fetch user info.
        // For simulation, we'll just assume a default student if cookie exists but state is empty.
        if (!userEmail) setUserEmail("student@campus.edu");
    }
  }, []);

  const login = (email: string) => {
    // 1. Set Cookie
    const studentSessionId = `student_session_${Math.random().toString(36).substring(2)}`;
    document.cookie = `session_id=${studentSessionId}; path=/; max-age=86400`; // 1 day
    
    // 2. Update State
    setIsLoggedIn(true);
    setUserEmail(email);

    // 3. Navigation is handled by the caller or here
  };

  const logout = () => {
    // 1. Clear Cookie
    document.cookie = "session_id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    
    // 2. Update State
    setIsLoggedIn(false);
    setUserEmail(null);
    
    router.refresh(); // Refresh server components if needed
  };

  return (
    <UserContext.Provider value={{ isLoggedIn, login, logout, userEmail }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
