"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/app/components/Logo';

const AmbientOrb = ({ color, size, delay, x, y }: { color: string, size: string, delay: number, x: string, y: string }) => (
  <motion.div
    initial={{ x: 0, y: 0, scale: 1 }}
    animate={{ 
      x: [0, 40, -40, 0],
      y: [0, -30, 30, 0],
      scale: [1, 1.2, 0.8, 1]
    }}
    transition={{ 
      duration: 20 + delay, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }}
    className={`absolute rounded-full blur-[120px] opacity-[0.1] pointer-events-none -z-10 ${color} ${size}`}
    style={{ left: x, top: y }}
  />
);

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#05070A] overflow-hidden">
      
      {/* Background Orbs */}
      <AmbientOrb color="bg-blue-600" size="w-[600px] h-[600px]" delay={0} x="-10%" y="-10%" />
      <AmbientOrb color="bg-purple-600" size="w-[500px] h-[500px]" delay={5} x="70%" y="60%" />
      <AmbientOrb color="bg-amber-500" size="w-[300px] h-[300px]" delay={10} x="30%" y="40%" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative z-10 flex flex-col items-center text-center"
      >
        <Logo size="md" className="mb-12" />

        <div className="relative mb-12 flex flex-col items-center">
            {/* Background 404 Text */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.05, scale: 1 }}
                className="text-[12rem] md:text-[20rem] font-black text-white leading-none select-none italic absolute inset-0 flex items-center justify-center -z-1"
            >
                404
            </motion.div>
            
            {/* Floating Character */}
            <motion.div 
                animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
            >
                <div className="relative w-64 h-64 md:w-80 md:h-80">
                    <Image 
                        src="/images/hero-character.png" 
                        alt="Lost Character" 
                        fill
                        className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-125"
                    />
                </div>
            </motion.div>
        </div>

        <div className="glass p-10 md:p-16 rounded-[4rem] border-white/5 bg-white/[0.01] backdrop-blur-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] max-w-2xl mt-12">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter italic">Lost in the Pipeline.</h2>
            <p className="text-white/30 text-[10px] md:text-xs font-black uppercase tracking-[5px] mb-12 leading-relaxed italic">
                The node you are looking for has been decommissioned <br />or moved to a new secure sector.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                <Link href="/" className="w-full sm:w-auto px-10 py-6 rounded-[2.5rem] bg-white text-black font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
                    <Home className="w-5 h-5" /> Return Home
                </Link>
                
                <button 
                    onClick={() => window.history.back()}
                    className="w-full sm:w-auto px-10 py-6 rounded-[2.5rem] bg-white/[0.01] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] text-white/40 hover:text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                >
                    <ArrowLeft className="w-5 h-5" /> Step Back
                </button>
            </div>
        </div>

        <div className="mt-20 flex items-center gap-4 px-6 py-3 rounded-full border border-white/5 bg-white/[0.02]">
            <Search className="w-4 h-4 text-white/20" />
            <span className="text-[9px] font-black text-white/10 uppercase tracking-[4px]">TaskPlay Nigeria • Security Sector 404</span>
        </div>
      </motion.div>
    </div>
  );
}
