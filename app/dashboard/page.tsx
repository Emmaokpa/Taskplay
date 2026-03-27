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
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto pb-40">
      <div className="mb-12 flex items-center justify-between">
         <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">Main Wallet</h1>
            <p className="text-white/40 text-[9px] font-black uppercase tracking-[5px] flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
               Live Account Summary
            </p>
         </motion.div>
         {!userData?.isMember && (
           <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <Link href="/upgrade" className="glass px-5 py-2.5 rounded-2xl border-orange-500/10 hover:border-orange-500/30 active:scale-95 transition-all text-orange-400 text-[9px] font-black uppercase tracking-[3px] shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                 Verify Account
              </Link>
           </motion.div>
         )}
      </div>

      {/* Main Balance Card - REFINED */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ scale: 1.01 }}
        className="clay-card p-8 sm:p-12 md:p-16 bg-[#0A0F1E]/40 backdrop-blur-3xl relative overflow-hidden mb-12 shadow-[0_40px_100px_-20px_rgba(139,92,246,0.15)] border-white/10 group transition-all duration-700"
      >
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 opacity-30 group-hover:opacity-60 transition-opacity">
               <div className="p-2 rounded-lg glass">
                  <Wallet className="w-4 h-4 text-primary" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[4px]">Available Balance</span>
            </div>
            
            <div className="flex items-baseline gap-2 mb-12">
               <span className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-[-0.075em] drop-shadow-2xl">
                  ₦{(userData?.balance || 0).toLocaleString()}
               </span>
               <span className="text-white/20 text-sm font-black uppercase tracking-widest">NGN</span>
            </div>
            
            <div className="flex items-center gap-4">
               <Link href="/add-funds" className="flex-1 bg-blue-600 hover:bg-blue-500 py-5 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 text-white shadow-xl active:scale-[0.98] transition-all">
                  <Plus className="w-5 h-5" /> Add Funds
               </Link>
               <Link href="/withdraw" className="w-16 h-16 rounded-[1.5rem] glass flex items-center justify-center border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white active:scale-95 shadow-xl">
                  <ArrowUpRight className="w-6 h-6" />
               </Link>
            </div>
         </div>
         
         {/* Decorative Sleek Elements */}
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 blur-[120px] -mr-32 -mt-32 pointer-events-none group-hover:bg-primary/30 transition-colors duration-1000" />
         <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-accent/10 blur-[80px] -ml-20 -mb-20 pointer-events-none" />
         <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-white/5 opacity-50 pointer-events-none" />
      </motion.div>

      {/* HIGH YIELD HOT TASK SECTION */}
      <div className="mb-16">
         <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-2xl font-black text-white tracking-tighter flex items-center gap-3">
               <div className="w-3 h-8 bg-gradient-to-b from-orange-400 to-red-500 rounded-full" />
               Hot Deals
            </h2>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest animate-pulse">
               <Zap className="w-3 h-3" /> High Yield
            </div>
         </div>
         <Link href="/cpa-offers">
            <motion.div 
               whileHover={{ scale: 1.01 }}
               whileTap={{ scale: 0.99 }}
               className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-[#0A0F1E] to-[#0A0F1E] shadow-[0_20px_50px_rgba(249,115,22,0.1)] group flex flex-col md:flex-row items-center justify-between gap-8 cursor-pointer"
            >
               {/* Animated Background Rays */}
               <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_50%)] pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity" />
               
               <div className="relative z-10 flex items-center gap-6">
                  <div className="w-16 h-16 shrink-0 rounded-[1.5rem] bg-orange-500/20 flex items-center justify-center border border-orange-500/30 text-orange-400 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                     <Rocket className="w-8 h-8" />
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-white tracking-tight mb-2">Premium CPA Campaigns</h3>
                     <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Complete verification or install apps for massive payouts.</p>
                  </div>
               </div>

               <div className="relative z-10 flex flex-col items-start md:items-end w-full md:w-auto">
                  <div className="text-[10px] font-black text-white/30 uppercase tracking-[3px] mb-1">Earn Up To</div>
                  <div className="text-4xl font-black text-orange-400 tracking-[-0.05em] drop-shadow-lg mb-4">₦5,000+</div>
                  <div className="w-full md:w-auto bg-orange-500 hover:bg-orange-400 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest text-center transition-all shadow-lg active:scale-95">
                     Claim Offers Now
                  </div>
               </div>
            </motion.div>
         </Link>
      </div>

      {/* Explore More */}
      <div className="flex items-center justify-between mb-6 px-1">
         <h2 className="text-xl font-bold text-white">Explore More</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
         {/* CPA Offers */}
         <Link href="/cpa-offers">
            <motion.div 
               whileTap={{ scale: 0.97 }}
               className="group relative overflow-hidden rounded-3xl p-5 h-40 flex flex-col justify-between cursor-pointer bg-gradient-to-br from-orange-500/15 to-orange-500/5 border border-orange-500/15 hover:border-orange-500/30 transition-all duration-300"
            >
               <div className="w-11 h-11 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-500/20">
                  <Rocket className="w-5 h-5 text-orange-400" />
               </div>
               <div>
                  <p className="text-white font-bold text-base leading-tight">CPA Offers</p>
                  <p className="text-orange-400/60 text-xs font-medium mt-0.5">Earn up to ₦5,000+</p>
               </div>
               <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-orange-500/10 group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            </motion.div>
         </Link>

         {/* Social Tasks */}
         <Link href="/social-tasks">
            <motion.div 
               whileTap={{ scale: 0.97 }}
               className="group relative overflow-hidden rounded-3xl p-5 h-40 flex flex-col justify-between cursor-pointer bg-gradient-to-br from-blue-500/15 to-blue-500/5 border border-blue-500/15 hover:border-blue-500/30 transition-all duration-300"
            >
               <div className="w-11 h-11 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/20">
                  <Share2 className="w-5 h-5 text-blue-400" />
               </div>
               <div>
                  <p className="text-white font-bold text-base leading-tight">Social Tasks</p>
                  <p className="text-blue-400/60 text-xs font-medium mt-0.5">Follow, like & join</p>
               </div>
               <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-blue-500/10 group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            </motion.div>
         </Link>

         {/* Earn Hub */}
         <Link href="/earn">
            <motion.div 
               whileTap={{ scale: 0.97 }}
               className="group relative overflow-hidden rounded-3xl p-5 h-40 flex flex-col justify-between cursor-pointer bg-gradient-to-br from-yellow-500/15 to-yellow-500/5 border border-yellow-500/15 hover:border-yellow-500/30 transition-all duration-300"
            >
               <div className="w-11 h-11 rounded-2xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/20">
                  <Zap className="w-5 h-5 text-yellow-400" />
               </div>
               <div>
                  <p className="text-white font-bold text-base leading-tight">Earn Hub</p>
                  <p className="text-yellow-400/60 text-xs font-medium mt-0.5">Daily instant cash</p>
               </div>
               <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-yellow-500/10 group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            </motion.div>
         </Link>

         {/* Games */}
         <Link href="/games">
            <motion.div 
               whileTap={{ scale: 0.97 }}
               className="group relative overflow-hidden rounded-3xl p-5 h-40 flex flex-col justify-between cursor-pointer bg-gradient-to-br from-indigo-500/15 to-purple-500/5 border border-indigo-500/15 hover:border-indigo-500/30 transition-all duration-300"
            >
               <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
                  <Gamepad2 className="w-5 h-5 text-indigo-400" />
               </div>
               <div>
                  <p className="text-white font-bold text-base leading-tight">Games</p>
                  <p className="text-indigo-400/60 text-xs font-medium mt-0.5">Play for free</p>
               </div>
               <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-indigo-500/10 group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            </motion.div>
         </Link>
      </div>

      {/* Membership Modal - REFINED */}
      {showMembershipModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-[#05070A]/90 backdrop-blur-2xl" onClick={() => setShowMembershipModal(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="clay-card p-8 sm:p-12 md:p-16 max-w-xl w-full relative z-10 border-white/10 shadow-[0_0_100px_rgba(139,92,246,0.1)]"
          >
            <button 
              onClick={() => setShowMembershipModal(false)}
              className="absolute top-8 right-8 p-3 rounded-2xl glass hover:bg-white/10 text-white/40 hover:text-white transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-10">
               <div className="w-20 h-20 rounded-[2rem] bg-orange-500/10 flex items-center justify-center mx-auto mb-8 border border-orange-500/20">
                  <AlertCircle className="w-12 h-12 text-orange-400" />
               </div>
               <h2 className="text-4xl font-black text-white mb-3 tracking-tighter">Verify Identity</h2>
               <p className="text-white/30 text-[10px] font-black uppercase tracking-[5px]">Standard Membership Access</p>
            </div>

            <p className="text-white/60 text-center mb-12 text-lg md:text-xl font-medium leading-relaxed italic">
               Access high-ticket tasks and unlock instant withdrawals by joining the Standard Membership program for a one-time fee of <span className="text-white font-bold">₦1,500</span>.
            </p>

            <button className="clay-button w-full py-5 rounded-[2rem] font-black text-2xl text-white shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] uppercase tracking-tighter italic">
               Unlock Everything Now
            </button>
          </motion.div>
        </div>
      )}
    </div>

  );
}