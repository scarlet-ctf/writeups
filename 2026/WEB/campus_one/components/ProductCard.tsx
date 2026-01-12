"use client";

import { Plus, Check } from "lucide-react";
import { useCart } from "./CartContext";
import { useState } from "react";

interface ProductProps {
    name: string;
    price: string;
    description: string;
}

export default function ProductCard({ name, price, description }: ProductProps) {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    const handleAdd = () => {
        addToCart({ name, price });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    return (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-stone-200 hover:-translate-y-1 group">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                     <span className="text-3xl p-3 bg-stone-50 rounded-2xl text-stone-400 group-hover:text-blue-600 transition-colors">
                        📦
                     </span>
                     <span className="text-stone-800 font-bold text-lg bg-stone-50 px-3 py-1 rounded-lg border border-stone-100">
                        {price}
                     </span>
                </div>
                
                <h3 className="text-xl font-bold text-stone-800 mb-2">{name}</h3>
                <p className="text-stone-500 text-sm mb-6 leading-relaxed min-h-[40px]">{description}</p>
                
                <button 
                  onClick={handleAdd}
                  disabled={added}
                  className={`w-full py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                      added 
                      ? "bg-green-100 text-green-700" 
                      : "bg-stone-900 text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200"
                  }`}
                >
                    {added ? (
                        <>
                            <Check className="w-4 h-4" />
                            <span>Added</span>
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4" />
                            <span>Add to Cart</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
