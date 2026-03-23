"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function Logo({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const sizes = {
    sm: "w-8 h-8 text-lg",
    md: "w-10 h-10 text-xl",
    lg: "w-12 h-12 text-2xl",
    xl: "w-20 h-20 text-4xl"
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div 
        whileHover={{ scale: 1.05, rotate: 5 }}
        className={`${sizes[size].split(' ')[0]} ${sizes[size].split(' ')[1]} rounded-2xl bg-gradient-to-tr from-primary via-purple-500 to-accent flex items-center justify-center p-2 shadow-2xl shadow-primary/40 relative overflow-hidden group`}
      >
        {/* Animated Gloss Effect */}
        <motion.div 
          animate={{ x: [-100, 200] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 -z-0"
        />
        
        <span className={`${sizes[size].split(' ')[2]} font-black text-white italic leading-none z-10 drop-shadow-md select-none`}>
          T
        </span>

        {/* Outer Glow */}
        <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-white/40 transition-colors" />
      </motion.div>
      
      {size !== "xl" && (
        <span className={`${size === 'sm' ? 'text-lg' : 'text-2xl'} font-black text-white tracking-tighter`}>
          Task<span className="text-primary">Play</span>
        </span>
      )}
    </div>
  );
}
