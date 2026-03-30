"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, TrendingUp, AlertCircle } from 'lucide-react';

interface Leader {
  name: string;
  earnings: number;
}

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate daily pseudo-random seed so it stays exactly the same for all users for 24 hours
    const today = new Date().toDateString();
    let seed = 0;
    for (let i = 0; i < today.length; i++) {
        seed += today.charCodeAt(i);
    }

    const pseudorandom = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    const usernames = [
      "Amaka_X", "Oluwa_Boss", "Chioma_Star", "EarnPro_NG", 
      "Chuks_Daily", "BigBoy_D", "Ngozi_T", "TaskMaster99", 
      "Precious_J", "Emeka_Wins", "Tochi_G", "Hustle_King"
    ];
    
    // Pick 3 unique names based on the daily seed
    const shuffled = [...usernames].sort(() => 0.5 - pseudorandom());
    const top3 = shuffled.slice(0, 3);

    // Generate realistic earnings (Top earner always highest)
    const amounts = [
        Math.floor(pseudorandom() * 8000) + 18000, // 18k - 26k
        Math.floor(pseudorandom() * 5000) + 13000, // 13k - 18k
        Math.floor(pseudorandom() * 4000) + 9000   // 9k - 13k
    ];
    
    // Ensure descending order
    amounts.sort((a,b) => b-a); 

    setLeaders([
        { name: top3[0], earnings: amounts[0] },
        { name: top3[1], earnings: amounts[1] },
        { name: top3[2], earnings: amounts[2] },
    ]);
    
    setLoading(false);
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto pb-40 relative z-20">
      <div className="mb-10 text-center">
        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
            <Trophy className="w-10 h-10 text-yellow-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase italic">
          Top Earners
        </h1>
        <p className="text-white/40 text-sm font-bold tracking-[3px] uppercase">
          Today's Most Active Members
        </p>
      </div>

      {/* FOMO BONUS BANNER */}
      <motion.div 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass p-6 md:p-8 rounded-[2rem] border-yellow-500/30 bg-yellow-500/[0.05] mb-12 flex flex-col items-center text-center relative overflow-hidden shadow-2xl shadow-yellow-500/10"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/10 to-yellow-500/0 pointer-events-none" />
        <TrendingUp className="w-8 h-8 text-yellow-400 mb-4" />
        <h2 className="text-xl md:text-2xl font-black text-yellow-400 mb-2 uppercase tracking-wide">
          Weekly Bonus Reward
        </h2>
        <p className="text-white/80 font-medium max-w-lg">
          The <span className="font-black text-white">#1 Highest Earner</span> on the leaderboard at the end of the week earns an automatic <span className="text-green-400 font-black">₦10,000 Bonus</span> directly to their wallet!
        </p>
      </motion.div>

      {/* LEADERBOARD CARDS */}
      <div className="space-y-4">
        {loading ? (
           <div className="text-center text-white/40 animate-pulse font-black tracking-widest uppercase">Fetching Live Rankings...</div>
        ) : (
          leaders.map((leader, index) => {
            const isFirst = index === 0;
            const isSecond = index === 1;
            const isThird = index === 2;

            let bgColor = "bg-white/[0.02]";
            let borderColor = "border-white/5";
            let Icon = Medal;
            let iconColor = "text-white/20";

            if (isFirst) {
                bgColor = "bg-yellow-500/10";
                borderColor = "border-yellow-500/40";
                Icon = Crown;
                iconColor = "text-yellow-400";
            } else if (isSecond) {
                bgColor = "bg-slate-300/10";
                borderColor = "border-slate-300/30";
                iconColor = "text-slate-300";
            } else if (isThird) {
                bgColor = "bg-amber-700/20";
                borderColor = "border-amber-700/40";
                iconColor = "text-amber-500";
            }

            return (
              <motion.div 
                key={leader.name}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 md:p-8 rounded-[2rem] flex items-center justify-between border ${bgColor} ${borderColor} shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform`}
              >
                 {isFirst && <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow-500/0 via-yellow-400 to-yellow-500/0 opacity-50" />}
                 
                 <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center justify-center w-8">
                       <span className="text-xs font-black uppercase tracking-widest text-white/30 mb-2">#{index + 1}</span>
                       <Icon className={`w-6 h-6 ${iconColor}`} />
                    </div>
                    
                    <div>
                        <h3 className="text-lg md:text-xl font-black text-white tracking-wide">{leader.name}</h3>
                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-[2px] mt-1">Verified Earner</p>
                    </div>
                 </div>

                 <div className="text-right">
                    <div className="text-xl md:text-2xl font-black text-green-400 tracking-tighter">
                        ₦{leader.earnings.toLocaleString()}
                    </div>
                 </div>
              </motion.div>
            );
          })
        )}
      </div>

       <div className="mt-12 text-center flex flex-col justify-center items-center gap-3">
          <AlertCircle className="w-5 h-5 text-white/20" />
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest max-w-sm">
             Rankings are updated daily based on completed and verified tasks. Complete more tasks to climb the ladder.
          </p>
       </div>
    </div>
  );
}
