import { useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import CheckoutButton from "@/components/CheckoutButton";
import ClientLeak from "@/components/ClientLeak";
import { getProducts, initDb } from "@/lib/db";

// Ensure DB is init
try { initDb(); } catch(e) {}

export default function Home() {
  const products = getProducts();
  
  // Products fetched above

  return (
    <main className="flex min-h-screen flex-col items-center pt-32 pb-24 px-8 bg-stone-50 selection:bg-blue-100 selection:text-blue-900">
      <ClientLeak />
      <div className="max-w-7xl w-full flex flex-col items-center animate-in fade-in zoom-in duration-700">
         
         <div className="text-center mb-24 max-w-3xl relative">
            {/* Soft Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white rounded-full blur-[80px] -z-10 opacity-60"></div>
            
            <span className="inline-block py-1.5 px-4 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-bold mb-8 tracking-widest uppercase shadow-sm">
                Spring Semester Sale
            </span>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-stone-800 mb-8 tracking-tight leading-[1.1]">
              Equip Your <br/>
              <span className="text-blue-600 relative">
                Academic Journey
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-blue-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h1>
            
            <p className="text-stone-500 text-xl font-medium leading-relaxed max-w-2xl mx-auto">
                Premium technology curated for students and faculty. 
                <br className="hidden md:block"/>
                Simple, secure, and built for success.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full mb-24 px-4">
            {products.map((p: any) => (
                <ProductCard key={p.name} {...p} />
            ))}
         </div>

         <CheckoutButton />
         
         <footer className="w-full mt-32 border-t border-stone-200 pt-12 flex flex-col md:flex-row justify-between items-center text-stone-400 text-sm gap-4 font-medium">
            <div className="flex gap-8">
                <span className="hover:text-blue-600 cursor-pointer transition-colors">University Policy</span>
                <span className="hover:text-blue-600 cursor-pointer transition-colors">Student Support</span>
                <span className="hover:text-blue-600 cursor-pointer transition-colors">Returns</span>
            </div>
            <span>© 2025 CampusOne Store. All rights reserved.</span>
         </footer>
      </div>
    </main>
  );
}
