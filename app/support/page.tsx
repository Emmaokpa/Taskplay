"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  HeadphonesIcon, 
  MessageCircle, 
  Send, 
  Mail, 
  ArrowLeft,
  ChevronRight,
  HelpCircle,
  ShieldCheck,
  Zap
} from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    q: "How do I get paid?",
    a: "Withdrawals are processed directly to your registered Nigerian bank account. Minimum withdrawal is ₦2,000, and processing typically takes 24-48 hours."
  },
  {
    q: "My task was rejected, why?",
    a: "Tasks are usually rejected if the screenshot provided is blurry, incorrect, or doesn't show proof of the required action. Ensure you follow all instructions carefully."
  },
  {
    q: "Can I have multiple accounts?",
    a: "No. TaskPlay has a strict one-account-per-person policy. Multiple accounts will lead to a permanent ban of all associated nodes."
  },
  {
    q: "The OTP code didn't arrive?",
    a: "Check your spam or junk folder. If it's still missing, wait 2 minutes and click 'Resend Code'. Ensure your email is spelled correctly."
  }
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#05070A] text-white py-12 px-6 pb-32 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 blur-[120px] -ml-48 -mb-48 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12">
          <Link href="/profile" className="inline-flex items-center gap-3 text-white/20 hover:text-white mb-10 transition-all font-black text-[10px] uppercase tracking-[5px] group">
            <div className="p-2 rounded-xl glass group-hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
            Back to Profile
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xl">
              <HeadphonesIcon className="w-6 h-6 text-primary shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Support Core</h1>
              <p className="text-white/30 text-[10px] font-black uppercase tracking-[4px] mt-1 italic">Technical Assistance & Protocol Queries</p>
            </div>
          </div>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Telegram Support */}
          <motion.a 
            href="https://t.me/taskplay_rewards" 
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -5 }}
            className="clay-card p-8 border-[#0088CC]/20 bg-[#0088CC]/5 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0088CC]/5 blur-3xl pointer-events-none" />
            <div className="flex flex-col h-full">
              <div className="w-14 h-14 rounded-2xl bg-[#0088CC]/10 flex items-center justify-center text-[#0088CC] mb-8 border border-[#0088CC]/20 group-hover:scale-110 transition-transform shadow-xl">
                <Send className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tight group-hover:text-[#0088CC] transition-colors">Live Telegram Help</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-8">Join our community or message an admin directly for the fastest resolution to any issue.</p>
              <div className="mt-auto flex items-center text-[#0088CC] font-black text-[10px] uppercase tracking-[3px]">
                Launch Protocol <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.a>

          {/* Email Support */}
          <motion.a 
            href="mailto:support@taskplay.ng" 
            whileHover={{ y: -5 }}
            className="clay-card p-8 border-primary/20 bg-primary/5 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl pointer-events-none" />
            <div className="flex flex-col h-full">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 border border-primary/20 group-hover:scale-110 transition-transform shadow-xl">
                <Mail className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tight group-hover:text-primary transition-colors">Official Email</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-8">For business inquiries or complex account recovery issues that require documentation.</p>
              <div className="mt-auto flex items-center text-primary font-black text-[10px] uppercase tracking-[3px]">
                Send Transmission <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.a>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-2xl font-black tracking-tight italic">Protocol FAQ</h2>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="clay-card p-6 md:p-8 bg-white/[0.02] border-white/5 hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h4 className="text-lg font-black tracking-tight text-white/80">{faq.q}</h4>
                </div>
                <p className="text-white/40 text-sm leading-relaxed pl-12">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center p-12 glass rounded-[3rem] border-white/5 relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-accent/5 blur-3xl pointer-events-none" />
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex -space-x-3">
              {[1,2,3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-white/10 flex items-center justify-center text-[10px] font-black font-mono">
                  AD
                </div>
              ))}
            </div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest"><span className="text-primary">12+</span> Agents Online Now</p>
          </div>
          <h2 className="text-2xl font-black mb-2 tracking-tight">Need immediate help?</h2>
          <p className="text-white/30 text-xs mb-8">Our support team is available 24/7 for premium members.</p>
          <a href="https://t.me/taskplay_rewards" target="_blank" rel="noopener noreferrer" className="clay-button px-10 py-5 rounded-2xl font-black text-white text-sm uppercase tracking-widest inline-flex items-center gap-3">
            Open Telegram <MessageCircle className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
