"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  ArrowUpRight, 
  Rocket, 
  Share2, 
  Wallet,
  AlertCircle,
  X,
  Zap,
  Gamepad2
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { CardSkeleton, StatSkeleton } from '@/app/components/Skeleton';

interface UserData {
  balance?: number;
  isMember?: boolean;
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && isMounted) {
            setUserData(userDoc.data());
          }
        } catch (err) {
          console.error('Error fetching dashboard data:', err);
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        router.push('/login');
      }
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [router]);

  if (loading) return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StatSkeleton />
          <div className="hidden md:block"><StatSkeleton /></div>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          <CardSkeleton />
          <CardSkeleton />
       </div>
    </div>
  );

   return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto pb-40 relative z-10">
      <div className="mb-12 flex items-center justify-between">
         <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h1 className="text-3xl font-black text-white mb-1 tracking-tighter uppercase italic">Your Wallet</h1>
            <p className="text-white/40 text-xs font-black uppercase tracking-[3px]">Financial Overview</p>
         </motion.div>
          {userData && !userData.isMember && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
               <Link href="/upgrade" className="glass px-3 py-1.5 rounded-xl border-blue-500/20 hover:border-blue-500/40 active:scale-95 transition-all text-blue-400 text-[8px] sm:text-[9px] font-black uppercase tracking-[2px] shadow-2xl bg-blue-500/5 backdrop-blur-3xl inline-flex items-center gap-1.5">
                  Verify <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
               </Link>
            </motion.div>
          )}
       </div>

      {/* Main Balance Card - REFINED BLUE/PURPLE */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ scale: 1.005 }}
        className="glass p-8 sm:p-14 md:p-20 rounded-[3rem] border-white/5 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 relative overflow-hidden mb-12 shadow-2xl group transition-all duration-700"
      >
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 opacity-40">
               <div className="p-2.5 rounded-xl glass border-white/10">
                  <Wallet className="w-5 h-5 text-blue-400" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[5px] text-white">Available Balance</span>
            </div>
            
            <div className="flex items-baseline gap-3 mb-12">
               <span className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tighter drop-shadow-[0_10px_30px_rgba(59,130,246,0.3)]">
                  ₦{(userData?.balance || 0).toLocaleString()}
               </span>
               <span className="text-white/20 text-xs font-black uppercase tracking-[4px]">NGN</span>
            </div>
            
            <div className="flex items-center gap-4">
               <Link href="/add-funds" className="flex-1 bg-white hover:bg-white/90 py-4 md:py-6 rounded-[1.5rem] md:rounded-[2rem] font-black text-xs md:text-base flex items-center justify-center gap-2 md:gap-3 text-black shadow-2xl active:scale-95 transition-all">
                  <Plus className="w-4 h-4 md:w-5 md:h-5" /> Add Funds
               </Link>
               <Link href="/withdraw" className="w-14 h-14 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] glass flex items-center justify-center border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white active:scale-95 shadow-2xl shrink-0">
                  <ArrowUpRight className="w-6 h-6 md:w-8 md:h-8" />
               </Link>
            </div>
         </div>
         
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] -mr-40 -mt-40 pointer-events-none group-hover:bg-blue-500/15 transition-colors duration-1000" />
         <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 blur-[100px] -ml-20 -mb-20 pointer-events-none" />
      </motion.div>

      {/* WHATSAPP RECRUITMENT SECTION - FOMO & CONVERSION */}
      <motion.div 
         initial={{ y: 20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ delay: 0.1 }}
         className="mb-12 relative group"
      >
         <a 
            href="https://chat.whatsapp.com/Cebw2wj4AW7AW9jRJ1nZYq?mode=gi_t" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-6 md:p-10 rounded-[2.5rem] bg-gradient-to-r from-[#25D366]/10 to-transparent border border-[#25D366]/20 hover:border-[#25D366]/40 transition-all shadow-2xl relative overflow-hidden"
         >
            <div className="flex items-center gap-6 md:gap-8 relative z-10">
               <div className="w-14 h-14 md:w-20 md:h-20 rounded-[1.2rem] md:rounded-[2rem] bg-[#25D366] flex items-center justify-center shadow-[0_0_30px_rgba(37,211,102,0.3)] group-hover:scale-110 transition-transform duration-700">
                  <svg className="w-8 h-8 md:w-12 md:h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
               </div>
               <div>
                  <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter mb-1">Our Community.</h3>
                  <p className="text-white/40 text-[10px] md:text-sm font-medium tracking-[2px] uppercase">Everyone is welcome to join</p>
               </div>
            </div>
            <div className="hidden md:flex flex-col items-end relative z-10">
               <span className="text-[10px] font-black text-[#25D366] uppercase tracking-[5px] mb-2 animate-pulse">Join Group</span>
               <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all">
                  <ArrowUpRight className="w-6 h-6 text-white" />
               </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#25D366]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
         </a>
      </motion.div>

      {/* HIGH YIELD HOT TASK SECTION - OPTIMIZED FOR MOBILE */}
      <div className="mb-16 md:mb-20">
         <div className="flex items-center justify-between mb-6 md:mb-8 px-2">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter flex items-center gap-3 md:gap-4 uppercase italic">
               <div className="w-1 h-6 md:w-1.5 md:h-8 bg-blue-500 rounded-full" />
               Premium Deals
            </h2>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] md:text-[9px] font-black uppercase tracking-widest animate-pulse backdrop-blur-3xl">
               <Zap className="w-3 h-3 md:w-3.5 md:h-3.5" /> High Reward
            </div>
         </div>
         <Link href="/cpa-offers">
            <motion.div 
               whileHover={{ scale: 1.005 }}
               className="glass rounded-[2rem] md:rounded-[3rem] p-6 md:p-14 border-white/5 bg-gradient-to-br from-blue-500/10 via-[#0A0F1E] to-transparent shadow-2xl group flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 cursor-pointer relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               
               <div className="relative z-10 flex items-center gap-5 md:gap-8 w-full md:w-auto">
                  <div className="w-14 h-14 md:w-20 md:h-20 shrink-0 rounded-[1.2rem] md:rounded-[2rem] bg-blue-500/10 flex items-center justify-center border border-white/5 text-blue-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                     <Rocket className="w-7 h-7 md:w-10 md:h-10" />
                  </div>
                  <div>
                     <h3 className="text-xl md:text-3xl font-black text-white tracking-tighter mb-1 md:mb-3 uppercase italic">Advanced CPA Offers</h3>
                     <p className="text-white/40 text-[10px] md:text-base font-medium max-w-[200px] md:max-w-sm">Missions paying up to ₦5,000 per completion.</p>
                  </div>
               </div>

               <div className="relative z-10 flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto mt-2 md:mt-0">
                  <div className="text-left md:text-right">
                     <div className="text-[8px] md:text-[10px] font-black text-white/30 mb-0.5 md:mb-1 uppercase tracking-[2px] md:tracking-[3px]">Earn Up To</div>
                     <div className="text-2xl md:text-5xl font-black text-blue-400 tracking-tighter underline md:no-underline decoration-blue-500/20 underline-offset-4">₦5,000+</div>
                  </div>
                  <div className="bg-blue-600 hover:bg-blue-500 text-white px-5 md:px-10 py-3 md:py-5 rounded-[1rem] md:rounded-[1.5rem] font-black text-[10px] md:text-sm text-center transition-all shadow-xl active:scale-95 uppercase tracking-widest ml-4 md:ml-0 md:mt-6">
                     View
                  </div>
               </div>
            </motion.div>
         </Link>
      </div>

      {/* Explore More - GRID REFINED */}
      <div className="flex items-center justify-between mb-6 md:mb-8 px-2">
         <h2 className="text-lg md:text-xl font-black text-white/40 uppercase tracking-[3px] md:tracking-[4px]">Explore Core Hubs</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8">
         {/* CPA Offers */}
         <Link href="/cpa-offers">
            <motion.div 
               whileTap={{ scale: 0.97 }}
               className="group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 h-40 md:h-48 flex flex-col justify-between cursor-pointer glass border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all"
            >
               <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-blue-500/10 flex items-center justify-center border border-white/5">
                  <Rocket className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
               </div>
               <div>
                  <p className="text-white font-black text-sm md:text-lg uppercase italic leading-none">CPA Offers</p>
                  <p className="text-white/20 text-[8px] md:text-[10px] font-black uppercase tracking-[2px] mt-1.5 md:mt-2">High Reward</p>
               </div>
               <div className="absolute -bottom-4 -right-4 w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-500/5 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
            </motion.div>
         </Link>

         {/* Social Tasks */}
         <Link href="/social-tasks">
            <motion.div 
               whileTap={{ scale: 0.97 }}
               className="group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 h-40 md:h-48 flex flex-col justify-between cursor-pointer glass border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all"
            >
               <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-purple-500/10 flex items-center justify-center border border-white/5">
                  <Share2 className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
               </div>
               <div>
                  <p className="text-white font-black text-sm md:text-lg uppercase italic leading-none truncate">Social Tasks</p>
                  <p className="text-white/20 text-[8px] md:text-[10px] font-black uppercase tracking-[2px] mt-1.5 md:mt-2">Daily Tasks</p>
               </div>
               <div className="absolute -bottom-4 -right-4 w-16 h-16 md:w-20 md:h-20 rounded-full bg-purple-500/5 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
            </motion.div>
         </Link>

         {/* Earn Hub */}
         <Link href="/earn">
            <motion.div 
               whileTap={{ scale: 0.97 }}
               className="group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 h-40 md:h-48 flex flex-col justify-between cursor-pointer glass border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all"
            >
               <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/10 flex items-center justify-center border border-white/5">
                  <Zap className="w-5 h-5 md:w-6 md:h-6 text-white/40" />
               </div>
               <div>
                  <p className="text-white font-black text-sm md:text-lg uppercase italic leading-none">Earn</p>
                  <p className="text-white/20 text-[8px] md:text-[10px] font-black uppercase tracking-[2px] mt-1.5 md:mt-2">Instant Cash</p>
               </div>
               <div className="absolute -bottom-4 -right-4 w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
            </motion.div>
         </Link>

         {/* Games */}
         <Link href="/games">
            <motion.div 
               whileTap={{ scale: 0.97 }}
               className="group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 h-40 md:h-48 flex flex-col justify-between cursor-pointer glass border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all"
            >
               <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-white/5">
                  <Gamepad2 className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />
               </div>
               <div>
                  <p className="text-white font-black text-sm md:text-lg uppercase italic leading-none">Games</p>
                  <p className="text-white/20 text-[8px] md:text-[10px] font-black uppercase tracking-[2px] mt-1.5 md:mt-2">Free Play</p>
               </div>
               <div className="absolute -bottom-4 -right-4 w-16 h-16 md:w-20 md:h-20 rounded-full bg-indigo-500/5 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
            </motion.div>
         </Link>
      </div>

      {/* Membership Modal - REFINED */}
      {showMembershipModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-[#05070A]/95 backdrop-blur-3xl" onClick={() => setShowMembershipModal(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass p-12 sm:p-16 md:p-24 max-w-2xl w-full relative z-10 border-white/10 rounded-[4rem] shadow-2xl bg-gradient-to-br from-blue-600/10 to-transparent"
          >
            <button 
              onClick={() => setShowMembershipModal(false)}
              className="absolute top-12 right-12 p-4 rounded-full glass hover:bg-white/10 text-white/40 hover:text-white transition-all active:scale-95 border border-white/5"
            >
               <X className="w-6 h-6" />
            </button>

             <div className="text-center mb-12">
               <div className="w-24 h-24 rounded-[2.5rem] bg-blue-500/10 flex items-center justify-center mx-auto mb-10 border border-blue-500/20 shadow-inner">
                  <AlertCircle className="w-14 h-14 text-blue-400" />
               </div>
               <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase italic">Account Verification</h2>
               <p className="text-white/20 text-xs font-black uppercase tracking-[6px]">Premium Status Required</p>
            </div>

            <p className="text-white/40 text-center mb-16 text-lg md:text-xl font-medium leading-relaxed italic">
               Unlock high-paying CPA missions and premium social tasks with a one-time verification fee of <span className="text-white font-black">₦1,500</span>.
            </p>

            <button className="w-full py-6 md:py-8 rounded-[2.5rem] font-black text-xl text-black bg-white shadow-2xl shadow-white/10 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
               Verify Account Now
            </button>
          </motion.div>
        </div>
      )}
    </div>

  );
}