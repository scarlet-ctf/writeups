"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, ArrowRight, Loader2 } from "lucide-react";
import { useUser } from "@/components/UserContext";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            login(data.user.email);
            router.push("/");
        } else {
            alert(data.error || "Login failed");
        }
    } catch (err) {
        alert("An error occurred. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-stone-50">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-stone-100">
        <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-200">
                <GraduationCap className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-stone-800">Student Portal</h1>
            <p className="text-stone-500 text-sm mt-2">Sign in to access your exclusive store account.</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">Student Email</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@rutgers.edu"
                    required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-stone-800"
                />
            </div>
            
            <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">Password</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-stone-700"
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Authenticating...</span>
                    </>
                ) : (
                    <>
                        <span>Sign In</span>
                        <ArrowRight className="w-5 h-5" />
                    </>
                )}
            </button>
        </form>
        
        <p className="text-center text-xs text-stone-400 mt-8">
            Forgot password? Contact IT Support.
        </p>
        <div className="mt-8 text-center">
            <p className="text-stone-500 text-sm">
                Don't have an account?{' '}
                <Link href="/register" className="text-blue-600 font-semibold hover:underline">
                    Sign Up
                </Link>
            </p>
        </div>
      </div>
    </main>
  );
}
