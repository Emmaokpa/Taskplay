"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  ShieldCheck, 
  Wallet, 
  Copy, 
  ArrowRight, 
  LogOut, 
  Settings, 
  Shield, 
  Gift, 
  CheckCircle2, 
  Send, 
  HeadphonesIcon,
  Sparkles,
  Download
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatSkeleton, Skeleton } from '@/app/components/Skeleton';

interface ProfileData {
  fullName?: string;
  email?: string;
  photoUrl?: string;
  isMember?: boolean;
  balance?: number;
  referralCode?: string;
  totalReferrals?: number;
  earnedFromReferrals?: number;
  [key: string]: unknown;
}

// ─── Sub-components for Share & Earn ───────────────────────────────────────

function PromoCaption({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false);
  const host = typeof window !== 'undefined' ? window.location.host : 'taskplay.ng';
  const caption = `💰 I've been making money online with TaskPlay Nigeria! 🇳🇬\n\nThey pay you real cash for simple tasks like following social media pages, liking posts, and joining groups. You can earn up to ₦100,000+ monthly! 🔥\n\n✅ No scam. No fees. 100% real payouts.\n👇 Join using my link and start earning today!\n\nhttps://${host}/signup?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <button
      onClick={handleCopy}
      className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[4px] flex items-center justify-center gap-3 transition-all active:scale-95 border ${
        copied
          ? 'bg-green-500/20 border-green-500/30 text-green-400'
          : 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20'
      }`}
    >
      <Copy className="w-4 h-4" />
      {copied ? '✓ Caption Copied!' : 'Copy Caption + Link'}
    </button>
  );
}

