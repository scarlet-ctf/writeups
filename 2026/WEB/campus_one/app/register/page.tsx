"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ArrowRight, Loader2, BookOpen } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    setLoading(true);

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Registration successful! Please sign in.");
            router.push("/login");
        } else {
            alert(data.error || "Registration failed");
        }
    } catch (err) {
        alert("An error occurred. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-stone-50">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors">
        <ArrowRight className="w-4 h-4 rotate-180" />
        <span className="text-sm font-medium">Back to Store</span>
      </Link>

      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-stone-200 border border-stone-100 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-50 p-4 rounded-2xl mb-4 text-blue-600">
                <BookOpen className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-stone-800">Create Account</h1>
            <p className="text-stone-500 text-sm">Join CampusOne today</p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Student Email</label>
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
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Password</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-stone-800"
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Confirm Password</label>
                <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-stone-800"
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="mt-2 w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Creating Account...</span>
                    </>
                ) : (
                    <span>Sign Up</span>
                )}
            </button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-stone-500 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                    Sign In
                </Link>
            </p>
        </div>
      </div>
    </main>
  );
}
