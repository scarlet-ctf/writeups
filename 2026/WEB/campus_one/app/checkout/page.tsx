"use client";

import { useCart } from "@/components/CartContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Lock, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
    const { items, clearCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvc, setCvc] = useState("");
    const [name, setName] = useState("");

    // Calculate total
    const total = items.reduce((acc, item) => {
        const price = parseFloat(item.price.replace("$", ""));
        return acc + price;
    }, 0);

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        setTimeout(() => {
            clearCart();
            setLoading(false);
            router.push("/success");
        }, 2000);
    };

    if (items.length === 0) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-stone-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-stone-800 mb-4">Your cart is empty</h2>
                    <p className="text-stone-500 mb-8">Looks like you haven't added any tech gear yet.</p>
                    <Link href="/" className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
                        Start Shopping
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-stone-50 pt-32 pb-24 px-4 md:px-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* Order Summary */}
                <div className="order-2 lg:order-1">
                    <h2 className="text-xl font-bold text-stone-800 mb-6">Order Summary</h2>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
                        <div className="flex flex-col gap-4 mb-6">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b border-stone-100 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center text-xl">
                                            📦
                                        </div>
                                        <div>
                                            <p className="font-semibold text-stone-800 text-sm">{item.name}</p>
                                            <p className="text-stone-400 text-xs">Educational License</p>
                                        </div>
                                    </div>
                                    <span className="font-medium text-stone-600">{item.price}</span>
                                </div>
                            ))}
                        </div>
                        
                        <div className="space-y-3 pt-4 border-t border-stone-100">
                            <div className="flex justify-between text-stone-500 text-sm">
                                <span>Subtotal</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-stone-500 text-sm">
                                <span>Student Discount (10%)</span>
                                <span className="text-green-600">-${(total * 0.1).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-stone-500 text-sm">
                                <span>Taxes</span>
                                <span>Calculated at next step</span>
                            </div>
                            <div className="flex justify-between text-stone-900 font-bold text-lg pt-4">
                                <span>Total</span>
                                <span>${(total * 0.9).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <Link href="/" className="inline-flex items-center gap-2 text-stone-500 mt-6 hover:text-blue-600 transition-colors text-sm font-medium">
                        ← Continue Shopping
                    </Link>
                </div>

                {/* Payment Form */}
                <div className="order-1 lg:order-2">
                    <h2 className="text-xl font-bold text-stone-800 mb-6">Secure Checkout</h2>
                    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-stone-200 border border-stone-100">
                        
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-xs font-semibold mb-8 w-fit">
                            <Lock className="w-3 h-3" />
                            <span>CampusOne Encrypted Gateway</span>
                        </div>

                        <form onSubmit={handlePayment} className="flex flex-col gap-6">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Cardholder Name</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Alice Smith"
                                    required
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-stone-800"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Card Number</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value)}
                                        placeholder="0000 0000 0000 0000"
                                        required
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-stone-800 pl-12"
                                    />
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Expiry</label>
                                    <input 
                                        type="text" 
                                        value={expiry}
                                        onChange={(e) => setExpiry(e.target.value)}
                                        placeholder="MM/YY"
                                        required
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-stone-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">CVC</label>
                                    <input 
                                        type="text" 
                                        value={cvc}
                                        onChange={(e) => setCvc(e.target.value)}
                                        placeholder="123"
                                        required
                                        maxLength={3}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-stone-800"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Processing Payment...</span>
                                    </>
                                ) : (
                                    <span>Pay ${(total * 0.9).toFixed(2)}</span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}
