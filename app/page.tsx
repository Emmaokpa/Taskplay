"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  Share2, 
  ArrowRight,
  Zap,
  ShieldCheck,
  Coins,
  ChevronDown,
  Info,
  LifeBuoy,
  CheckCircle2,
  Wallet,
  ChevronRight,
  Plus,
  Star,
  Sparkles,
  LayoutDashboard,
  Smartphone,
  Heart,
  Globe,
  TrendingUp,
  Banknote,
  Users,
  Timer,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import Logo from '@/app/components/Logo';

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
      <header className="fixed top-0 left-0 right-0 z-[100] bg-[#05070A]/80 backdrop-blur-xl border-b border-white/[0.05] md:px-12 px-6 py-5 flex items-center justify-between">
        <Logo />
        <div className="hidden lg:flex items-center gap-10">
           {['How It Works', 'Earnings', 'Support'].map((item) => (
             <Link key={item} href={`/#${item.toLowerCase().replace(' ', '')}`} className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-[4px] transition-colors">
               {item}
             </Link>
           ))}
        </div>
        <div className="flex items-center gap-4">
           <Link href="/login" className="text-white/40 hover:text-white text-xs font-black uppercase tracking-[2px] transition-colors">SignIn</Link>
           <Link href="/signup" className="clay-button px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[2px] text-white">Join Now</Link>
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
        {/* HERO SECTION - REFINED FOR NIGERIAN FOMO */}
        <motion.section 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="pt-48 md:pt-64 pb-32 text-center max-w-6xl mx-auto"
          id="hero"
        >
          <motion.div 
            initial={{ y: 20 }} animate={{ y: 0 }} 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border-white/10 mb-10 bg-white/[0.02] backdrop-blur-3xl shadow-xl border-green-500/10"
          >
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
             <span className="text-[10px] font-black uppercase tracking-[4px] text-green-400">142 Registration Spots remaining today</span>
          </motion.div>

          <h1 className="text-6xl md:text-[10rem] font-black text-white mb-8 tracking-tighter leading-[0.9] drop-shadow-2xl">
             People Are <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-accent">Paid Daily…</span> <br /> 
             <span className="opacity-40">Why Aren’t You?</span>
          </h1>

          <p className="text-lg md:text-3xl text-white/50 max-w-3xl mx-auto mb-16 leading-relaxed font-bold tracking-tight italic">
            Join thousands earning real money by completing simple tasks online. No experience. No stress. Just results.
          </p>

          <div className="flex flex-col items-center justify-center gap-8">
             <Link href="/signup" className="clay-button px-16 py-8 rounded-[2.5rem] font-black text-2xl text-white flex items-center gap-4 shadow-2xl shadow-primary/30 hover:scale-105 transition-all w-full sm:w-auto uppercase tracking-tighter italic">
               👉 Start Earning Now <ArrowRight className="w-7 h-7" />
             </Link>
             <div className="flex items-center gap-4 text-white/20 text-xs font-black uppercase tracking-[3px]">
                <Users className="w-4 h-4" /> 15,482 Active Earners
             </div>
          </div>
        </motion.section>

        {/* 🚨 FOMO / URGENCY SECTION */}
        <section className="py-32 relative overflow-hidden" id="fomo">
           <div className="max-w-4xl mx-auto glass p-10 md:p-20 rounded-[4rem] border-primary/20 bg-primary/5 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
              <div className="absolute top-4 right-8 bg-red-500/20 text-red-400 px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-2 border border-red-500/10">
                 <Timer className="w-4 h-4 animate-spin-slow" /> {timeLeft} Left
              </div>

              <h2 className="text-4xl md:text-7xl font-black text-white mb-10 tracking-tight leading-none italic uppercase underline decoration-primary/30">Spots Are Filling Fast…</h2>
              
              <div className="space-y-8 text-white/60 text-lg md:text-xl font-bold leading-relaxed italic max-w-2xl mx-auto">
                 <p>Every day, more users join and start earning immediately. <br className="hidden md:block"/> But here’s the truth — <span className="text-white">not everyone gets in.</span></p>
                 <p>We limit access to keep payouts high and opportunities consistent. Once slots are full, <span className="text-red-400">registration closes.</span></p>
              </div>

              <div className="mt-16 bg-white/[0.03] p-8 rounded-3xl border border-white/5 max-w-md mx-auto">
                 <p className="text-xl text-primary font-black uppercase tracking-widest mb-4 leading-none italic">⏳ Don’t wait until it’s too late.</p>
                 <Link href="/signup" className="text-white border-b-2 border-white/20 hover:border-white transition-all font-black text-xl italic">
                    Secure Your Spot Now
                 </Link>
              </div>
           </div>
        </section>

        {/* 💰 HOW IT WORKS */}
        <section className="py-40" id="howitworks">
           <div className="text-center mb-24">
              <h2 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter">Earn in 3 <span className="text-primary italic">Simple Steps</span></h2>
              <p className="text-white/30 text-lg font-bold tracking-widest uppercase">That’s it. No complicated process. No hidden tricks.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { step: "01", title: "Sign Up", desc: "Create your account in less than 2 minutes. Quick and easy.", icon: <Smartphone className="text-pink-400" /> },
                { step: "02", title: "Perform Tasks", desc: "Follow, like, share, or register for high-paying offers.", icon: <Zap className="text-yellow-400" /> },
                { step: "03", title: "Get Paid", desc: "Withdraw earnings directly to your bank account instantly.", icon: <Banknote className="text-green-400" /> },
              ].map((s, i) => (
                <div key={i} className="clay-card p-12 group hover:bg-primary/5 transition-all relative overflow-hidden">
                   <div className="absolute -top-10 -right-10 text-[10rem] font-black text-white/[0.02] -z-10 group-hover:text-primary/5 transition-colors">{s.step}</div>
                   <div className="w-16 h-16 rounded-2xl glass mb-10 flex items-center justify-center border border-white/5 shadow-xl group-hover:bg-primary/10 transition-all">
                      {React.cloneElement(s.icon as any, { className: "w-8 h-8" })}
                   </div>
                   <h3 className="text-3xl font-black text-white mb-6 tracking-tight">{s.title}</h3>
                   <p className="text-white/40 text-base font-bold leading-relaxed italic">{s.desc}</p>
                </div>
              ))}
           </div>
        </section>

        {/* SEO OPTIMIZED CONTENT / TRUST */}
        <section className="py-40 border-t border-white/[0.05]">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
              <div>
                 <h3 className="text-white/20 font-black uppercase text-xs tracking-[8px] mb-8">Nigeria's #1 Rewards Pipeline</h3>
                 <h4 className="text-4xl md:text-6xl font-black text-white mb-10 tracking-tight leading-none italic">Built for the <span className="text-accent underline">Hustler</span> in you.</h4>
                 <p className="text-white/40 text-lg font-bold leading-relaxed italic mb-12">TaskPlay is optimized for mobile performance, meaning you can earn while in traffic, while in class, or from the comfort of your home. Real money, real time.</p>
                 
                 <div className="grid grid-cols-2 gap-8">
                    <div className="p-6 glass rounded-3xl border border-white/5">
                       <ShieldCheck className="w-8 h-8 text-green-500 mb-4" />
                       <div className="text-white font-black text-xl mb-1 italic">Secure Banks</div>
                       <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Instant Transfers</p>
                    </div>
                    <div className="p-6 glass rounded-3xl border border-white/5">
                       <Globe className="w-8 h-8 text-blue-500 mb-4" />
                       <div className="text-white font-black text-xl mb-1 italic">Global Tasks</div>
                       <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Unlimited Gigs</p>
                    </div>
                 </div>
              </div>
              
              <div className="relative">
                 <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full" />
                 <div className="clay-card p-2 relative z-10">
                    <div className="glass p-10 rounded-[3rem] border border-white/5">
                       <div className="flex items-center justify-between mb-10">
                          <div className="text-[10px] font-black text-white/20 uppercase tracking-[4px]">Verified Proofs</div>
                          <span className="text-xs text-green-400 font-bold">Just Paid</span>
                       </div>
                       <div className="space-y-6">
                          {[
                            { name: "Ahmed F.", amt: "₦12,500", time: "2 mins ago" },
                            { name: "Chisom O.", amt: "₦5,200", time: "Just now" },
                            { name: "Blessing Y.", amt: "₦25,000", time: "16 mins ago" },
                          ].map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-4 glass rounded-2xl border-white/5">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-black text-xs text-white/40">{p.name[0]}</div>
                                  <div>
                                     <div className="text-sm font-black text-white">{p.name}</div>
                                     <div className="text-[8px] text-white/20 uppercase tracking-widest">{p.time}</div>
                                  </div>
                               </div>
                               <div className="text-lg font-black text-primary italic">+{p.amt}</div>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* REFINED FOOTER */}
        <footer className="border-t border-white/[0.05] pt-32 pb-16" id="support">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-24 text-left">
              <div className="lg:col-span-1">
                 <Logo size="lg" className="mb-10" />
                 <p className="text-white/20 text-sm font-bold italic leading-relaxed max-w-xs">Nigeria's premier task monetization engine. We empower your time, one gig at a time.</p>
              </div>

              <div>
                 <h4 className="text-white font-black uppercase text-[10px] tracking-[6px] mb-12 opacity-50 border-l-2 border-primary pl-4 uppercase">Fast Access</h4>
                 <ul className="space-y-5">
                    {['Register Account', 'How It Works', 'Verified Proofs', 'Our Mission'].map(li => (
                      <li key={li}><Link href="/signup" className="text-white/40 hover:text-white text-sm font-bold transition-colors flex items-center gap-2 group italic"> {li} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all text-primary" /></Link></li>
                    ))}
                 </ul>
              </div>

              <div>
                 <h4 className="text-white font-black uppercase text-[10px] tracking-[6px] mb-12 opacity-50 border-l-2 border-accent pl-4 uppercase">Support</h4>
                 <ul className="space-y-5">
                    {['HELP CENTER', 'PAYOUT STATUS', 'PRIVACY POLICY', 'TERMS OF SERVICE'].map(li => (
                      <li key={li}><Link href={li.includes('PRIVACY') ? '/privacy-policy' : li.includes('TERMS') ? '/terms' : '/about'} className="text-white/40 hover:text-white text-sm font-bold transition-colors italic uppercase tracking-tighter">{li}</Link></li>
                    ))}
                 </ul>
              </div>

              <div>
                 <h4 className="text-white font-black uppercase text-[10px] tracking-[6px] mb-12 opacity-50 border-l-2 border-primary pl-4 uppercase">Community</h4>
                 <ul className="space-y-5">
                    {['Join Telegram', 'Follow on Twitter', 'Official Instagram', 'Facebook Group'].map(li => (
                      <li key={li}><span className="text-white/20 hover:text-white text-sm font-bold transition-colors italic cursor-pointer">{li}</span></li>
                    ))}
                 </ul>
              </div>
           </div>

           <div className="flex flex-col md:flex-row items-center justify-between gap-10 border-t border-white/[0.05] pt-16">
              <div className="text-white/10 text-[9px] font-black uppercase tracking-[8px] text-center md:text-left italic">
                 © 2026 TASKPLAY NIGERIA • ALL EARNINGS TAXED & VERIFIED • SECURE INFRASTRUCTURE
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black text-white/20">
                 <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse" /> ENGINE ONLINE
              </div>
           </div>
        </footer>
      </div>
    </div>
  );
}
