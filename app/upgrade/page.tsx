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
               setModal({ isOpen: true, type: 'success', title: 'Payment Successful!', message: 'Your account has been verified. Redirecting...' });
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
    <div className="px-6 md:px-12 py-10 max-w-5xl mx-auto pb-44 relative z-10 overflow-hidden">
      
      <Link href="/dashboard" className="inline-flex items-center gap-3 text-white/40 hover:text-white mb-20 transition-all font-black text-xs uppercase tracking-[4px] group">
         <div className="p-2.5 rounded-xl glass border-white/5 group-hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
         </div>
         Back to Dashboard
      </Link>

      <div className="text-center mb-20 px-4">
        <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase italic">
           Account Verification
        </h1>
        <p className="text-white/20 text-xs md:text-sm font-black uppercase tracking-[6px] max-w-lg mx-auto">One-time entry fee to the earning elite</p>
      </div>

      {/* Main Pricing Card - LUXURY STYLE */}
      <motion.div 
         initial={{ y: 20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         className="max-w-2xl mx-auto glass border-white/5 p-10 md:p-16 rounded-[3.5rem] text-center relative overflow-hidden mb-24 shadow-2xl bg-gradient-to-b from-blue-600/5 to-transparent backdrop-blur-3xl group"
      >
         <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
         
         <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-blue-500/10 flex items-center justify-center mb-10 border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform duration-700">
               {processing ? <Loader className="w-12 h-12 animate-spin text-blue-400" /> : <ShieldCheck className="w-12 h-12 text-blue-400" />}
            </div>
            
            <div className="flex flex-col items-center mb-10">
               <span className="glass px-6 py-2 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[5px] mb-8 border border-blue-500/20 shadow-2xl">Verified Membership</span>
               <div className="text-7xl md:text-9xl font-black text-white tracking-tighter flex items-start gap-2">
                  <span className="text-3xl md:text-4xl text-white/20 mt-3 md:mt-5 italic">₦</span>1,500
               </div>
            </div>

            <div className="w-full space-y-10">
               <p className="text-white/40 font-medium text-base md:text-lg mb-12 italic leading-relaxed">
                  No subscriptions. No hidden fees. Pay once to activate <span className="text-white font-black">Lifetime Verification</span> and unlock unlimited withdrawals.
               </p>
               
               <button 
                  type="button"
                  onClick={handleUpgrade}
                  disabled={processing}
                  className="w-full py-6 md:py-8 rounded-[2rem] bg-white hover:bg-white/90 font-black text-xl md:text-2xl text-black shadow-2xl shadow-blue-500/10 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-[4px]"
               >
                  {processing ? 'Processing...' : 'Verify Now'}
               </button>
            </div>
         </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
         {[
           { icon: Zap, label: 'Instant Pay', desc: 'Direct bank transfers with zero processing delays.' },
           { icon: TrendingUp, label: 'High Yield', desc: 'Access CPA offers paying up to ₦5,000+ each.' },
           { icon: ShieldCheck, label: 'Trust Badge', desc: 'Get the verified checkmark and premium support.' }
         ].map((item, i) => (
            <motion.div 
               key={i} 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 + (i * 0.1) }}
               className="glass border-white/5 p-10 rounded-[3rem] text-center hover:bg-white/[0.02] transition-colors group"
            >
               <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-8 border border-white/5 group-hover:rotate-12 transition-transform duration-500">
                  <item.icon className="w-7 h-7 text-blue-400" />
               </div>
               <h4 className="text-white font-black text-sm uppercase tracking-[3px] mb-4 italic leading-none">{item.label}</h4>
               <p className="text-white/30 text-[11px] font-medium leading-relaxed italic">{item.desc}</p>
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
