"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Eye, Lock, RefreshCcw } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen py-32 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border-white/20 mb-8"
          >
            <ShieldAlert className="w-5 h-5 text-accent" />
            <span className="text-[10px] font-black uppercase tracking-[4px] text-white/80">Transparency Report</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">Privacy <span className="text-accent underline decoration-white/10 underline-offset-8 font-black">Security</span></h1>
          <p className="text-white/40 text-lg">Last updated: March 2026</p>
        </div>

        <div className="space-y-12">
           <section className="clay-card p-10">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 rounded-xl glass flex items-center justify-center">
                    <Eye className="w-6 h-6 text-primary" />
                 </div>
                 <h2 className="text-2xl font-black text-white">Data Collection</h2>
              </div>
              <p className="text-white/50 leading-relaxed text-lg mb-6">
                 We collect minimal data necessary to process your tasks and withdrawals. This includes your email, payment account details, and activity logs for bot detection.
              </p>
           </section>

           <section className="clay-card p-10">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 rounded-xl glass flex items-center justify-center">
                    <Lock className="w-6 h-6 text-green-400" />
                 </div>
                 <h2 className="text-2xl font-black text-white">Financial Security</h2>
              </div>
              <p className="text-white/50 leading-relaxed text-lg mb-6">
                 Your balance is encrypted within our Firestore database. Withdrawal information is only used at the moment of transfer and is never shared with third-party advertisers.
              </p>
           </section>

           <section className="clay-card p-10">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 rounded-xl glass flex items-center justify-center">
                    <RefreshCcw className="w-6 h-6 text-orange-400" />
                 </div>
                 <h2 className="text-2xl font-black text-white">Third-Party CPA</h2>
              </div>
              <p className="text-white/50 leading-relaxed text-lg mb-6">
                 When completing CPA offers from our partners, you may be redirected to their sites. We do not control their privacy policies and recommend reviewing them separately.
              </p>
           </section>
        </div>
      </div>
    </div>
  );
}
