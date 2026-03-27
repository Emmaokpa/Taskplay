"use client";

import React, { useState, useEffect } from 'react';

import { 
  Copy, 
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Invite Friends</h1>
        <p className="text-white/40 text-sm font-medium">Earn extra cash for every friend who joins</p>
      </div>

      {/* Bonus Banner */}
      <div className="glass p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-transparent border-white/5 mb-8 text-center relative overflow-hidden shadow-2xl">
         <div className="relative z-10">
            <div className="w-16 h-16 rounded-3xl glass flex items-center justify-center mx-auto mb-6 text-primary shadow-xl">
               <Gift className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tighter">₦500.00 Bonus</h2>
            <p className="text-white/40 text-sm font-medium max-w-xs mx-auto">Get paid instantly when your friends sign up and verify their account.</p>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-8 mb-10">
         <div className="glass p-6 md:p-10 rounded-[2rem] border-white/5 bg-white/[0.01]">
            <Users className="w-5 h-5 text-primary mb-4" />
            <div className="text-3xl md:text-5xl font-black text-white mb-1 tracking-tighter">{userData?.totalReferrals || 0}</div>
            <p className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-white/20">Referrals</p>
         </div>
         <div className="glass p-6 md:p-10 rounded-[2rem] border-white/5 bg-white/[0.01]">
            <TrendingUp className="w-5 h-5 text-green-400 mb-4" />
            <div className="text-3xl md:text-5xl font-black text-white mb-1 tracking-tighter">₦{(userData?.earnedFromReferrals || 0).toLocaleString()}</div>
            <p className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-white/20">Earned</p>
         </div>
      </div>

      {/* Referral Link Box */}
      <div className="glass p-8 md:p-12 rounded-[2.5rem] border-white/5 shadow-2xl relative overflow-hidden">
         <h3 className="text-sm font-bold text-white mb-6 text-center">Your Referral Link</h3>
         
         <div className="flex flex-col gap-4">
            <div className="glass p-5 rounded-2xl border-white/10 break-all text-center">
               <span className="text-xs font-medium text-white/40 italic select-all">{referralLink}</span>
            </div>
            
            <button 
               onClick={copyLink}
               className="w-full bg-primary hover:bg-primary/80 py-5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all uppercase tracking-widest"
            >
               {copied ? <><CheckCircle2 className="w-5 h-5" /> Copied Reward Link</> : <><Copy className="w-5 h-5" /> Copy My Link</>}
            </button>
         </div>
         
         <p className="mt-8 text-center text-[10px] text-white/30 font-medium">Share your link on WhatsApp, Facebook, or Instagram.</p>
      </div>
    </div>
  );
}
