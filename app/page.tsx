"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight,
  Zap,
  ShieldCheck,
  Star,
  Sparkles,
  Smartphone,
  Globe,
  Banknote,
  Users,
  Timer,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import Logo from '@/app/components/Logo';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FloatingParticle = ({ children, delay = 0, x = 0, y = 0 }: any) => {
  const [randomX] = useState(() => Math.random() * 100);
  const [randomY] = useState(() => Math.random() * 100);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0.1, 0.3, 0.1], 
        scale: [1, 1.2, 1],
        x: [0, x, 0],
        y: [0, y, 0],
      }}
      transition={{ 
        duration: 15 + Math.random() * 10, 
        repeat: Infinity, 
        delay,
        ease: "easeInOut" 
      }}
      className="absolute pointer-events-none z-0"
      style={{ left: `${randomX}%`, top: `${randomY}%` }}
    >
      {children}
    </motion.div>
  );
};

export default function LandingPage() {
  const [timeLeft, setTimeLeft] = useState("05:42");

  // Timer effect for FOMO
  useEffect(() => {
    const timer = setInterval(() => {
      const mins = Math.floor(Math.random() * 5) + 1;
      const secs = Math.floor(Math.random() * 59);
      setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#05070A] overflow-x-hidden selection:bg-primary selection:text-white pb-20">
      {/* SEOLOGIC: Semantic Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-[#05070A]/80 backdrop-blur-xl border-b border-white/[0.05] md:px-12 px-4 py-4 flex items-center justify-between">
        <Logo size="sm" className="hidden sm:flex" />
        <Logo size="sm" className="flex sm:hidden" /> {/* On very small screens, keep it compact */}
        
        <div className="hidden lg:flex items-center gap-10">
           {['How It Works', 'Earnings', 'Support'].map((item) => (
             <Link key={item} href={`/#${item.toLowerCase().replace(' ', '')}`} className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-[4px] transition-colors">
               {item}
             </Link>
           ))}
        </div>
        
        <div className="flex items-center gap-3">
           <Link href="/login" className="text-white/40 hover:text-white text-[9px] md:text-xs font-black uppercase tracking-[2px] transition-colors">SignIn</Link>
           <Link href="/signup" className="clay-button px-5 md:px-8 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[2px] text-white">Join Now</Link>
        </div>
      </header>

      {/* Floating Elements Background */}
      <div className="fixed inset-0 overflow-hidden -z-10 bg-[#05070A]">
        {[...Array(15)].map((_, i) => (
           <FloatingParticle key={i} x={50} y={-40} delay={i * 2}>
              {i % 3 === 0 ? <Star className="text-primary w-4 h-4" /> : i % 2 === 0 ? <Sparkles className="text-accent/20 w-5 h-5" /> : <Zap className="text-yellow-400 w-4 h-4 opacity-10" />}
           </FloatingParticle>
        ))}
        <div className="absolute top-0 right-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[140px] rounded-full" />
      </div>

      <div className="container mx-auto px-6">
        {/* HERO SECTION - REFINED FOR VALUE & MODERATE SIZE */}
        <motion.section 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="pt-40 md:pt-48 pb-20 text-center max-w-5xl mx-auto"
          id="hero"
        >
          <motion.div 
            initial={{ y: 20 }} animate={{ y: 0 }} 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 mb-8 bg-white/[0.02] backdrop-blur-3xl shadow-xl border-blue-500/10"
          >
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
             <span className="text-[9px] font-black uppercase tracking-[3px] text-blue-400">Join Over 15,000+ Active Earners Today</span>
          </motion.div>

          <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1] drop-shadow-2xl">
             Turn Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-accent italic">Online Activity</span> <br /> 
             <span className="opacity-90">Into Real Cash Rewards.</span>
          </h1>

          <p className="text-base md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed font-medium tracking-tight">
            The simplest way to make money online. Complete tasks like following social accounts, liking posts, or joining channels and get paid instantly.
          </p>

          <div className="flex flex-col items-center justify-center gap-6">
             <Link href="/signup" className="clay-button px-12 py-5 rounded-3xl font-black text-lg text-white flex items-center gap-3 shadow-2xl shadow-primary/30 hover:scale-105 transition-all w-full sm:w-auto uppercase tracking-tight">
               Start Earning Now <ArrowRight className="w-5 h-5" />
             </Link>
             <div className="flex items-center gap-4 text-white/20 text-[10px] font-black uppercase tracking-[3px]">
                <ShieldCheck className="w-4 h-4 text-green-500/50" /> Secure Payments & Verified Tasks
             </div>
          </div>
        </motion.section>

        {/* 🚨 FOMO / URGENCY SECTION - TONED DOWN */}
        <section className="py-20 relative overflow-hidden" id="fomo">
           <div className="max-w-4xl mx-auto glass p-8 md:p-16 rounded-[3rem] border-primary/10 bg-primary/5 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
              <div className="absolute top-4 right-8 bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase flex items-center gap-2 border border-blue-500/10">
                 <Timer className="w-4 h-4" /> Limited Slots Today
              </div>

              <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight leading-none italic uppercase">Don't Get Left Behind</h2>
              
              <div className="space-y-6 text-white/50 text-base md:text-lg font-medium leading-relaxed italic max-w-2xl mx-auto">
                 <p>Every day, thousands of users join TaskPlay to monetize their spare time. <br className="hidden md:block"/> Our platform connects you with the highest-paying opportunities in real-time.</p>
                 <p>Slots are limited to ensure consistent high payouts for our active members. <span className="text-primary font-bold">Secure your account today.</span></p>
              </div>

              <div className="mt-12 bg-white/[0.03] p-6 rounded-3xl border border-white/5 max-w-sm mx-auto">
                 <p className="text-sm text-primary font-black uppercase tracking-widest mb-3 leading-none italic">⚡️ Start your journey today.</p>
                 <Link href="/signup" className="text-white border-b-2 border-white/20 hover:border-white transition-all font-black text-lg italic">
                    Create Your Account
                 </Link>
              </div>
           </div>
        </section>

        {/* 💰 HOW IT WORKS */}
        <section className="py-32" id="howitworks">
           <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter">Earn Money in <span className="text-primary italic">3 Steps</span></h2>
              <p className="text-white/30 text-[10px] font-black tracking-widest uppercase">Start making money in less than 5 minutes.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Join Us", desc: "Create your free account in moments. No complex forms required.", Icon: Smartphone, color: "text-blue-400" },
                { step: "02", title: "Do Tasks", desc: "Browse through hundreds of available social tasks and CPA offers.", Icon: Zap, color: "text-amber-400" },
                { step: "03", title: "Withdraw", desc: "Cash out your earnings directly to your verified bank account.", Icon: Banknote, color: "text-emerald-400" },
              ].map((s, i) => (
                <div key={i} className="clay-card p-10 group hover:bg-primary/5 transition-all relative overflow-hidden">
                   <div className="absolute -top-10 -right-10 text-[8rem] font-black text-white/[0.02] -z-10 group-hover:text-primary/5 transition-colors">{s.step}</div>
                   <div className="w-14 h-14 rounded-2xl glass mb-8 flex items-center justify-center border border-white/5 shadow-xl group-hover:bg-primary/10 transition-all">
                      <s.Icon className={`w-7 h-7 ${s.color}`} />
                   </div>
                   <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{s.title}</h3>
                   <p className="text-white/40 text-sm font-medium leading-relaxed italic">{s.desc}</p>
                </div>
              ))}
           </div>
        </section>

        {/* SEO OPTIMIZED CONTENT / TRUST */}
        <section className="py-32 border-t border-white/[0.03]">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                 <h3 className="text-white/10 font-black uppercase text-[9px] tracking-[6px] mb-6">Nigeria's Leading Rewards Engine</h3>
                 <h4 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight leading-none italic text-wrap">Maximize Your <span className="text-accent underline decoration-primary/30">Digital Presence</span></h4>
                 <p className="text-white/40 text-base font-medium leading-relaxed italic mb-10">TaskPlay is designed for performance. Whether you are on mobile or desktop, our platform offers a seamless experience that turns your idle time into a consistent revenue stream.</p>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-5 glass rounded-3xl border border-white/5">
                       <ShieldCheck className="w-6 h-6 text-green-500 mb-3" />
                       <div className="text-white font-black text-lg mb-1 italic">Secure Pay</div>
                       <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest">Verified Transfers</p>
                    </div>
                    <div className="p-5 glass rounded-3xl border border-white/5">
                       <Globe className="w-6 h-6 text-blue-500 mb-3" />
                       <div className="text-white font-black text-lg mb-1 italic">Real Tasks</div>
                       <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest">Global Reach</p>
                    </div>
                 </div>
              </div>
              
              <div className="relative">
                 <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full" />
                 <div className="clay-card p-1.5 relative z-10">
                    <div className="glass p-8 rounded-[2.5rem] border border-white/5">
                       <div className="flex items-center justify-between mb-8">
                          <div className="text-[9px] font-black text-white/20 uppercase tracking-[3px]">Verified Payouts</div>
                          <span className="text-[10px] text-green-400 font-bold">Live Stream</span>
                       </div>
                       <div className="space-y-5">
                          {[
                            { name: "Ahmed F.", amt: "₦12,500", time: "2 mins ago" },
                            { name: "Chisom O.", amt: "₦5,200", time: "Just now" },
                            { name: "Blessing Y.", amt: "₦25,000", time: "16 mins ago" },
                          ].map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-4 glass rounded-2xl border-white/5">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-black text-[10px] text-white/40">{p.name[0]}</div>
                                  <div>
                                     <div className="text-xs font-black text-white">{p.name}</div>
                                     <div className="text-[7px] text-white/20 uppercase tracking-widest">{p.time}</div>
                                  </div>
                               </div>
                               <div className="text-base font-black text-primary italic">+{p.amt}</div>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* REFINED FOOTER */}
        <footer className="border-t border-white/[0.03] pt-24 pb-12" id="support">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-20 text-left">
              <div className="lg:col-span-1">
                 <Logo size="md" className="mb-8" />
                 <p className="text-white/20 text-xs font-medium italic leading-relaxed max-w-xs">Connecting businesses with authentic users since 2026. Empowering your time, one task at a time.</p>
              </div>

              <div>
                 <h4 className="text-white font-black uppercase text-[9px] tracking-[4px] mb-8 opacity-40 border-l-2 border-primary pl-4">Fast Access</h4>
                 <ul className="space-y-4">
                    {['Register Account', 'How It Works', 'Verified Proofs', 'Dashboard'].map(li => (
                      <li key={li}><Link href="/signup" className="text-white/40 hover:text-white text-xs font-medium transition-colors flex items-center gap-2 group italic"> {li} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all text-primary" /></Link></li>
                    ))}
                 </ul>
              </div>

              <div>
                 <h4 className="text-white font-black uppercase text-[9px] tracking-[4px] mb-8 opacity-40 border-l-2 border-accent pl-4">Company</h4>
                 <ul className="space-y-4">
                    {['About Us', 'Privacy Policy', 'Terms of Service', 'Support'].map(li => (
                      <li key={li}><Link href={li.includes('Privacy') ? '/privacy-policy' : li.includes('Terms') ? '/terms' : '/about'} className="text-white/40 hover:text-white text-xs font-medium transition-colors italic">{li}</Link></li>
                    ))}
                 </ul>
              </div>

              <div>
                 <h4 className="text-white font-black uppercase text-[9px] tracking-[4px] mb-8 opacity-40 border-l-2 border-primary pl-4">Community</h4>
                 <ul className="space-y-4">
                    {['Connect via Telegram', 'Follow on X', 'Global Community'].map(li => (
                      <li key={li}><span className="text-white/20 hover:text-white text-xs font-medium transition-colors italic cursor-pointer">{li}</span></li>
                    ))}
                 </ul>
              </div>
           </div>

           <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-t border-white/[0.03] pt-12">
              <div className="text-white/10 text-[8px] font-black uppercase tracking-[6px] text-center md:text-left italic">
                 © 2026 TASKPLAY • EMPOWERING YOUR TIME • SECURE ENGINE
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black text-white/20">
                 <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)] animate-pulse" /> SYSTEM READY
              </div>
           </div>
        </footer>
      </div>

    </div>
  );
}
