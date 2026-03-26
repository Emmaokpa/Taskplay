"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Download,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Loader
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toPng } from 'html-to-image';

interface Campaign {
  id: string;
  badge: string;
  headlineTitle: string;
  headlineHighlight: string;
  headlineEnd?: string;
  subHeadline: string;
  features: string[];
}

export default function PromoHubFullScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);
  const targetRef = useRef<HTMLDivElement>(null);

  const campaigns: Campaign[] = [
    {
      id: 'flex-protocol',
      badge: 'VERSION 2.0 FOR EARNERS',
      headlineTitle: 'The Future\nof',
      headlineHighlight: 'Earning.',
      subHeadline: 'The ultimate platform for online entrepreneurs. Complete simple social tasks, refer friends, and get paid directly to your bank account securely and instantly.',
      features: ['INSTANT PAYOUTS', 'SOCIAL REWARDS', 'PREMIUM CPA TASKS']
    },
    {
      id: 'infinity-stack',
      badge: 'THE FULL STACK',
      headlineTitle: 'One App.\nInfinite',
      headlineHighlight: 'Potential.',
      subHeadline: 'The ultimate 3-in-1 protocol for modern earners: Instant Rewards, High-Yield CPA campaigns, and a seamless withdrawal experience.',
      features: ['DAILY TASKS', 'BONUS MULTIPLIERS', 'NO HIDDEN FEES']
    },
    {
      id: 'cash-flow',
      badge: 'GUARANTEED INCOME',
      headlineTitle: 'Make Every\nSecond',
      headlineHighlight: 'Count.',
      subHeadline: 'Turn your everyday screen time into a steady stream of income. No complex skills needed—just follow simple instructions and get paid.',
      features: ['ZERO EXPERIENCE', '24/7 EARNING', 'VERIFIED CLIENTS']
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
        pixelRatio: 2, // High resolution
        backgroundColor: '#0A0F1E',
        style: {
          margin: '0',
          padding: '0'
        }
      });
      
      const link = document.createElement('a');
      link.download = `TaskPlay_${current.id}_mockup.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
      alert('Failed to generate image.');
    } finally {
      setUiVisible(true);
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden font-sans relative">
      
      {/* THE ACTUAL RENDER TARGET - Fully Responsive & Scalable */}
      <div 
        ref={targetRef} 
        className="w-full min-h-screen relative overflow-hidden flex flex-col justify-center py-20 lg:py-0"
        style={{ backgroundColor: '#0A0F1E' }}
      >
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[80vw] lg:w-[60vw] h-[100vh] bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.18),transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[80vw] lg:w-[50vw] h-[80vh] bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.12),transparent_70%)] pointer-events-none" />
        
        {/* Abstract grids / texture */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

        <div className="max-w-[1400px] mx-auto w-full px-6 md:px-12 lg:px-24 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center z-10 relative">
           
           {/* LEFT TEXT CONTENT */}
           <div className="flex flex-col justify-center order-2 lg:order-1 relative lg:pl-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-xl mx-auto lg:mx-0"
                >
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 font-extrabold uppercase tracking-[3px] text-xs mb-8 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                     <Sparkles className="w-4 h-4" /> {current.badge}
                  </div>

                  {/* Massive Headline */}
                  <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black text-white tracking-tighter leading-[1.05] mb-6 drop-shadow-lg whitespace-pre-wrap">
                     {current.headlineTitle}{' '}
                     <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-sm">
                       {current.headlineHighlight}
                     </span>
                     {current.headlineEnd}
                  </h1>

                  {/* Subheadline */}
                  <p className="text-base sm:text-lg lg:text-xl text-white/50 font-medium leading-[1.7] mb-10 max-w-lg">
                     {current.subHeadline}
                  </p>

                  {/* Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 mb-12">
                     {current.features.map((f, idx) => (
                       <motion.div 
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: 0.2 + (idx * 0.1) }}
                         key={f} 
                         className="flex items-center gap-3"
                       >
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="text-[13px] font-black text-white/90 uppercase tracking-[2px]">{f}</span>
                       </motion.div>
                     ))}
                  </div>

                  {/* Trust Footer */}
                  <div className="flex items-center gap-5 mt-6 pt-8 border-t border-white/5">
                     <div className="flex -space-x-3 shrink-0">
                        <div className="w-10 md:w-12 h-10 md:h-12 rounded-full border-2 border-[#0A0F1E] bg-blue-500 flex items-center justify-center text-white font-black text-xs md:text-sm shadow-xl z-30">E</div>
                        <div className="w-10 md:w-12 h-10 md:h-12 rounded-full border-2 border-[#0A0F1E] bg-indigo-500 flex items-center justify-center text-white font-black text-xs md:text-sm shadow-xl z-20">S</div>
                        <div className="w-10 md:w-12 h-10 md:h-12 rounded-full border-2 border-[#0A0F1E] bg-purple-500 flex items-center justify-center text-white font-black text-xs md:text-sm shadow-xl z-10">J</div>
                        <div className="w-10 md:w-12 h-10 md:h-12 rounded-full border-2 border-[#0A0F1E] bg-white flex items-center justify-center text-[#0A0F1E] font-black text-[10px] md:text-xs shadow-xl tracking-tighter z-0">15k+</div>
                     </div>
                     <div>
                        <h4 className="text-base font-black text-white leading-tight">Trusted by Top Earners</h4>
                        <p className="text-[9px] sm:text-[10px] font-bold text-white/40 uppercase tracking-[3px] mt-0.5">Official TaskPlay Protocol</p>
                     </div>
                  </div>
                </motion.div>
              </AnimatePresence>
           </div>

           {/* RIGHT PHONE CONTENT */}
           <div className="flex justify-center lg:justify-end items-center order-1 lg:order-2 relative w-full h-full lg:min-h-[85vh]">
              
              <div className="relative w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[420px] mx-auto lg:mr-0 z-20">
                 
                 {/* Floating Gamification Elements - Like Prepwise */}
                 <motion.div 
                   animate={{ y: [0, -15, 0] }} 
                   transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                   className="absolute -top-[5%] -right-[10%] lg:-top-[10%] lg:-right-[15%] w-20 h-20 lg:w-28 lg:h-28 bg-white/5 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center rotate-12 z-40"
                 >
                    <span className="text-4xl lg:text-6xl drop-shadow-2xl">🎁</span>
                 </motion.div>

                 <motion.div 
                   animate={{ y: [0, 20, 0] }} 
                   transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                   className="absolute bottom-[15%] -left-[10%] lg:bottom-[20%] lg:-left-[15%] w-16 h-16 lg:w-24 lg:h-24 bg-white/5 backdrop-blur-xl rounded-2xl md:rounded-[1.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center -rotate-[15deg] z-40"
                 >
                    <span className="text-3xl lg:text-5xl drop-shadow-2xl">💸</span>
                 </motion.div>

                 {/* The Actual Phone Mockup Container */}
                 <div className="relative shadow-[0_40px_100px_rgba(37,99,235,0.2)] rounded-[3.5rem] sm:rounded-[4rem] lg:rounded-[4.5rem] bg-[#0A0F1E] border border-white/5 p-1.5 sm:p-2 z-30 transform transition-transform duration-700 w-full aspect-[9/19.5]">
                    
                    {/* The Phone Frame */}
                    <div className="relative w-full h-full rounded-[3.2rem] sm:rounded-[3.8rem] lg:rounded-[4.2rem] border-[10px] sm:border-[12px] lg:border-[14px] border-[#1c1c1e] bg-black overflow-hidden shadow-inner flex flex-col">
                       
                       {/* Hardware Details - Side Buttons */}
                       <div className="absolute -left-[10px] sm:-left-[12px] lg:-left-[14px] top-20 w-[4px] sm:w-[5px] h-10 bg-[#2c2c2e] rounded-l-sm z-50" />
                       <div className="absolute -left-[10px] sm:-left-[12px] lg:-left-[14px] top-36 w-[4px] sm:w-[5px] h-16 bg-[#2c2c2e] rounded-l-sm z-50" />
                       <div className="absolute -left-[10px] sm:-left-[12px] lg:-left-[14px] top-56 w-[4px] sm:w-[5px] h-16 bg-[#2c2c2e] rounded-l-sm z-50" />
                       <div className="absolute -right-[10px] sm:-right-[12px] lg:-right-[14px] top-44 w-[4px] sm:w-[5px] h-20 bg-[#2c2c2e] rounded-r-sm z-50" />

                       {/* Screenshot Background Display */}
                       <div className="absolute inset-0 z-10 bg-[#0A0F1E]">
                          <Image
                            src="/mockups/dashboard.png" // User uploaded screenshot
                            alt="Screenshot Mockup"
                            fill
                            className="object-cover object-top"
                            unoptimized
                          />
                       </div>

                       {/* Dynamic Island / Notch Area */}
                       <div className="absolute top-2 sm:top-3 lg:top-4 left-1/2 -translate-x-1/2 z-30 w-[100px] sm:w-[110px] lg:w-[130px] h-7 sm:h-8 lg:h-9 bg-black rounded-full flex items-center justify-between px-3 md:px-4 shadow-xl">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#111] shadow-inner" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[#0a0a0a]" />
                       </div>
                       
                       {/* Glossy Screen Glare */}
                       <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.04] via-transparent to-white/[0.1] pointer-events-none z-20 mix-blend-overlay" />
                       
                       {/* Home Indicator */}
                       <div className="absolute bottom-2 sm:bottom-3 lg:bottom-4 left-1/2 -translate-x-1/2 z-30 w-24 sm:w-28 h-1 sm:h-1.5 bg-white/40 rounded-full" />
                    </div>
                 </div>

                 {/* Floor Shadow Under Phone */}
                 <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-10 bg-black/80 blur-2xl rounded-full z-10 pointer-events-none" />
                 
              </div>
           </div>
        </div>

        {/* Global Footer Watermark */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center items-center gap-2 sm:gap-3 text-white/10 font-bold text-[8px] sm:text-[10px] tracking-[4px] uppercase z-10 pointer-events-none opacity-50 w-full px-4 text-center">
           <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-white/5 flex items-center justify-center shrink-0">T</div>
           PREPWISE-INSPIRED TASKPLAY PROTOCOL • ALL RIGHTS RESERVED
        </div>
      </div>


      {/* THE FLOATING MARKETING CONTROLS - (Hidden during capture) */}
      <AnimatePresence>
        {uiVisible && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 left-0 right-0 lg:bottom-auto lg:top-12 lg:left-12 lg:right-auto z-[100] w-[90%] mx-auto lg:mx-0 lg:w-80 bg-[#0e1424]/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 lg:p-6 shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden max-h-[85vh] lg:max-h-none"
          >
             {/* Header */}
             <div className="flex items-center justify-between mb-6 shrink-0 pt-2 lg:pt-0">
                <div className="flex bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-1.5">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[3px]">Marketing V3</span>
                </div>
                <button title="Hide Controls (They are automatically hidden on download)" className="text-white/20 hover:text-white transition-colors bg-white/5 rounded-full p-2">
                   <EyeOff className="w-4 h-4" />
                </button>
             </div>

             {/* Navigation Arrows */}
             <div className="flex items-center justify-between gap-3 mb-6 shrink-0 relative bg-black/20 p-1.5 rounded-2xl border border-white/5">
                <button onClick={handlePrev} className="flex-1 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white active:scale-95 border border-white/5">
                   <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={handleNext} className="flex-1 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white active:scale-95 border border-white/5">
                   <ChevronRight className="w-5 h-5" />
                </button>
             </div>

             {/* Campaign List */}
             <div className="space-y-1.5 mb-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {campaigns.map((c, i) => (
                  <button 
                    key={c.id}
                    onClick={() => setActiveIndex(i)}
                    className={`w-full text-left px-5 py-4 rounded-2xl text-[13px] font-black tracking-wide transition-all ${i === activeIndex ? 'bg-blue-500 text-white shadow-xl shadow-blue-500/20' : 'text-white/40 hover:text-white hover:bg-white/5 bg-black/20 border border-white/5'}`}
                  >
                     <div className="flex items-center gap-3">
                        {i === activeIndex && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />}
                        <span className="truncate">{c.headlineTitle.replace('\n', ' ')}</span>
                     </div>
                  </button>
                ))}
             </div>

             {/* Actions */}
             <div className="space-y-3 shrink-0 pt-2 border-t border-white/10">
                <button 
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full py-4 rounded-2xl bg-white hover:bg-gray-100 text-black font-black uppercase text-xs tracking-[3px] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl disabled:opacity-50"
                >
                   {downloading ? (
                     <><Loader className="w-4 h-4 text-black animate-spin" /> Rendering...</>
                   ) : (
                     <><Download className="w-4 h-4 text-black" /> Download PNG</>
                   )}
                </button>

                <Link 
                  href="/profile"
                  className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white font-black uppercase text-xs tracking-[3px] flex items-center justify-center gap-3 transition-all border border-white/5"
                >
                  <ArrowLeft className="w-4 h-4" /> Exit Setup
                </Link>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
