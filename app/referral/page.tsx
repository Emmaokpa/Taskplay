"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Copy, 
  Share2, 
  Users, 
  TrendingUp, 
  Gift,
  ArrowLeft,
  CheckCircle2,
  Loader
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RefferalPage() {
  const [userData, setUserData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
        setLoading(false);
      } else {
        router.push('/login');
      }
    });
  }, []);

  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/signup?ref=${userData?.referralCode}` 
    : '';

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="p-20 text-center"><Loader className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto pb-40">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-10 transition-colors font-bold text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Refer & Earn</h1>
        <p className="text-white/40 text-sm font-bold tracking-[2px] uppercase">Grow the community, get rewards</p>
      </div>

      {/* Bonus Banner */}
      <div className="clay-card p-10 bg-gradient-to-br from-primary/30 to-accent/10 border-primary/20 mb-10 text-center relative overflow-hidden">
         <div className="relative z-10">
            <Gift className="w-16 h-16 text-white mx-auto mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
            <h2 className="text-4xl font-black text-white mb-2">₦500.00 Reward</h2>
            <p className="text-white/80 font-bold max-w-sm mx-auto">Get credited instantly when your friend upgrades to a <span className="underline decoration-white/40">Standard Member</span>.</p>
         </div>
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-white/10 opacity-50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
         <div className="clay-card p-8 border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-primary">
                  <Users className="w-5 h-5" />
               </div>
               <span className="text-[10px] uppercase font-black tracking-widest text-white/30">Network Size</span>
            </div>
            <div className="text-4xl font-black text-white">{userData?.totalReferrals || 0}</div>
            <p className="text-xs font-bold text-white/20 mt-2 tracking-widest uppercase">Verified Referrals</p>
         </div>
         <div className="clay-card p-8 border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-green-400">
                  <TrendingUp className="w-5 h-5" />
               </div>
               <span className="text-[10px] uppercase font-black tracking-widest text-white/30">Total Bonus</span>
            </div>
            <div className="text-4xl font-black text-white">₦{(userData?.earnedFromReferrals || 0).toLocaleString()}</div>
            <p className="text-xs font-bold text-white/20 mt-2 tracking-widest uppercase">Earned from invites</p>
         </div>
      </div>

      {/* Referral Link Box */}
      <div className="clay-card p-10 border-white/5">
         <h3 className="text-lg font-black text-white mb-6 uppercase tracking-[3px]">Your Invite Link</h3>
         <div className="glass p-2 rounded-2xl flex flex-col sm:flex-row items-center gap-4 border-white/10 group focus-within:border-primary/40 transition-all">
            <div className="flex-1 px-4 py-2 text-white/60 font-mono text-sm break-all truncate w-full sm:w-auto">
               {referralLink}
            </div>
            <button 
               onClick={copyLink}
               className="w-full sm:w-auto clay-button px-8 py-4 rounded-xl font-black text-white flex items-center justify-center gap-2"
            >
               {copied ? <><CheckCircle2 className="w-5 h-5" /> Copied</> : <><Copy className="w-5 h-5" /> Copy Link</>}
            </button>
         </div>
         <p className="mt-6 text-center text-[10px] font-black uppercase text-white/20 tracking-[2px]">Tap above to share with your network on WhatsApp, Twitter, or IG.</p>
      </div>
    </div>
  );
}
