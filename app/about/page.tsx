"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Info, Target, Users } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden py-32 px-6">
      <div className="container mx-auto max-w-4xl text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border-white/20 mb-12"
        >
          <Info className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[4px] text-white/80">Our Mission</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-white mb-10 leading-[1.05] tracking-tight"
        >
          Building the Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Value Distribution</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-white/50 mb-20 leading-relaxed font-medium"
        >
          TaskPlay was born out of a simple idea: everyone&apos;s time has value. In a world of increasing digital activity, we created a platform that bridge the gap between global brands and daily digital users in Nigeria.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
           <div className="clay-card p-10 text-left">
              <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center mb-8">
                 <Target className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Financial Growth</h3>
              <p className="text-white/40 leading-relaxed">
                 We aim to provide consistent earning opportunities for students, entrepreneurs, and anyone looking for a reliable side income.
              </p>
           </div>
           <div className="clay-card p-10 text-left">
              <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center mb-8">
                 <Users className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Community First</h3>
              <p className="text-white/40 leading-relaxed">
                 By joining TaskPlay, you become part of a network of 12,000+ members who share tips, strategies, and growth opportunities.
              </p>
           </div>
        </div>

        <motion.div 
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           className="p-12 glass rounded-[3rem] border-white/20 text-center"
        >
           <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Ready to start earning?</h2>
           <p className="text-white/40 mb-10 text-lg">Join the thousands who trust TaskPlay daily.</p>
           <Link href="/signup" className="clay-button px-12 py-5 rounded-2xl font-black text-xl text-white">Get Started Now</Link>
        </motion.div>
      </div>
    </div>
  );
}
