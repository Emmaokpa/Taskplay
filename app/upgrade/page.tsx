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
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter drop-shadow-lg">
           Upgrade Your <span className="text-blue-500">Account</span>
        </h1>
        <p className="text-white/60 text-sm md:text-base font-bold max-w-lg mx-auto">Pay a one-time fee to unlock unlimited tasks and instant bank withdrawals.</p>
      </div>

      {/* Main Pricing Card - Simplistic & Trustworthy */}
      <motion.div 
         initial={{ y: 20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         className="max-w-xl mx-auto bg-gradient-to-b from-[#1c2333] to-[#0A0F1E] border border-blue-500/20 p-8 md:p-12 rounded-[2.5rem] text-center relative overflow-hidden mb-16 shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
      >
         <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/30">
               {processing ? <Loader className="w-10 h-10 animate-spin text-blue-400" /> : <ShieldCheck className="w-10 h-10 text-blue-400" />}
            </div>
            
            <div className="flex flex-col items-center mb-8">
               <span className="bg-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[3px] mb-6 border border-blue-500/20">One-Time Payment</span>
               <div className="text-6xl md:text-8xl font-black text-white tracking-tighter flex items-start gap-1">
                  <span className="text-3xl md:text-4xl text-white/40 mt-2 md:mt-3">₦</span>1,500
               </div>
            </div>

            <div className="w-full space-y-6">
               <p className="text-white/70 font-medium text-sm md:text-base mb-8">No monthly fees. Pay once and enjoy permanent access to high-paying tasks and fast withdrawals.</p>
               
               <button 
                  type="button"
                  onClick={handleUpgrade}
                  disabled={processing}
                  className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 font-black text-lg md:text-xl text-white shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
               >
                  {processing ? 'Processing Payment...' : 'Pay ₦1,500 Now'}
               </button>
            </div>
         </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
         {[
           { icon: Zap, label: 'Instant Withdrawals', desc: 'Get your money sent to your bank account with zero delays.' },
           { icon: TrendingUp, label: 'Higher Payouts', desc: 'Unlock premium tasks that pay up to ₦1,000+ each.' },
           { icon: ShieldCheck, label: 'Verified Account', desc: 'Get a verified badge and priority 24/7 customer support.' }
         ].map((item, i) => (
           <div 
             key={i} 
             className="bg-[#1c2333]/40 border border-white/5 p-8 rounded-[2rem] text-center"
           >
              <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
                 <item.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="text-white font-black text-sm uppercase tracking-[1px] mb-3">{item.label}</h4>
              <p className="text-white/50 text-xs font-medium leading-relaxed">{item.desc}</p>
           </div>
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
