"use client";

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight,
  ShieldCheck,
  Star,
  Sparkles,
  Smartphone,
  Banknote,
  Timer,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Zap,
  Users
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/app/components/Logo';

const AmbientOrb = ({ color, size, delay, x, y }: { color: string, size: string, delay: number, x: string, y: string }) => (
  <motion.div
    initial={{ x: 0, y: 0, scale: 1 }}
    animate={{ 
      x: [0, 50, -50, 0],
      y: [0, -30, 30, 0],
      scale: [1, 1.2, 0.9, 1]
    }}
    transition={{ 
      duration: 20 + delay, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }}
    className={`absolute rounded-full blur-[120px] opacity-[0.12] pointer-events-none -z-10 ${color} ${size}`}
    style={{ left: x, top: y }}
  />
);

export default function LandingPage() {
  const [timeLeft, setTimeLeft] = useState("08:42");
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  useEffect(() => {
    const timer = setInterval(() => {
      const mins = Math.floor(Math.random() * 8) + 1;
      const secs = Math.floor(Math.random() * 59);
      setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden selection:bg-primary selection:text-white font-sans">
      
      {/* ─── Navigation Header ─── */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-[#05070A]/60 backdrop-blur-3xl border-b border-white/[0.03] px-4 md:px-12 py-4 md:py-6 flex items-center justify-between">
        <div className="flex-shrink-0">
          <Logo size="sm" />
        </div>
        
        <nav className="hidden lg:flex items-center gap-10">
           {['How It Works', 'Earnings', 'Support'].map((item) => (
             <Link key={item} href={`/#${item.toLowerCase().replace(' ', '')}`} className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-[3px] transition-all hover:tracking-[5px]">
               {item}
             </Link>
           ))}
        </nav>
        
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
           <Link href="/login" className="text-white/40 hover:text-white text-[9px] md:text-[10px] font-black uppercase tracking-[2px] transition-colors px-3 py-2">Sign In</Link>
           <Link href="/signup" className="bg-white/10 hover:bg-white/20 text-white px-4 md:px-8 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[1px] md:tracking-[2px] backdrop-blur-xl border border-white/5 transition-all active:scale-95 shadow-xl whitespace-nowrap">Create Account</Link>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="relative pt-32 md:pt-48 pb-20 md:pb-32 px-6 overflow-hidden" id="hero">
        <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row items-center gap-16 md:gap-24">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 text-center lg:text-left relative z-10"
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full glass border-white/10 mb-8 md:mb-12 bg-blue-500/5 backdrop-blur-3xl shadow-2xl border-blue-500/20"
            >
               <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
               <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[3px] md:tracking-[4px] text-blue-400">15,000+ Active Earners in Nigeria</span>
            </motion.div>

            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-[1.0] lg:leading-[1.1]">
               The Most Trusted <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-purple-400 italic font-medium">Way To Earn Daily.</span>
            </h1>

            <p className="text-base md:text-lg text-white/40 max-w-xl mx-auto lg:mx-0 mb-10 md:mb-16 leading-relaxed font-medium">
              Join the elite earners in Nigeria. Complete quick social tasks like following accounts and get paid instantly to your bank account.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
               <Link href="/signup" className="w-full sm:w-auto px-12 py-5 rounded-[2rem] bg-white text-black font-black text-lg flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:scale-105 transition-all">
                 Get Started <ArrowRight className="w-5 h-5" />
               </Link>
               <div className="flex items-center gap-3 text-white/20 text-[10px] font-black uppercase tracking-[3px]">
                  <ShieldCheck className="w-4 h-4 text-white/40" /> SECURE BANK TRANSFERS
               </div>
            </div>
          </motion.div>

          <motion.div 
            className="flex-1 relative w-full max-w-lg lg:max-w-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative aspect-square">
               {/* 🛒 Character Image */}
               <motion.div 
                 style={{ y: y1 }}
                 className="relative z-20 w-full h-full"
               >
                 <Image 
                    src="/images/hero-character.png" 
                    alt="TaskPlay Character" 
                    width={1741} 
                    height={1741} 
                    priority
                    className="w-full h-full object-contain filter drop-shadow-[0_20px_100px_rgba(59,130,246,0.25)]"
                 />
               </motion.div>

               {/* Background Elements */}
               <motion.div style={{ y: y2 }} className="absolute -top-10 -right-10 w-40 h-40 filter blur-xl opacity-30 select-none">
                  <Image src="/images/coin.png" alt="Coin" width={1536} height={1536} className="w-full h-full object-contain" />
               </motion.div>
               <motion.div style={{ y: y1 }} className="absolute bottom-20 -left-10 w-24 h-24 filter blur-sm opacity-20 select-none">
                  <Image src="/images/coin.png" alt="Coin" width={1536} height={1536} className="w-full h-full object-contain rotate-45" />
               </motion.div>
               
               <div className="absolute inset-0 bg-blue-500/10 blur-[140px] rounded-full -z-10 animate-pulse" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Social Proof / Stats ─── */}
      <section className="py-20 bg-white/[0.01] border-y border-white/[0.03]">
         <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
               {[
                 { label: "Community Members", val: "15K+", icon: <Users className="w-4 h-4" /> },
                 { label: "Total Paid Out", val: "₦12M+", icon: <TrendingUp className="w-4 h-4" /> },
                 { label: "Daily Tasks", val: "500+", icon: <Zap className="w-4 h-4" /> },
                 { label: "Fast Withdrawals", val: "24H", icon: <CreditCard className="w-4 h-4" /> }
               ].map((s, i) => (
                 <div key={i} className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-white/20 mb-3">
                       {s.icon}
                       <span className="text-[9px] font-black uppercase tracking-[3px]">{s.label}</span>
                    </div>
                    <div className="text-3xl md:text-5xl font-black text-white">{s.val}</div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* ─── Feature Sections (Glass Cards) ─── */}
      <section className="py-24 md:py-40 px-6 container mx-auto max-w-7xl" id="howitworks">
         <div className="text-center mb-16 md:mb-24">
            <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter mb-6 underline decoration-blue-500/20 underline-offset-12">Simple Steps to <span className="text-blue-400 italic">Success.</span></h2>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[4px]">How TaskPlay Empowers Your Digital Time</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {[
              { title: "Initialize Profile", desc: "Create your free identity in under 2 minutes. Instant access guaranteed.", icon: <Smartphone className="w-8 h-8" color="#3b82f6" />, delay: 0 },
              { title: "Execute Tasks", desc: "Choose from hundreds of social missions updated every 24 hours.", icon: <Sparkles className="w-8 h-8" color="#f59e0b" />, delay: 0.1 },
              { title: "Redeem Earnings", desc: "Transfer your rewards directly to your bank account with zero delay.", icon: <Banknote className="w-8 h-8" color="#10b981" />, delay: 0.2 },
            ].map((f, i) => (
              <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ delay: f.delay }}
                 viewport={{ once: true }}
                 className="relative group h-full"
              >
                 <div className="h-full glass p-10 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-500 hover:border-blue-500/20 shadow-2xl overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] group-hover:bg-blue-500/10 transition-colors" />
                    <div>
                       <div className="w-16 md:w-20 h-16 md:h-20 rounded-2xl md:rounded-[1.8rem] bg-white/[0.03] border border-white/5 mb-8 md:mb-10 flex items-center justify-center overflow-hidden">
                          {f.icon}
                       </div>
                       <h3 className="text-xl md:text-2xl font-black text-white mb-4 tracking-tight leading-none uppercase italic">{f.title}</h3>
                       <p className="text-white/40 text-sm md:text-base font-medium leading-relaxed italic">{f.desc}</p>
                    </div>
                    <div className="mt-8 md:mt-12 flex items-center gap-2 text-white/20 group-hover:text-white group-hover:translate-x-2 transition-all cursor-pointer">
                       <span className="text-[10px] font-black uppercase tracking-widest leading-none">Learn More</span>
                       <ChevronRight className="w-4 h-4" />
                    </div>
                 </div>
              </motion.div>
            ))}
         </div>
      </section>

      {/* ─── Premium Call to Action ─── */}
      <section className="py-24 md:py-40 px-6 container mx-auto max-w-5xl">
         <motion.div 
            whileInView={{ scale: [0.95, 1], opacity: [0, 1] }}
            viewport={{ once: true }}
            className="glass rounded-[3rem] md:rounded-[4rem] p-10 md:p-24 border-white/5 bg-gradient-to-br from-blue-600/10 to-transparent relative overflow-hidden text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]"
         >
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 blur-[120px] -mr-40 -mt-40 pointer-events-none" />
            
            <h2 className="text-3xl md:text-7xl font-black text-white mb-8 md:mb-10 tracking-tighter italic">Ready to monetize your time?</h2>
            <p className="text-white/40 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12 md:mb-16 leading-relaxed">
               Join 15,000+ Nigerians who have already turned their social accounts into a digital asset.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
               <Link href="/signup" className="px-12 py-5 md:py-6 rounded-[2.5rem] bg-white text-black font-black text-lg md:text-xl flex items-center gap-3 shadow-[0_20px_60px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all w-full md:w-auto">
                 Join TaskPlay Now <ChevronRight className="w-6 h-6" />
               </Link>
               <div className="flex items-center gap-3 px-8 py-5 rounded-[2.5rem] glass border-white/10 text-white/60 text-[10px] font-black uppercase tracking-[3px] italic w-full md:w-auto">
                  Verification Required 🔒 
               </div>
            </div>
         </motion.div>
      </section>

      {/* ─── Refined Footer ─── */}
      <footer className="border-t border-white/[0.03] pt-12 pb-8 px-6" id="support">
         <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-20 mb-12">
               <div className="col-span-1 md:col-span-1">
                  <Logo size="md" className="mb-6" />
                  <p className="text-white/20 text-[10px] font-black uppercase tracking-[3px] leading-relaxed italic">The Premium Rewards Engine for the Future of West Africa.</p>
               </div>
               
               {Object.entries({
                 Platform: [
                   { label: 'Dashboard', href: '/dashboard' },
                   { label: 'CPA Offers', href: '/cpa-offers' },
                   { label: 'Earn Hub', href: '/earn' },
                   { label: 'Social Tasks', href: '/social-tasks' }
                 ],
                 Experience: [
                   { label: 'Member Success', href: '/about' },
                   { label: 'Leaderboard', href: '/dashboard' },
                   { label: 'Transparency', href: '/about' },
                   { label: 'FAQ', href: '/support' }
                 ],
                 Support: [
                   { label: 'Contact Team', href: '/support' },
                   { label: 'Telegram Hub', href: 'https://t.me/taskplay_rewards' },
                   { label: 'Account Security', href: '/support' },
                   { label: 'Terms', href: '/terms' }
                 ]
               }).map(([category, links], ki) => (
                  <div key={ki}>
                     <h4 className="text-white/20 text-[10px] font-black uppercase tracking-[4px] mb-6">{category}</h4>
                     <ul className="space-y-4 md:space-y-6">
                        {links.map((link, li) => (
                          <li key={li}>
                            <Link href={link.href} className="text-white/40 hover:text-white text-sm font-bold transition-all hover:translate-x-1 inline-block italic">
                              {link.label}
                            </Link>
                          </li>
                        ))}
                     </ul>
                  </div>
               ))}
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-t border-white/[0.03] pt-8">
               <div className="text-white/10 text-[9px] font-black uppercase tracking-[8px] italic text-center md:text-left">
                  © 2026 TASKPLAY NIGERIA • ALL RIGHTS RESERVED
               </div>
               <div className="flex items-center gap-3 glass px-5 py-2.5 rounded-2xl border-white/5">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)] animate-pulse" />
                  <span className="text-[10px] font-black text-white/40 tracking-widest">ECOSYSTEM ONLINE</span>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}
