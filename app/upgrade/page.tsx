"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Zap, 
  History,
  TrendingUp,
  Loader
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatSkeleton, Skeleton } from '@/app/components/Skeleton';
import Modal from '@/app/components/Modal';

export default function UpgradePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  // Modal State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info' | 'loading';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!isMounted) return;
      
      if (u) {
        setUser(u);
        try {
          const userDoc = await getDoc(doc(db, 'users', u.uid));
          if (userDoc.exists() && isMounted) {
            const data = userDoc.data();
            if (data.isMember) {
              router.push('/dashboard');
              return;
            }
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

  const handleUpgrade = async () => {
    if (processing || !user) return;
    setProcessing(true);

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      setModal({ isOpen: true, type: 'error', title: 'Config Error', message: "Paystack Public Key is missing! Please check your .env file."});
      setProcessing(false);
      return;
    }

    try {
      // Use the npm package — no CDN script needed, no "form" requirement
      const PaystackPop = (await import('@paystack/inline-js')).default;
      const paystack = new PaystackPop();

      paystack.newTransaction({
        key: publicKey,
        email: user.email,
        amount: 1500 * 100, // ₦1,500 in kobo
        currency: "NGN",
        onSuccess: async (response: { reference: string }) => {
          setModal({ isOpen: true, type: 'loading', title: 'Verifying Payment', message: 'Checking with Paystack. Please wait...' });
          try {
            const apiRes = await fetch('/api/upgrade/verify', {
               method: 'POST',
               body: JSON.stringify({ reference: response.reference, userId: user.uid }),
            });
            const data = await apiRes.json();
            
            if (data.success) {
               setModal({ isOpen: true, type: 'success', title: 'Upgrade Successful!', message: 'Welcome to VIP Elite. Redirecting...' });
               setTimeout(() => router.push('/dashboard'), 2000);
            } else {
               throw new Error(data.error || 'Verification failed');
            }
          } catch (err: unknown) {
            setModal({ isOpen: true, type: 'error', title: 'Critical Error', message: (err as Error).message || "Payment verified but account update failed. Please contact support."});
          } finally {
            setProcessing(false);
          }
        },
        onCancel: () => {
          setProcessing(false);
          setModal({ isOpen: true, type: 'info', title: 'Upgrade Cancelled', message: 'The payment process was stopped. No charges were made.'});
        },
      });
    } catch (err) {
      console.error("Paystack error:", err);
      setProcessing(false);
      setModal({ isOpen: true, type: 'error', title: 'Payment Error', message: "Failed to launch payment. Please refresh and try again."});
    }
  };

  if (loading) return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-12">
      <Skeleton className="h-12 w-64 mx-auto" />
      <div className="glass p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border-white/5 space-y-8 h-80 flex flex-col items-center justify-center">
         <Skeleton className="w-20 h-20 md:w-24 md:h-24 rounded-3xl" />
         <div className="space-y-4 w-full flex flex-col items-center">
            <Skeleton className="h-10 md:h-12 w-32 md:w-48" />
            <Skeleton className="h-4 w-48 md:w-64" />
         </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatSkeleton />
         <StatSkeleton />
         <StatSkeleton />
      </div>
    </div>
  );

  return (
    <div className="px-6 md:px-12 py-10 max-w-5xl mx-auto pb-44 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 blur-[150px] -ml-48 -mb-48 pointer-events-none" />
      
      <Link href="/dashboard" className="inline-flex items-center gap-3 text-white/20 hover:text-white mb-16 transition-all font-black text-[10px] uppercase tracking-[5px] group">
         <div className="p-2 rounded-xl glass group-hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
         </div>
         Back to Command Core
      </Link>

      <div className="text-center mb-16 px-4">
        <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-[0.9] drop-shadow-2xl">
           Elite <span className="text-primary italic">Identity</span>
        </h1>
        <p className="text-white/30 text-[10px] md:text-xs font-black tracking-[8px] uppercase max-w-lg mx-auto leading-relaxed">Single synchronization • Infinite task engagement capacity</p>
      </div>

      {/* Main Pricing Card - PREMIUM OVERHAUL */}
      <motion.div 
         initial={{ y: 40, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         className="clay-card p-10 md:p-24 rounded-[4rem] md:rounded-[6rem] border-white/10 bg-[#0A0F1E]/40 backdrop-blur-3xl text-center relative overflow-hidden mb-20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border-t border-white/20"
      >
         <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
         
         <div className="relative z-10 flex flex-col items-center">
            <motion.div 
               whileHover={{ scale: 1.1, rotate: 5 }}
               className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-gradient-to-tr from-primary via-accent to-primary flex items-center justify-center mb-12 shadow-[0_20px_50px_rgba(139,92,246,0.5)] border-2 border-white/20 relative"
            >
               <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse" />
               {processing ? <Loader className="w-12 h-12 md:w-16 md:h-16 animate-spin text-white z-10" /> : <ShieldCheck className="w-12 h-12 md:w-16 md:h-16 text-white z-10 drop-shadow-lg" />}
            </motion.div>
            
            <div className="flex flex-col items-center mb-12">
               <span className="text-primary text-[10px] font-black uppercase tracking-[8px] mb-4">Lifetime Allocation</span>
               <div className="text-6xl md:text-9xl font-black text-white tracking-tighter flex items-start gap-2">
                  <span className="text-2xl md:text-4xl text-white/20 mt-2 md:mt-4">₦</span>1,500
               </div>
            </div>

            <div className="w-full max-w-sm space-y-8">
               <p className="text-white/40 font-medium text-sm md:text-base leading-relaxed uppercase tracking-widest italic">Verified status enables full withdrawal capacity, priority rewards, and unlimited mission sets.</p>
               
               <button 
                  type="button"
                  onClick={handleUpgrade}
                  disabled={processing}
                  className="clay-button w-full py-6 md:py-8 rounded-[2rem] font-black text-xl md:text-3xl text-white shadow-[0_30px_60px_-10px_rgba(139,92,246,0.4)] hover:shadow-primary/50 active:scale-[0.95] transition-all relative overflow-hidden group"
               >
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative z-10 uppercase italic">{processing ? 'Syncing...' : 'Activate Hub'}</span>
               </button>
            </div>
         </div>

         {/* Internal Glows */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(139,92,246,0.05)_0%,transparent_70%)] pointer-events-none" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
         {[
           { icon: Zap, label: 'Instant Flow', desc: 'Zero verification delay on rewards' },
           { icon: TrendingUp, label: 'Prime Tiers', desc: 'Access to elite ₦1,000+ task stacks' },
           { icon: History, label: 'Full Access', desc: 'Complete history & performance tracking' }
         ].map((item, i) => (
           <motion.div 
             key={i} 
             whileHover={{ y: -8 }}
             className="clay-card p-10 md:p-14 rounded-[3rem] border-white/5 bg-[#0A0F1E]/20 backdrop-blur-3xl text-center group hover:border-primary/20 transition-all duration-500"
           >
              <div className="w-16 h-16 rounded-2xl glass-dark flex items-center justify-center mx-auto mb-8 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-500 shadow-xl border-white/5 group-hover:border-primary/20">
                 <item.icon className="w-8 h-8 text-white/10 group-hover:text-primary transition-colors" />
              </div>
              <h4 className="text-white font-black text-[10px] uppercase tracking-[5px] mb-3 group-hover:text-primary transition-colors">{item.label}</h4>
              <p className="text-white/20 text-xs font-black uppercase tracking-tight leading-relaxed italic">{item.desc}</p>
           </motion.div>
         ))}
      </div>

      <Modal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        actionText={modal.type !== 'loading' ? 'Acknowledge' : undefined}
      />
    </div>
  );
}
