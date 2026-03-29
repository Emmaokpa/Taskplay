"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Wallet, CheckCircle2, Zap } from 'lucide-react';
import { generateRandomActivity } from '@/lib/activity-generator';

export default function LiveFOMO() {
  const [current, setCurrent] = useState<any>(null);

  useEffect(() => {
    // Initial activity
    setCurrent(generateRandomActivity(1));

    const timer = setInterval(() => {
      setCurrent(generateRandomActivity());
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  if (!current) return null;

  return (
    <div className="w-full bg-blue-500/5 backdrop-blur-3xl border-y border-white/[0.03] py-2.5 overflow-hidden relative group">
      <div className="container mx-auto max-w-7xl px-4 flex items-center justify-center sm:justify-between gap-4">
        
        {/* Active Node Counter */}
        <div className="hidden sm:flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <span className="text-[9px] font-black text-white/40 uppercase tracking-[3px]">
                <span className="text-white">482</span> Nodes Active
            </span>
        </div>

        {/* Live Ticker */}
        <div className="flex items-center gap-2 h-4 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              {current.type === 'withdrawal' && <Wallet className="w-3 h-3 text-blue-400" />}
              {current.type === 'task' && <Zap className="w-3 h-3 text-yellow-400" />}
              {current.type === 'upgrade' && <CheckCircle2 className="w-3 h-3 text-purple-400" />}
              
              <span className="text-[9px] font-black uppercase tracking-widest text-white/60">
                <span className="text-white italic">@{current.user}</span> 
                {` ${current.action} `}
                <span className={current.type === 'withdrawal' ? 'text-blue-400' : current.type === 'task' ? 'text-yellow-400' : 'text-purple-400'}>
                    {current.amount}
                </span>
                {` ${current.suffix} `}
                <span className="ml-2 text-white/20 italic">{current.time}</span>
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global Volume Ticker (Simulated) */}
        <div className="hidden md:flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-[9px] font-black text-white/40 uppercase tracking-[3px]">
                Global Volume: <span className="text-white">₦1.2M+ Today</span>
            </span>
        </div>
      </div>
    </div>
  );
}
