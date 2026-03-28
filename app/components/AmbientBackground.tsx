"use client";

import React from 'react';
import { motion } from 'framer-motion';

const AmbientOrb = ({ color, size, delay, x, y, opacity = 0.12 }: { color: string, size: string, delay: number, x: string, y: string, opacity?: number }) => (
  <motion.div
    initial={{ x: 0, y: 0, scale: 1 }}
    animate={{ 
      x: [0, 50, -50, 0],
      y: [0, -30, 30, 0],
      scale: [1, 1.2, 0.9, 1]
    }}
    transition={{ 
      duration: 20 + delay, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }}
    className={`absolute rounded-full blur-[120px] pointer-events-none -z-10 ${color} ${size}`}
    style={{ left: x, top: y, opacity }}
  />
);

export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#05070A]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05)_0%,transparent_50%)]" />
      <AmbientOrb color="bg-blue-600" size="w-[800px] h-[800px]" delay={0} x="-10%" y="-10%" />
      <AmbientOrb color="bg-purple-600" size="w-[700px] h-[700px]" delay={5} x="60%" y="10%" />
      <AmbientOrb color="bg-blue-400" size="w-[600px] h-[600px]" delay={10} x="20%" y="50%" />
      <AmbientOrb color="bg-purple-500" size="w-[500px] h-[500px]" delay={15} x="70%" y="70%" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
    </div>
  );
}
