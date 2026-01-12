'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { decryptFlag } from './utils/crypto';
import clsx from 'clsx';
import Image from 'next/image';

export default function Home() {
  const [inputVal, setInputVal] = useState('');
  const [rageLevel, setRageLevel] = useState(0);
  const [isRaging, setIsRaging] = useState(false);
  const [shake, setShake] = useState(false);
  const [msg, setMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load WASM
    WebAssembly.instantiateStreaming(fetch('/challenge.wasm'))
        .then((obj) => {
            // @ts-ignore
            window.__TACTICAL_INTEL = obj.instance.exports;
            console.log("%c[TACTICAL] Intel module loaded. Access via: window.__TACTICAL_INTEL", "color: #ff4444; font-weight: bold");
        })
        .catch(err => console.error("WASM LOAD FAIL", err));

    // @ts-ignore
    window.__tactical_support_v2 = decryptFlag;
    console.log("%c[TACTICAL] Decryption ready. Use: window.__tactical_support_v2(key)", "color: #ff4444");
  }, []);

  // MISINPUT CHAOS ENGINE
  useEffect(() => {
    const interval = setInterval(() => {
      if (inputVal.length > 0 && Math.random() > 0.3) {
        // Randomly corrupt the input
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
        const randomChar = chars[Math.floor(Math.random() * chars.length)];
        const randomIdx = Math.floor(Math.random() * inputVal.length);
        
        const split = inputVal.split('');
        split[randomIdx] = randomChar;
        setInputVal(split.join(''));
        setShake(true);
        setTimeout(() => setShake(false), 200);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [inputVal]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const realVal = e.target.value;
    setRageLevel((prev) => Math.min(prev + 5, 100));

    if (Math.random() > 0.4) {
       const garbage = "MISINPUT" + Math.floor(Math.random() * 999);
       const char = garbage[Math.floor(Math.random() * garbage.length)];
       setInputVal((prev) => prev + char);
    } else {
       setInputVal(realVal); 
    }
  };

  const handleKeyDown = () => {
      setShake(true);
      setTimeout(() => setShake(false), 100);
  }

  // Check rage level
  useEffect(() => {
    if (rageLevel >= 100 && !isRaging) {
      setIsRaging(true);
      setTimeout(() => {
        setIsRaging(false);
        setRageLevel(0);
        setInputVal("");
      }, 5000); // 5 seconds of shame
    }
  }, [rageLevel, isRaging]);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setMsg("ACCESS DENIED. INCORRECT KEY.");
      setRageLevel(100); 
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black relative">
      {/* SCANLINE OVERLAY */}
      <div className="fixed inset-0 pointer-events-none scanlines z-40"></div>

      {/* RAGE OVERLAY */}
      <AnimatePresence>
        {isRaging && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-red-900/80 pointer-events-none"
          >
             <div className="relative w-full h-full flex items-center justify-center">
                <h1 className="absolute text-9xl font-black text-white italic z-20 animate-bounce drop-shadow-[0_5px_5px_rgba(0,0,0,1)]">
                    MISINPUT!!!
                </h1>
                <div className="w-[800px] h-[500px] relative border-4 border-red-600 bg-black shadow-[0_0_50px_rgba(255,0,0,0.8)]">
                     <iframe 
                        width="100%" 
                        height="100%" 
                        src="https://www.youtube.com/embed/B0ed2CMuycg?rel=0&start=29&autoplay=1&controls=0&modestbranding=1" 
                        title="MISINPUT" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="pointer-events-none"
                     ></iframe>
        </div>
     </div>
  </motion.div>
)}
</AnimatePresence>

<div className={clsx("z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8", { "animate-shake": shake })}>

<h1 className="text-6xl font-bold text-red-600 tracking-widest text-shadow-glow text-center mb-8">
  TACTICAL <br/> INPUT SYSTEM
</h1>

<div className="z-50 w-full max-w-md bg-red-950/30 border-2 border-red-600 p-8 rounded-lg relative overflow-hidden">
    {/* RAGE METER - Part 2 is NOT here anymore */}
    <div 
        className="absolute top-0 left-0 h-4 bg-red-600 transition-all duration-200" 
        style={{ width: `${rageLevel}%` }}
    ></div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-red-400 font-bold text-xs tracking-[0.2em]">AUTHORIZATION KEY</label>
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={inputVal}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        className="bg-black border border-red-800 p-4 text-2xl text-red-500 font-mono outline-none focus:border-red-400 focus:shadow-[0_0_20px_rgba(255,0,0,0.5)] transition-all placeholder-red-900/50"
                        placeholder="ENTER KEY..."
                        autoComplete="off"
                    />
                </div>

                <div className="flex gap-4">
                    <button type="submit" className="flex-1 bg-red-700 hover:bg-red-600 text-black font-bold py-3 px-6 rounded clip-path-polygon transition-transform active:scale-95 uppercase tracking-wider">
                        Submit
                    </button>
                    <button type="button" onClick={() => setRageLevel(prev => Math.max(0, prev - 20))} className="flex-1 border border-red-700 text-red-600 hover:bg-red-950/50 font-bold py-3 px-6 rounded uppercase tracking-wider text-xs">
                        Calm Down
                    </button>
                </div>

                <a href="/challenge.wasm" download="mission_intel.wasm" className="block w-full text-center border border-red-900/50 text-red-900/50 hover:text-red-500 hover:border-red-500 hover:bg-red-950/30 font-mono text-xs py-2 rounded transition-all uppercase tracking-widest mt-2">
                    [ DOWNLOAD INTEL MODULE ]
                </a>
            </form>
            
            {msg && (
                <div className="mt-4 text-center text-red-400 bg-red-950/50 p-2 border border-red-800 animate-pulse">
                    [!] {msg}
                </div>
            )}
        </div>

        <div className="text-red-900/50 text-xs mt-12 text-center max-w-lg">
             WARNING: UNAUTHORIZED INPUT DETECTED. SYSTEM INTEGRITY: UNSTABLE.
        </div>

      </div>
    </main>
  );
}
