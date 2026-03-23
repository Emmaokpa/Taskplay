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
import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatSkeleton, Skeleton } from '@/app/components/Skeleton';
import Modal from '@/app/components/Modal';

export default function UpgradePage() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
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
            setUserData(data);
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
    if (processing) return;
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
        onSuccess: async (response: any) => {
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
          } catch (err: any) {
            setModal({ isOpen: true, type: 'error', title: 'Critical Error', message: err.message || "Payment verified but account update failed. Please contact support."});
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
    <div className="px-4 md:px-10 py-10 max-w-5xl mx-auto pb-44">
      
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-10 md:mb-16 transition-colors font-black text-[10px] uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Exit to Dashboard
      </Link>

      <div className="text-center mb-12 md:mb-16 px-2">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter leading-tight">Unlock Elite Status</h1>
        <p className="text-white/40 text-[10px] md:text-xs font-black tracking-[3px] uppercase">One small payment, infinite earning power</p>
      </div>

      {/* Main Pricing Card - Responsive */}
      <div className="glass p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border-primary/20 bg-primary/5 text-center relative overflow-hidden mb-12 shadow-2xl shadow-primary/10">
         <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center mb-8 md:mb-10 shadow-xl shadow-primary/30">
               {processing ? <Loader className="w-10 h-10 animate-spin text-white" /> : <ShieldCheck className="w-10 h-10 text-white" />}
            </div>
            
            <div className="text-5xl md:text-7xl font-black text-white mb-3">₦1,500<span className="text-sm md:text-xl text-white/30 font-bold tracking-tighter ml-2 italic">/Lifetime</span></div>
            <p className="text-white/60 mb-10 md:mb-14 font-bold max-w-xs md:max-w-sm mx-auto text-sm leading-relaxed">Verified Membership unlocks all withdrawals, high-reward tasks, and priority payouts.</p>

            <form id="paymentForm" className="w-full flex justify-center">
               <button 
                  type="button"
                  onClick={handleUpgrade}
                  disabled={processing}
                  className="clay-button w-full max-w-sm py-5 md:py-7 rounded-[1.5rem] md:rounded-[2rem] font-black text-xl md:text-2xl text-white shadow-xl active:scale-[0.98] transition-all"
               >
                  {processing ? 'Launching...' : 'Activate Now'}
               </button>
            </form>
         </div>

         {/* Background Blobs - Responsive */}
         <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-primary/10 blur-[80px] md:blur-[100px] -z-0" />
         <div className="absolute bottom-10 left-10 w-32 h-32 md:w-40 md:h-40 bg-accent/20 blur-[60px] md:blur-[80px] -z-0" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-7">
         {[
           { icon: Zap, label: 'Instant Pay', desc: 'No holding periods' },
           { icon: TrendingUp, label: 'High Tiers', desc: '₦1,000+ per task' },
           { icon: History, label: 'Full Log', desc: 'Full audit history' }
         ].map((item, i) => (
           <div key={i} className="glass p-7 md:p-10 rounded-3xl border-white/5 text-center hover:bg-white/5 transition-all">
              <item.icon className="w-7 h-7 md:w-9 md:h-9 text-white/20 mx-auto mb-4 md:mb-6" />
              <h4 className="text-white font-black text-xs uppercase tracking-widest mb-2">{item.label}</h4>
              <p className="text-white/30 text-xs font-bold leading-relaxed">{item.desc}</p>
           </div>
         ))}
      </div>
      <Modal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        actionText={modal.type !== 'loading' ? 'Got it' : undefined}
      />
    </div>
  );
}
