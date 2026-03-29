"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Wallet, CheckCircle2, Zap, ArrowUpRight } from 'lucide-react';

const activities = [
  { id: 1, user: "ch***s", action: "withdrew", amount: "₦25,400", time: "2m ago", type: "withdrawal" },
  { id: 2, user: "am***a", action: "earned", amount: "₦1,500", time: "5m ago", type: "task" },
  { id: 3, user: "tu***e", action: "verified", amount: "VIP", time: "8m ago", type: "upgrade" },
  { id: 4, user: "em***l", action: "withdrew", amount: "₦12,000", time: "12m ago", type: "withdrawal" },
  { id: 5, user: "bl***g", action: "earned", amount: "₦3,200", time: "15m ago", type: "task" },
];

export default function LiveFOMO() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % activities.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const current = activities[index];

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
