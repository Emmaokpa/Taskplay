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
         {!userData?.isMember && (
           <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <Link href="/upgrade" className="glass px-6 py-3 rounded-2xl border-blue-500/20 hover:border-blue-500/40 active:scale-95 transition-all text-blue-400 text-[10px] font-black uppercase tracking-[3px] shadow-2xl bg-blue-500/5 backdrop-blur-3xl">
                 Verify Account 🔒
              </Link>
           </motion.div>
         )}
      </div>

      {/* Main Balance Card - REFINED BLUE/PURPLE */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ scale: 1.005 }}
        className="glass p-10 sm:p-14 md:p-20 rounded-[3rem] border-white/5 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 relative overflow-hidden mb-16 shadow-2xl group transition-all duration-700"
      >
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8 opacity-40">
               <div className="p-2.5 rounded-xl glass border-white/10">
                  <Wallet className="w-5 h-5 text-blue-400" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[5px] text-white">Available Balance</span>
            </div>
            
            <div className="flex items-baseline gap-3 mb-16">
               <span className="text-6xl sm:text-7xl md:text-8xl font-black text-white tracking-tighter drop-shadow-[0_10px_30px_rgba(59,130,246,0.3)]">
                  ₦{(userData?.balance || 0).toLocaleString()}
               </span>
               <span className="text-white/20 text-sm font-black uppercase tracking-[4px]">NGN</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-5">
               <Link href="/add-funds" className="w-full sm:flex-1 bg-white hover:bg-white/90 py-5 md:py-6 rounded-[2rem] font-black text-sm md:text-base flex items-center justify-center gap-3 text-black shadow-2xl active:scale-95 transition-all">
                  <Plus className="w-5 h-5" /> Add Funds
               </Link>
               <Link href="/withdraw" className="w-full sm:w-20 h-16 sm:h-20 rounded-[2rem] glass flex items-center justify-center border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white active:scale-95 shadow-2xl">
                  <ArrowUpRight className="w-8 h-8" />
               </Link>
            </div>
         </div>
         
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] -mr-40 -mt-40 pointer-events-none group-hover:bg-blue-500/15 transition-colors duration-1000" />
         <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 blur-[100px] -ml-20 -mb-20 pointer-events-none" />
      </motion.div>

      {/* HIGH YIELD HOT TASK SECTION - REFINED BLUE */}
      <div className="mb-20">
         <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-2xl font-black text-white tracking-tighter flex items-center gap-4 uppercase italic">
               <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
               Premium Opportunities
            </h2>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest animate-pulse backdrop-blur-3xl">
               <Zap className="w-3.5 h-3.5" /> High Reward
            </div>
         </div>
         <Link href="/cpa-offers">
            <motion.div 
               whileHover={{ scale: 1.005 }}
               className="glass rounded-[2.5rem] md:rounded-[3rem] p-10 md:p-14 border-white/5 bg-gradient-to-br from-blue-500/10 via-[#0A0F1E] to-transparent shadow-2xl group flex flex-col md:flex-row items-center justify-between gap-10 cursor-pointer relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               
               <div className="relative z-10 flex items-center gap-8">
                  <div className="w-20 h-20 shrink-0 rounded-[2rem] bg-blue-500/10 flex items-center justify-center border border-white/5 text-blue-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                     <Rocket className="w-10 h-10" />
                  </div>
                  <div>
                     <h3 className="text-3xl font-black text-white tracking-tighter mb-3 uppercase italic">Advanced CPA Offers</h3>
                     <p className="text-white/40 text-base font-medium max-w-sm">Unlock special missions that pay up to ₦5,000 per successful completion.</p>
                  </div>
               </div>

               <div className="relative z-10 flex flex-col items-start md:items-end w-full md:w-auto">
                  <div className="text-[10px] font-black text-white/30 mb-1 uppercase tracking-[3px]">Earn Up To</div>
                  <div className="text-5xl font-black text-blue-400 tracking-tighter mb-6 underline decoration-blue-500/20 underline-offset-8">₦5,000+</div>
                  <div className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-[1.5rem] font-black text-sm text-center transition-all shadow-xl active:scale-95 uppercase tracking-widest">
                     View Offers
                  </div>
               </div>
            </motion.div>
         </Link>
      </div>

      {/* Explore More - GRID REFINED */}
      <div className="flex items-center justify-between mb-8 px-2">
         <h2 className="text-xl font-black text-white/40 uppercase tracking-[4px]">Explore Core Hubs</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8">
         {/* CPA Offers */}
         <Link href="/cpa-offers">
            <motion.div 
               whileTap={{ scale: 0.97 }}
               className="group relative overflow-hidden rounded-[2.5rem] p-8 h-48 flex flex-col justify-between cursor-pointer glass border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all"
            >
               <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-white/5">
                  <Rocket className="w-6 h-6 text-blue-400" />
               </div>
               <div>
                  <p className="text-white font-black text-lg uppercase italic leading-none">CPA Loop</p>
                  <p className="text-blue-400/60 text-[10px] font-black uppercase tracking-[2px] mt-2">₦5k Potential</p>
               </div>
               <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-blue-500/5 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
            </motion.div>
         </Link>

         {/* Social Tasks */}
         <Link href="/social-tasks">
            <motion.div 
               whileTap={{ scale: 0.97 }}
               className="group relative overflow-hidden rounded-[2.5rem] p-8 h-48 flex flex-col justify-between cursor-pointer glass border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all"
            >
               <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-white/5">
                  <Share2 className="w-6 h-6 text-purple-400" />
               </div>
               <div>
                  <p className="text-white font-black text-lg uppercase italic leading-none">Social Mining</p>
                  <p className="text-purple-400/60 text-[10px] font-black uppercase tracking-[2px] mt-2">Unlimited Tasks</p>
               </div>
               <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-purple-500/5 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
            </motion.div>
         </Link>

         {/* Earn Hub */}
         <Link href="/earn">
            <motion.div 
               whileTap={{ scale: 0.97 }}
               className="group relative overflow-hidden rounded-[2.5rem] p-8 h-48 flex flex-col justify-between cursor-pointer glass border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all"
            >
               <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/5">
                  <div className="w-6 h-6 rounded-full border-2 border-white/40 border-t-white animate-spin-slow" />
               </div>
               <div>
                  <p className="text-white font-black text-lg uppercase italic leading-none">Instant Hub</p>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[2px] mt-2">Zero Wait Time</p>
               </div>
               <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/5 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
            </motion.div>
         </Link>

         {/* Games */}
         <Link href="/games">
            <motion.div 
               whileTap={{ scale: 0.97 }}
               className="group relative overflow-hidden rounded-[2.5rem] p-8 h-48 flex flex-col justify-between cursor-pointer glass border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all"
            >
               <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-white/5">
                  <Gamepad2 className="w-6 h-6 text-indigo-400" />
               </div>
               <div>
                  <p className="text-white font-black text-lg uppercase italic leading-none">Arcade XP</p>
                  <p className="text-indigo-400/60 text-[10px] font-black uppercase tracking-[2px] mt-2">Free To Play</p>
               </div>
               <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-indigo-500/5 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
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