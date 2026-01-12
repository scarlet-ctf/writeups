"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function SuccessPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-stone-50">
            <div className="bg-white p-12 rounded-3xl shadow-xl shadow-stone-200 border border-stone-100 max-w-lg w-full text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-8 animate-in zoom-in duration-500">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                
                <h1 className="text-3xl font-bold text-stone-800 mb-4">Order Confirmed!</h1>
                <p className="text-stone-500 mb-8 leading-relaxed">
                    Thank you for shopping with CampusOne. Your order has been placed and a digital receipt has been sent to your student email.
                </p>

                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 mb-8">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Order Number</p>
                    <p className="text-lg font-mono text-stone-800">#EDU-{Math.floor(Math.random() * 100000)}</p>
                </div>

                <Link 
                    href="/" 
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <span>Continue Shopping</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </main>
    );
}