function PromoImageCard({ num }: { num: number }) {
  const src = `/promo/promo-${num}.png`;
  const [exists, setExists] = useState(true);

  if (!exists) return null;

  return (
    <div className="clay-card border-white/5 bg-[#0A0F1E]/40 rounded-[2rem] overflow-hidden">
      <div className="relative w-full aspect-square">
        <Image
          src={src}
          alt={`TaskPlay Promo Image ${num}`}
          fill
          className="object-cover"
          unoptimized
          onError={() => setExists(false)}
        />
      </div>
      <div className="p-5">
        <a
          href={src}
          download={`TaskPlay_Promo_${num}.png`}
          className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-xs uppercase tracking-[3px] flex items-center justify-center gap-3 transition-all active:scale-95"
        >
          <Download className="w-4 h-4" /> Download Image {num}
        </a>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [userData, setUserData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && isMounted) {
            setUserData(userDoc.data() as ProfileData);
          }
        } catch (err) {
          console.error("Fetch error", err);
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

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const copyRef = () => {
    const link = `${window.location.origin}/signup?ref=${userData?.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-12">
       <div className="flex flex-col items-center space-y-4">
          <Skeleton className="w-24 h-24 rounded-3xl" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-60" />
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StatSkeleton />
          <StatSkeleton />
       </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 md:p-12 max-w-4xl mx-auto pb-44 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] -mr-48 -mt-48 pointer-events-none" />
      
      <div className="flex flex-col items-center mb-16 pt-8">
        <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-tr from-primary via-accent to-primary p-[3px] mb-8 shadow-[0_30px_60px_-15px_rgba(139,92,246,0.5)] relative group cursor-pointer">
           <div className="w-full h-full bg-[#0A0F1E] rounded-[inherit] flex items-center justify-center p-[2px] overflow-hidden">
              {userData?.photoUrl ? (
                 <Image src={userData.photoUrl} alt="User photo" fill className="rounded-[inherit] object-cover group-hover:scale-110 transition-transform duration-700" unoptimized />
              ) : (
                 <div className="w-full h-full rounded-[inherit] bg-white/[0.03] flex items-center justify-center text-4xl font-black text-primary">
                    {userData?.fullName?.charAt(0) || userData?.email?.charAt(0) || 'U'}
                 </div>
              )}
           </div>
           <div className="absolute -bottom-2 -right-2 p-3 bg-[#05070A] border border-white/10 rounded-2xl shadow-2xl">
              <Settings className="w-4 h-4 text-white/40" />
           </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-2 text-center">{userData?.fullName}</h1>
        <p className="text-white/30 text-[10px] font-black tracking-[3px] sm:tracking-[5px] uppercase mb-8 italic text-center break-all px-4">{userData?.email}</p>
        
        {userData?.isMember ? (
          <div className="px-6 py-2.5 rounded-2xl glass-dark border-green-500/20 flex items-center gap-3 shadow-[0_10px_30px_rgba(34,197,94,0.1)]">
             <ShieldCheck className="w-5 h-5 text-green-400" />
             <span className="text-[10px] font-black text-green-400 uppercase tracking-[4px]">Verified Network Member</span>
          </div>
        ) : (
          <div className="px-6 py-2.5 rounded-2xl glass-dark border-orange-500/20 flex items-center gap-3 shadow-[0_10px_30px_rgba(249,115,22,0.1)]">
             <Shield className="w-5 h-5 text-orange-400 animate-pulse" />
             <span className="text-[10px] font-black text-orange-400 uppercase tracking-[4px]">Standard Identity Node</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
         {/* Balance Card */}
         <Link href="/withdraw" className="clay-card p-6 sm:p-8 md:p-10 bg-gradient-to-br from-primary/[0.08] to-transparent border-white/5 hover:border-primary/20 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
            <div className="flex items-center justify-between mb-10 relative z-10">
               <span className="text-[10px] font-black text-primary uppercase tracking-[5px]">Liquidity Pool</span>
               <Wallet className="w-6 h-6 text-primary group-hover:scale-125 group-hover:rotate-6 transition-all duration-500" />
            </div>
            <div className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-tighter group-hover:scale-[1.02] transition-transform origin-left text-wrap break-all">₦{(userData?.balance || 0).toLocaleString()}</div>
            <div className="flex items-center gap-3 text-white/20 text-[10px] font-black uppercase tracking-[3px] group-hover:text-white transition-colors">
               Withdraw Credit <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </div>
         </Link>

         {/* Referral Card */}
         <div className="clay-card p-6 sm:p-8 md:p-10 border-white/5 bg-[#0A0F1E]/40 backdrop-blur-3xl group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[50px] -mr-16 -mt-16" />
            <div className="flex items-center justify-between mb-10 relative z-10">
               <span className="text-[10px] font-black text-white/20 uppercase tracking-[5px]">Invitation Yield</span>
               <Gift className="w-6 h-6 text-white/10 group-hover:text-accent group-hover:scale-110 transition-all duration-500" />
            </div>
            <div className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-tighter text-wrap break-all">₦{(userData?.earnedFromReferrals || 0).toLocaleString()}</div>
            <p className="text-white/20 text-[10px] font-black uppercase tracking-[3px] italic">From {userData?.totalReferrals || 0} Successful Cycles</p>
         </div>
      </div>

      <div className="space-y-6 mb-16">
         <div className="flex items-center gap-4 mb-2">
            <div className="h-px flex-1 bg-white/5" />
            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[6px] italic px-1">Identity & Configuration</h3>
            <div className="h-px flex-1 bg-white/5" />
         </div>
         
         {userData?.isMember ? (
            <div className="clay-card p-6 sm:p-8 md:p-10 bg-gradient-to-br from-green-500/[0.08] to-emerald-600/[0.02] border-green-500/20 relative overflow-hidden group shadow-[0_30px_70px_-20px_rgba(34,197,94,0.1)]">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.1),transparent)]" />
               <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
                     <div className="w-20 h-20 rounded-[2rem] bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20 shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500">
                        <ShieldCheck className="w-10 h-10" />
                     </div>
                     <div>
                         <h4 className="text-xl sm:text-2xl font-black text-white tracking-tighter mb-1">VIP Elite Protocol</h4>
                        <p className="text-[9px] sm:text-[10px] text-green-400/50 font-black uppercase tracking-[3px] sm:tracking-[4px]">Status: Fully Synchronized</p>
                     </div>
                  </div>
                  <div className="px-6 py-3 rounded-2xl glass-dark border-white/5 text-[10px] font-black text-white/40 uppercase tracking-[4px] shadow-inner group-hover:text-green-400 transition-colors">
                     Account Verified
                  </div>
               </div>
               <div className="mt-10 pt-8 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                  <div className="flex items-center gap-3 text-white/30 text-[10px] font-black uppercase tracking-[3px] group-hover:translate-x-1 transition-transform">
                     <CheckCircle2 className="w-4 h-4 text-green-500" /> High Yield Tasks Enabled
                  </div>
                  <div className="flex items-center gap-3 text-white/30 text-[10px] font-black uppercase tracking-[3px] group-hover:translate-x-1 transition-transform">
                     <CheckCircle2 className="w-4 h-4 text-green-500" /> Unlimited Ad Deployment
                  </div>
               </div>
            </div>
         ) : (
            <div className="clay-card p-6 sm:p-8 md:p-10 bg-gradient-to-br from-orange-500/[0.08] to-transparent border-orange-500/20 flex flex-col md:flex-row items-center justify-between gap-8 group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[60px] -mr-16 -mt-16" />
               <div className="flex items-center gap-6 relative z-10">
                  <div className="w-16 h-16 rounded-[1.5rem] glass-dark flex items-center justify-center text-orange-400 shadow-xl border-orange-500/20">
                     <Shield className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                     <h4 className="text-xl font-black text-white tracking-tighter mb-1">Standard Node</h4>
                     <p className="text-[10px] text-white/30 font-black uppercase tracking-[3px]">Upgrade to initiate VIP protocols</p>
                  </div>
               </div>
               <Link 
                  href="/upgrade"
                  className="w-full md:w-auto px-10 py-5 rounded-[1.5rem] bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-[3px] active:scale-95 transition-all relative z-10 shadow-2xl shadow-orange-500/40 italic text-center"
               >
                  Authorize VIP (₦1.5k)
               </Link>
            </div>
         )}

         <div 
           onClick={copyRef}
           className="clay-card p-6 sm:p-8 md:p-10 border-white/5 bg-[#0A0F1E]/40 backdrop-blur-3xl flex flex-col sm:flex-row items-center justify-between gap-6 group cursor-pointer hover:border-primary/30 transition-all duration-500"
         >
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-[1.5rem] glass-dark flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl border-white/5 group-hover:border-primary/20">
                  <Copy className="w-7 h-7" />
               </div>
               <div>
                  <h4 className="text-xl font-black text-white tracking-tighter mb-1 group-hover:text-primary transition-colors">Affiliate Fragment</h4>
                   <p className="text-[9px] sm:text-[10px] text-white/20 font-black uppercase tracking-[2px] sm:tracking-[3px] truncate w-[200px] sm:w-[150px] mx-auto sm:mx-0">Code: {userData?.referralCode}</p>
               </div>
            </div>
            <span className={`text-[12px] font-black uppercase tracking-[4px] transition-all duration-500 px-6 py-3 rounded-2xl glass-dark border-white/5 group-hover:border-primary/20 ${copied ? 'text-green-400 scale-105' : 'text-primary/60 group-hover:text-primary'}`}>
               {copied ? 'FRAGMENT COPIED ✓' : 'COPY PROTOCOL'}
            </span>
         </div>

         <Link 
           href="/promo"
           className="clay-card p-6 sm:p-8 md:p-10 border-white/5 bg-primary/10 backdrop-blur-3xl flex flex-col sm:flex-row items-center justify-between gap-6 group cursor-pointer hover:border-primary/30 transition-all duration-500 mb-6"
         >
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-[1.5rem] glass-dark flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl border-white/5 group-hover:border-primary/20">
                  <Sparkles className="w-7 h-7 text-primary" />
               </div>
               <div>
                  <h4 className="text-xl font-black text-white tracking-tighter mb-1 group-hover:text-primary transition-colors">Promo Hub</h4>
                  <p className="text-[9px] sm:text-[10px] text-white/20 font-black uppercase tracking-[2px] sm:tracking-[3px]">Download mockups & share to earn</p>
               </div>
            </div>
            <div className="w-12 h-12 rounded-full glass flex items-center justify-center text-white/5 group-hover:text-primary group-hover:bg-primary/10 transition-all shadow-xl">
               <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </div>
         </Link>

         <div className="clay-card p-6 sm:p-8 md:p-10 border-white/5 bg-[#0A0F1E]/40 backdrop-blur-3xl flex flex-col sm:flex-row items-center justify-between gap-6 group cursor-pointer hover:border-white/20 transition-all duration-500">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-[1.5rem] glass-dark flex items-center justify-center text-white/10 group-hover:text-white transition-all duration-500 border-white/5 group-hover:border-white/20">
                  <Settings className="w-8 h-8" />
               </div>
               <div>
                  <h4 className="text-xl font-black text-white tracking-tighter mb-1">Security Core</h4>
                  <p className="text-[10px] text-white/20 font-black uppercase tracking-[3px]">Recalibrate Authentication</p>
               </div>
            </div>
            <div className="w-12 h-12 rounded-full glass-dark flex items-center justify-center text-white/5 group-hover:text-white group-hover:bg-white/5 transition-all">
               <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </div>
         </div>
      </div>

      {/* Community + Support Section */}
      <div className="flex items-center gap-4 mb-6 mt-4">
         <div className="h-px flex-1 bg-white/5" />
         <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[6px] italic px-1">Community & Support</h3>
         <div className="h-px flex-1 bg-white/5" />
      </div>

      <div className="space-y-4 mb-8">
         <a
           href="https://t.me/taskplay_rewards"
           target="_blank"
           rel="noopener noreferrer"
           className="clay-card p-6 sm:p-8 border-[#0088CC]/20 bg-[#0088CC]/5 backdrop-blur-3xl flex flex-col sm:flex-row items-center justify-between gap-6 group cursor-pointer hover:border-[#0088CC]/40 transition-all duration-500 hover:bg-[#0088CC]/10 block"
         >
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-[1.5rem] bg-[#0088CC]/10 border border-[#0088CC]/20 flex items-center justify-center text-[#0088CC] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl">
                  <Send className="w-7 h-7" />
               </div>
               <div>
                  <h4 className="text-xl font-black text-white tracking-tighter mb-1 group-hover:text-[#0088CC] transition-colors">Join Our Community</h4>
                  <p className="text-[9px] sm:text-[10px] text-white/20 font-black uppercase tracking-[2px] sm:tracking-[3px]">Updates, tips & payout proofs daily</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <span className="px-4 py-2 rounded-xl bg-[#0088CC]/20 text-[#0088CC] text-[10px] font-black uppercase tracking-[2px] border border-[#0088CC]/20">Telegram</span>
               <div className="w-10 h-10 rounded-full bg-[#0088CC]/10 border border-[#0088CC]/20 flex items-center justify-center text-[#0088CC] group-hover:bg-[#0088CC] group-hover:text-white transition-all shadow-xl">
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
         </a>

         <Link
           href="/support"
           className="clay-card p-6 sm:p-8 border-white/5 bg-[#0A0F1E]/40 backdrop-blur-3xl flex flex-col sm:flex-row items-center justify-between gap-6 group cursor-pointer hover:border-white/20 transition-all duration-500 block"
         >
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-[1.5rem] glass-dark flex items-center justify-center text-white/20 group-hover:text-primary group-hover:scale-110 transition-all duration-500 border-white/5 group-hover:border-primary/20 shadow-xl">
                  <HeadphonesIcon className="w-7 h-7" />
               </div>
               <div>
                  <h4 className="text-xl font-black text-white tracking-tighter mb-1 group-hover:text-primary transition-colors">Contact Support</h4>
                  <p className="text-[9px] sm:text-[10px] text-white/20 font-black uppercase tracking-[2px] sm:tracking-[3px]">Protocol help & tech assistance</p>
               </div>
            </div>
            <div className="w-12 h-12 rounded-full glass-dark flex items-center justify-center text-white/10 group-hover:text-primary group-hover:bg-primary/10 transition-all shadow-xl">
               <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </div>
         </Link>
      </div>

      {/* Share & Earn Promo Image Gallery */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-6 mt-4">
           <div className="h-px flex-1 bg-white/5" />
           <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[6px] italic px-1">Share & Earn</h3>
           <div className="h-px flex-1 bg-white/5" />
        </div>

        {/* How it works banner */}
        <div className="clay-card p-6 sm:p-8 border-blue-500/20 bg-blue-500/5 mb-6 rounded-[2rem]">
          <div className="flex items-start gap-4">
             <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-1">
                <Sparkles className="w-5 h-5 text-blue-400" />
             </div>
             <div>
               <h4 className="text-white font-black text-base mb-1">Promote TaskPlay & Earn More!</h4>
               <p className="text-white/50 text-xs font-medium leading-relaxed">
                 Download any image below and post it on your WhatsApp Status, Facebook, or Instagram. Copy the caption below it and include your personal referral link — every person who signs up using your link earns you a bonus!
               </p>
             </div>
          </div>
        </div>

        {/* Referral Caption Box */}
        <div className="clay-card p-6 sm:p-8 border-white/5 bg-[#0A0F1E]/40 rounded-[2rem] mb-6">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[4px] mb-4">📋 Copy This Caption</p>
          <p className="text-white/60 text-xs leading-relaxed mb-5 font-medium">
            Post any image below on WhatsApp, Facebook, or Instagram and use this ready-made caption (with your referral link already inside) to invite people to TaskPlay.
          </p>
          <PromoCaption referralCode={userData?.referralCode || ''} />
        </div>

        {/* Promo Images */}
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((num) => (
            <PromoImageCard key={num} num={num} />
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="w-full py-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 text-red-500 font-black text-xl flex items-center justify-center gap-4 active:scale-[0.98] transition-all hover:bg-red-500/20 hover:border-red-500/40 shadow-2xl group italic"
      >
        <span>Sign Out Protocol</span>
        <LogOut className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
      </button>
    </div>
  );
}