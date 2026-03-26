"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Download,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Eye,
  Loader,
  TrendingUp,
  Clock,
  ShieldCheck,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toPng } from 'html-to-image';

interface Campaign {
  id: string;
  badge: { icon: any, text: string };
  headlineTitle: string;
  headlineHighlight: string;
  headlineEnd?: string;
  subHeadline: string;
  features: string[];
  fomoTag: string;
}

export default function PromoHubFullScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);
  const targetRef = useRef<HTMLDivElement>(null);

  const campaigns: Campaign[] = [
    {
      id: 'viral-fomo',
      badge: { icon: Sparkles, text: 'JOIN 15,000+ EARNERS TODAY' },
      headlineTitle: 'Earn Over\n',
      headlineHighlight: '₦100,000',
      headlineEnd: '\nMonthly.',
      subHeadline: 'Complete simple online tasks—like following social media pages—and get paid real cash instantly to your bank account.',
      features: ['INSTANT PAYOUTS', '100% SECURE'],
      fomoTag: "LIMITED SLOTS LEAVING SOON"
    },
    {
      id: 'daily-income',
      badge: { icon: TrendingUp, text: 'GUARANTEED DAILY INCOME' },
      headlineTitle: 'Get Paid For Your\n',
      headlineHighlight: 'Screen Time.',
      subHeadline: 'Turn your smartphone into your office. You could be making over ₦100,000 every single month from anywhere in Nigeria.',
      features: ['EASY SOCIAL TASKS', 'FAST WITHDRAWALS'],
      fomoTag: "NEW TASKS JUST DROPPED SECONDS AGO"
    },
    {
      id: 'no-experience',
      badge: { icon: Zap, text: 'EASIEST HUSTLE IN NIGERIA' },
      headlineTitle: 'Start Earning\n',
      headlineHighlight: 'Today.',
      subHeadline: 'No experience needed. Just follow instructions, complete daily tasks, and secure up to ₦100,000+ monthly.',
      features: ['ZERO EXPERIENCE', 'INSTANT CASH REWARDS'],
      fomoTag: "EXCLUSIVE ACCESS CLOSING TONIGHT"
    }
  ];

  const current = campaigns[activeIndex];

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % campaigns.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + campaigns.length) % campaigns.length);

  const handleDownload = async () => {
    if (!targetRef.current) return;
    try {
      setDownloading(true);
      setUiVisible(false); // Hide the floating UI during capture
      
      // Allow React to re-render to hide the UI
      await new Promise((r) => setTimeout(r, 100));

      const dataUrl = await toPng(targetRef.current, {
        quality: 1.0,
        pixelRatio: 2, // High resolution for Facebook Ads
        backgroundColor: '#0A0F1E',
        style: { margin: '0', padding: '0' }
      });
      
      const link = document.createElement('a');
      link.download = `TaskPlay_Ad_${current.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
      // alert won't show in the screenshot since we restore UI after, but better keep it silent or use toast.
    } finally {
      setUiVisible(true);
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden font-sans relative">
      
      {/* THE ACTUAL RENDER TARGET - Facebook Ad Ready */}
      <div 
        ref={targetRef} 
        className="w-full min-h-screen relative overflow-hidden flex flex-col justify-center py-20 lg:py-0"
        style={{ backgroundColor: '#0A0F1E' }}
      >
        {/* Ad Background Gradients (Deep, High-Contrast Neon) */}
        <div className="absolute top-0 right-0 w-[100vw] lg:w-[60vw] h-[100vh] bg-[radial-gradient(ellipse_at_top_right,rgba(110,60,255,0.25),transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[100vw] lg:w-[50vw] h-[80vh] bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.15),transparent_70%)] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.05),transparent_60%)] pointer-events-none" />
        
        {/* Subtle grid texture for that premium tech feel */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.04] mix-blend-overlay pointer-events-none" />

        <div className="max-w-[1440px] mx-auto w-full px-6 sm:px-12 lg:px-24 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center z-10 relative">
           
           {/* LEFT CONTENT - FOMO Text */}
           <div className="flex flex-col justify-center order-2 lg:order-1 relative lg:pl-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-2xl mx-auto lg:mx-0 pt-10 lg:pt-0"
                >
                  {/* Top FOMO Badge */}
                  <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full border border-[rgba(255,255,255,0.1)] bg-white/5 backdrop-blur-md text-blue-300 font-extrabold uppercase tracking-[3px] text-[11px] mb-8 shadow-2xl">
                     <current.badge.icon className="w-4 h-4 text-blue-400" /> 
                     <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-300">
                        {current.badge.text}
                     </span>
                  </div>

                  {/* Facebook Ad Style Headline */}
                  <h1 className="text-[2.5rem] sm:text-6xl md:text-[4.5rem] lg:text-[5rem] font-black text-white tracking-tighter leading-[1.02] mb-7 drop-shadow-2xl whitespace-pre-wrap">
                     {current.headlineTitle}
                     <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 drop-shadow-lg">
                       <i className="not-italic">{current.headlineHighlight}</i>
                     </span>
                     {current.headlineEnd}
                  </h1>

                  {/* Subheadline Hook */}
                  <p className="text-base sm:text-xl lg:text-2xl text-blue-100/70 font-medium leading-[1.6] mb-10 max-w-lg">
                     {current.subHeadline}
                  </p>

                  {/* Bullet Points with Checkmarks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 mb-14">
                     {current.features.map((f, idx) => (
                       <motion.div 
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: 0.2 + (idx * 0.1) }}
                         key={f} 
                         className="flex items-center gap-4"
                       >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 shrink-0 shadow-inner">
                            <CheckCircle2 className="w-4 h-4 text-blue-300 shadow-sm" />
                          </div>
                          <span className="text-[12px] sm:text-[13px] font-black text-white/90 uppercase tracking-[2px]">{f}</span>
                       </motion.div>
                     ))}
                  </div>

                  {/* Giant CTA Button inside the image (just for looks in the Facebook Ad) */}
                  <div className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-5 rounded-[2rem] bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-[3px] text-sm md:text-base border border-blue-400/30 shadow-[0_20px_40px_rgba(37,99,235,0.4)] pointer-events-none">
                     START EARNING NOW <ArrowLeft className="w-5 h-5 rotate-180" />
                  </div>

                  <div className="mt-8 flex items-center gap-3">
                     <ShieldCheck className="w-5 h-5 text-green-400" />
                     <span className="text-xs font-black text-white/40 uppercase tracking-[4px]">Verified Earnings & Secure Payments</span>
                  </div>

                </motion.div>
              </AnimatePresence>
           </div>

           {/* RIGHT CONTENT - Dynamic Phone & Proof */}
           <div className="flex justify-center lg:justify-end items-center order-1 lg:order-2 relative w-full h-[60vh] lg:h-[85vh]">
              
              <div className="relative w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[440px] mx-auto lg:mr-0 z-20">
                 
                 {/* Live Notification Mockups (Massive FOMO) */}
                 <motion.div 
                   animate={{ y: [0, -10, 0] }} 
                   transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                   className="absolute top-[10%] -left-[15%] lg:-left-[25%] z-50 bg-[#1c2333]/90 backdrop-blur-2xl border border-green-500/20 rounded-2xl p-4 shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex items-center gap-4 w-64 lg:w-72 hidden sm:flex"
                 >
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 shrink-0">
                       <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                       <h5 className="text-green-400 font-black text-xs uppercase tracking-widest">Withdrawal Alert</h5>
                       <p className="text-white text-sm font-bold mt-1">David just withdrew ₦4,500</p>
                    </div>
                 </motion.div>

                 <motion.div 
                   animate={{ y: [0, 15, 0] }} 
                   transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                   className="absolute bottom-[20%] -right-[10%] lg:-right-[15%] z-50 bg-[#1c2333]/90 backdrop-blur-2xl border border-blue-500/20 rounded-2xl p-4 shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex items-center gap-4 w-60 lg:w-64"
                 >
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                       <Zap className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                       <h5 className="text-blue-400 font-black text-xs uppercase tracking-widest">New Task Available</h5>
                       <p className="text-white text-sm font-bold mt-1">Earn ₦300 for 1 Minute</p>
                    </div>
                 </motion.div>

                 {/* Urgency Badge Under Phone */}
                 <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-max bg-red-500/10 border border-red-500/20 backdrop-blur-xl px-6 py-3 rounded-full flex items-center gap-3 z-40 hidden sm:flex shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                    <Clock className="w-5 h-5 text-red-400 animate-pulse" />
                    <span className="text-red-400 font-black text-xs tracking-[3px] uppercase">{current.fomoTag}</span>
                 </div>

                 {/* The Phone Outline Block */}
                 <div className="relative shadow-[0_50px_100px_rgba(0,0,0,0.7),0_0_80px_rgba(59,130,246,0.15)] rounded-[3.5rem] sm:rounded-[4rem] lg:rounded-[4.5rem] bg-gradient-to-b from-[#1c1c1e] to-black border border-white/10 p-1.5 sm:p-2.5 z-30 w-full aspect-[9/19.5]">
                    
                    <div className="relative w-full h-full rounded-[3.2rem] sm:rounded-[3.8rem] lg:rounded-[4.2rem] border-[6px] sm:border-[8px] border-black bg-black overflow-hidden flex flex-col items-center">
                       
                       {/* Hardware Side Buttons */}
                       <div className="absolute -left-[14px] top-24 w-[6px] h-12 bg-[#2c2c2e] rounded-l-md z-50" />
                       <div className="absolute -left-[14px] top-40 w-[6px] h-16 bg-[#2c2c2e] rounded-l-md z-50" />
                       <div className="absolute -left-[14px] top-60 w-[6px] h-16 bg-[#2c2c2e] rounded-l-md z-50" />
                       <div className="absolute -right-[14px] top-48 w-[6px] h-20 bg-[#2c2c2e] rounded-r-md z-50" />

                       {/* Inner Screenshot Container */}
                       <div className="absolute inset-0 z-10 bg-black">
                          <Image
                            src="/mockups/dashboard.png" 
                            alt="Screenshot Mockup"
                            fill
                            className="object-cover object-top opacity-95"
                            unoptimized
                          />
                       </div>

                       {/* Dynamic Island / True Depth Camera */}
                       <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 z-30 w-[100px] sm:w-[120px] h-[28px] sm:h-[32px] bg-black rounded-full flex items-center justify-between px-3 md:px-4 shadow-xl border border-white/5">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-white/10" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[#050505] shadow-[inset_0_0_2px_rgba(255,255,255,0.2)]" />
                       </div>
                       
                       {/* Subtle UI Glare */}
                       <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.05] via-transparent to-white/[0.02] pointer-events-none z-20 mix-blend-screen" />
                       
                       {/* Home Indicator */}
                       <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 w-24 sm:w-32 h-1 sm:h-1.5 bg-white/50 rounded-full" />
                    </div>
                 </div>

                 {/* Floor Shadow Under Phone */}
                 <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[90%] h-14 bg-blue-500/20 blur-3xl rounded-full z-10 pointer-events-none" />
                 
              </div>
           </div>
        </div>

        {/* Global Footer Watermark */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center items-center gap-3 text-white/20 font-bold text-[8px] sm:text-[10px] tracking-[5px] uppercase z-10 pointer-events-none drop-shadow-xl text-center w-full px-6">
           <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <span className="text-white text-xs">T</span>
           </div>
           TASKPLAY NIGERIA • ALL RIGHTS RESERVED
        </div>
      </div>


      {/* THE BEAUTIFUL FLOATING MARKETING CONTROLS */}
      {/* Redesigned to be highly appealing "Sidebar/Bottombar" style */}
      <AnimatePresence>
        {uiVisible && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-0 left-0 right-0 sm:bottom-6 sm:left-auto sm:right-6 lg:top-1/2 lg:-translate-y-1/2 lg:left-12 lg:right-auto z-[100] w-full sm:w-[350px] lg:w-[380px] bg-[#0A0F1E]/95 backdrop-blur-3xl sm:rounded-[2.5rem] p-6 lg:p-8 shadow-[0_0_80px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/10 flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
             {/* Header */}
             <div className="flex items-center justify-between mb-8 shrink-0">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                   </div>
                   <div>
                     <span className="block text-[10px] font-black text-white/50 uppercase tracking-[3px]">Marketing Control</span>
                     <span className="block text-sm font-black text-white tracking-widest uppercase mt-0.5">Ad Studio V4</span>
                   </div>
                </div>
                <button 
                  onClick={() => setUiVisible(false)}
                  title="Hide Controls (They are automatically hidden on download)" 
                  className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full active:scale-95 border border-white/5"
                >
                   <EyeOff className="w-5 h-5" />
                </button>
             </div>

             {/* Navigation Arrows */}
             <div className="flex items-center justify-between gap-4 mb-8 shrink-0">
                <button onClick={handlePrev} className="flex-1 h-14 rounded-2xl bg-[#1c2333]/50 hover:bg-[#1c2333] flex items-center justify-center transition-colors text-white active:scale-95 border border-white/5 group">
                   <ChevronLeft className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
                </button>
                <div className="text-center">
                   <span className="text-xs font-black text-blue-400 tracking-[3px] uppercase block">Design</span>
                   <span className="text-[10px] font-bold text-white/30 tracking-[2px]">{activeIndex + 1} OF {campaigns.length}</span>
                </div>
                <button onClick={handleNext} className="flex-1 h-14 rounded-2xl bg-[#1c2333]/50 hover:bg-[#1c2333] flex items-center justify-center transition-colors text-white active:scale-95 border border-white/5 group">
                   <ChevronRight className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
                </button>
             </div>

             {/* Campaign List */}
             <div className="space-y-3 mb-8 flex-1">
                {campaigns.map((c, i) => (
                  <button 
                    key={c.id}
                    onClick={() => setActiveIndex(i)}
                    className={`w-full text-left px-6 py-5 rounded-2xl text-[13px] font-black tracking-widest uppercase transition-all flex items-center gap-4 ${i === activeIndex ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_10px_30px_rgba(37,99,235,0.3)] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]' : 'bg-[#1c2333]/30 hover:bg-[#1c2333]/80 text-white/40 hover:text-white border border-white/5'}`}
                  >
                     <div className={`w-2 h-2 rounded-full ${i === activeIndex ? 'bg-white shadow-[0_0_10px_white]' : 'bg-transparent'}`} />
                     <span className="truncate">{c.id.split('-').join(' ')}</span>
                  </button>
                ))}
             </div>

             {/* Actions */}
             <div className="space-y-4 shrink-0">
                <button 
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full h-16 rounded-[1.5rem] bg-white hover:bg-blue-50 text-black font-black uppercase text-xs tracking-[4px] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_15px_40px_rgba(255,255,255,0.15)] disabled:opacity-50"
                >
                   {downloading ? (
                     <><Loader className="w-5 h-5 text-black animate-spin" /> EXPORTING HD...</>
                   ) : (
                     <><Download className="w-5 h-5 text-black" /> EXPORT AD PNG</>
                   )}
                </button>

                <Link 
                  href="/profile"
                  className="w-full h-16 rounded-[1.5rem] bg-transparent hover:bg-white/5 text-white/40 hover:text-white font-black uppercase text-xs tracking-[4px] flex items-center justify-center gap-3 transition-all border border-white/5"
                >
                  <ArrowLeft className="w-4 h-4" /> EXIT STUDIO
                </Link>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restore UI Button (Shown when UI is hidden manually, but NOT during download) */}
      <AnimatePresence>
        {!uiVisible && !downloading && (
           <motion.button
             initial={{ opacity: 0, scale: 0.5 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.5 }}
             onClick={() => setUiVisible(true)}
             className="fixed bottom-6 right-6 z-[200] w-14 h-14 bg-blue-600 hover:bg-blue-500 backdrop-blur-3xl rounded-full flex items-center justify-center text-white shadow-[0_20px_40px_rgba(37,99,235,0.5)] transition-colors active:scale-95 border border-white/20"
             title="Show Controls"
           >
              <Eye className="w-6 h-6" />
           </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
