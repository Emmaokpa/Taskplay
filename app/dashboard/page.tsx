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
  X
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
    <div className="p-6 md:p-10 max-w-7xl mx-auto pb-40">
      <div className="mb-10 flex items-center justify-between">
         <div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Main Wallet</h1>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[3px]">Manage your earnings</p>
         </div>
         {!userData?.isMember && (
           <Link href="/upgrade" className="glass px-4 py-2 rounded-xl border-orange-500/20 active:scale-95 transition-all text-orange-400 text-[10px] font-black uppercase tracking-widest">
              Verify Account
           </Link>
         )}
      </div>

      {/* Main Balance Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="clay-card p-10 md:p-12 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent relative overflow-hidden mb-12 shadow-[0_30px_60px_-15px_rgba(139,92,246,0.3)] border-white/10"
      >
         <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 opacity-40">
               <Wallet className="w-4 h-4" />
               <span className="text-xs font-black uppercase tracking-[3px]">Total Balance</span>
            </div>
            <div className="text-6xl font-black text-white mb-10 tracking-tighter">
               ₦{(userData?.balance || 0).toLocaleString()}
            </div>
            
            <div className="flex gap-4">
               <Link href="/add-funds" className="flex-1 clay-button py-4 rounded-2xl font-black flex items-center justify-center gap-2 text-white shadow-xl shadow-primary/20">
                  <Plus className="w-5 h-5" /> Add Funds
               </Link>
               <Link href="/withdraw" className="w-16 h-16 rounded-2xl glass flex items-center justify-center border-white/5 hover:bg-white/10 transition-all text-white active:scale-90">
                  <ArrowUpRight className="w-6 h-6" />
               </Link>
            </div>
         </div>
         {/* Decorative Gradients */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
      </motion.div>

      {/* 2-Column Grid */}
      <h2 className="text-2xl font-black text-white mb-8 tracking-tight flex items-center gap-3">
         ⚡ Explore More
      </h2>

      <div className="grid grid-cols-2 gap-4 md:gap-8">
         <Link href="/cpa-offers">
            <motion.div 
               whileHover={{ y: -5 }}
               className="clay-card p-8 md:p-12 aspect-square flex flex-col justify-between group cursor-pointer border-white/5"
            >
               <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center group-hover:scale-110 transition-transform text-primary border-primary/20">
                  <Rocket className="w-7 h-7" />
               </div>
               <div>
                  <h3 className="text-xl md:text-2xl font-black text-white mb-1 tracking-tight">CPA Offers</h3>
                  <p className="text-[10px] md:text-xs font-bold text-white/40 uppercase tracking-widest">Global Tasks</p>
               </div>
            </motion.div>
         </Link>

         <Link href="/social-tasks">
            <motion.div 
               whileHover={{ y: -5 }}
               className="clay-card p-8 md:p-12 aspect-square flex flex-col justify-between group cursor-pointer border-white/5"
            >
               <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center group-hover:scale-110 transition-transform text-blue-400 border-blue-400/20">
                  <Share2 className="w-7 h-7" />
               </div>
               <div>
                  <h3 className="text-xl md:text-2xl font-black text-white mb-1 tracking-tight">Social Tasks</h3>
                  <p className="text-[10px] md:text-xs font-bold text-white/40 uppercase tracking-widest">Viral Rewards</p>
               </div>
            </motion.div>
         </Link>
      </div>

      {/* Membership Modal */}
      {showMembershipModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowMembershipModal(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="clay-card p-10 md:p-14 max-w-lg w-full relative z-10 border-primary/20"
          >
            <button 
              onClick={() => setShowMembershipModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl glass hover:bg-white/10 text-white/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
               <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-orange-400" />
               </div>
               <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Verify Identity</h2>
               <p className="text-white/40 text-xs font-bold uppercase tracking-[4px]">Becoming a member</p>
            </div>

            <p className="text-white/60 text-center mb-8 text-lg leading-relaxed">
               Access high-ticket tasks and unlock ₦ withdrawals by joining the Standard Membership program for a one-time fee of ₦1,500.
            </p>

            <button className="clay-button w-full py-4 rounded-2xl font-black text-xl text-white shadow-xl shadow-primary/30">
               Unlock Everything
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}