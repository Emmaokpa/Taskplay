"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, UserMinus, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="relative min-h-screen py-32 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-20 text-white">
          <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }}
             className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border-white/20 mb-8"
          >
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[4px] text-white/80">Rules of Engagement</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">Terms of <span className="text-primary italic">Service</span></h1>
          <p className="text-white/40 text-lg">Please read these rules carefully before joining.</p>
        </div>

        <div className="space-y-8">
           <div className="clay-card p-10">
              <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                 <ShieldCheck className="w-6 h-6 text-primary" /> One Account Rule
              </h3>
              <p className="text-white/50 text-lg leading-relaxed">
                 Members are strictly forbidden from creating multiple accounts. Any user found with more than one account will have all accounts suspended and earnings forfeited.
              </p>
           </div>

           <div className="clay-card p-10 border-orange-500/20">
              <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                 <AlertTriangle className="w-6 h-6 text-orange-400" /> VPN & Proxy
              </h3>
              <p className="text-white/50 text-lg leading-relaxed">
                 The use of VPNs, Proxies, or any location-masking software is not allowed. Our CPA partners require verified local traffic to process rewards.
              </p>
           </div>

           <div className="clay-card p-10">
              <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                 <UserMinus className="w-6 h-6 text-red-400" /> Account Termination
              </h3>
              <p className="text-white/50 text-lg leading-relaxed">
                 We reserve the right to terminate accounts that engage in fraudulent behavior, automated bot attempts, or harassment of other community members.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
