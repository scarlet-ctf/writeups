"use client";

import { useState } from "react";
import { ArrowRight, Loader2, CreditCard } from "lucide-react";
import { useCart } from "./CartContext";

import { useRouter } from "next/navigation";

export default function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const { cartCount, clearCart } = useCart();
  const router = useRouter();

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate slight delay before redirect
    setTimeout(() => {
        setLoading(false);
        if (cartCount === 0) {
            alert("Your cart is empty!");
            return;
        }
        router.push("/checkout");
    }, 500);
  };

  return (
    <div className="w-full max-w-md mt-16 bg-white p-8 rounded-3xl shadow-xl shadow-stone-200 border border-stone-100">
      <div className="text-center mb-8">
          <h3 className="text-stone-800 font-bold text-xl mb-2">Student Cart</h3>
          <p className="text-stone-500 text-sm">Review your selected items before proceeding.</p>
      </div>

      <form onSubmit={handleCheckout} className="flex flex-col gap-4">
        <div className="flex justify-between text-sm text-stone-500 border-b border-stone-100 pb-6 mb-2">
            <span>Subtotal ({cartCount} items)</span>
            <span>Educational Pricing Applied</span>
        </div>
        
        <button 
          type="submit"
          disabled={loading || cartCount === 0}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-lg shadow-blue-100"
        >
          {loading ? (
             <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
             </>
          ) : (
             <>
                <span>Checkout Now</span>
                <ArrowRight className="w-4 h-4" />
             </>
          )}
        </button>
        <p className="flex items-center justify-center gap-2 text-xs text-stone-400 text-center mt-4">
            <CreditCard className="w-4 h-4" />
            <span>Secure Campus Payment Gateway</span>
        </p>
      </form>
    </div>
  );
}
