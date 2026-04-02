"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { generateRandomActivity } from '@/lib/activity-generator';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatSkeleton, Skeleton } from '@/app/components/Skeleton';
import Modal from '@/app/components/Modal';

export default function UpgradePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const processedRef = React.useRef(false);
  const [Korapay, setKorapay] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for global script pre-loaded in layout.tsx
    const checkScript = () => {
      if ((window as any).Korapay) {
        setKorapay(() => (window as any).Korapay);
        return true;
      }
      return false;
    }

    if (!checkScript()) {
      const interval = setInterval(() => {
        if (checkScript()) clearInterval(interval);
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

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
    processedRef.current = false;

    const publicKey = process.env.NEXT_PUBLIC_KORAPAY_PUBLIC_KEY;
    if (!publicKey) {
      setModal({ isOpen: true, type: 'error', title: 'Config Error', message: "Korapay Public Key is missing! Please check your .env file."});
      setProcessing(false);
      return;
    }

    setModal({ 
      isOpen: true, 
      type: 'loading', 
      title: 'Connecting to Bank...', 
      message: 'Network detected: SLOW. Establishing a secure handshake with Korapay servers. Please do not refresh.' 
    });

    try {
       if (!Korapay) {
         setModal({ isOpen: true, type: 'error', title: 'Connecting...', message: 'Connecting to payment gateway. Please try again in 1 second.' });
         setProcessing(false);
         return;
       }

      Korapay.initialize({
        key: publicKey,
        reference: `upg_${Date.now()}_${user.uid.substring(0, 5)}`,
        customer: {
          name: user.displayName || user.email?.split('@')[0] || "User",
          email: user.email!
        },
        amount: 1500, // ₦1,500
        currency: "NGN",
        onSuccess: async (response: { reference: string }) => {
          if (processedRef.current) return;
          processedRef.current = true;
          
          setModal({ isOpen: true, type: 'loading', title: 'Verifying Payment', message: 'Checking with Korapay. Please wait...' });
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
        onClose: () => {
          setProcessing(false);
          setModal({ isOpen: true, type: 'info', title: 'Upgrade Cancelled', message: 'The payment process was stopped. No charges were made.'});
        },
      });
    } catch (err) {
      console.error("Korapay error:", err);
      setProcessing(false);
      setModal({ isOpen: true, type: 'error', title: 'Payment Error', message: "Failed to launch payment. Please refresh and try again."});
    }
  };

  const [activityIndex, setActivityIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  
  const [activity, setActivity] = useState<any>(null);

  useEffect(() => {
    setActivity(generateRandomActivity());
    const cycleInterval = setInterval(() => {
        setShowToast(false);
        setTimeout(() => {
            setActivity(generateRandomActivity());
            setShowToast(true);
        }, 500);
    }, 6000); 
    
    setTimeout(() => setShowToast(true), 2000);
    return () => clearInterval(cycleInterval);
  }, []);

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
      
      {/* ─── LIVE POP-UP NOTIFICATION (THE ULTIMATE FOMO) ─── */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="fixed bottom-10 left-6 md:left-12 z-[100] max-w-[280px]"
          >
            <div className="glass p-5 rounded-2xl border-white/5 bg-[#0A0F1E]/80 backdrop-blur-3xl shadow-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-white italic truncate pr-4">
                    @{activity?.user} {activity?.action} {activity?.amount} {activity?.suffix}
                </p>
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{activity?.time}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Link href="/dashboard" className="inline-flex items-center gap-3 text-white/40 hover:text-white mb-20 transition-all font-black text-xs uppercase tracking-[4px] group">
         <div className="p-2.5 rounded-xl glass border-white/5 group-hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
         </div>
         Back to Dashboard
      </Link>

      <div className="text-center mb-16 px-4">
        <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase italic">
           Earning License
        </h1>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-10">
           <span className="text-white/20 text-xs md:text-sm font-black uppercase tracking-[4px]">Direct portal activation</span>
           <div className="h-1.5 w-1.5 rounded-full bg-white/10 hidden md:block" />
           <span className="text-blue-400 text-[10px] md:text-xs font-black uppercase tracking-[4px] animate-pulse">₦4,250+ Current Tasks Pending</span>
        </div>

        {/* LIVE NETWORK OVERVIEW ACTIVE */}
        <div className="glass px-6 py-3 rounded-2xl border-white/5 inline-flex items-center gap-3 mb-10 bg-white/[0.01]">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[2px]">
                LIVE NETWORK OVERVIEW ACTIVE
            </span>
        </div>

        {/* License Batch Urgency Monitor */}
        <div className="max-w-xl mx-auto bg-blue-500/5 border border-blue-500/10 rounded-3xl p-6 md:p-8 flex items-center justify-between overflow-hidden relative group shadow-2xl backdrop-blur-3xl">
            <div className="relative z-10 text-left">
                <div className="text-[9px] font-black text-blue-400 uppercase tracking-[4px] mb-2 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                   License Batch Status
                </div>
                <div className="text-xl md:text-2xl font-black text-white italic tracking-tighter">INTAKE BATCH 14</div>
            </div>
            <div className="text-right relative z-10">
                <div className="text-[9px] font-black text-white/40 uppercase tracking-[4px] mb-3">92% Capacity Reached</div>
                <div className="w-28 md:w-40 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "92%" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    />
                </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      </div>

      {/* Main Pricing Card - LUXURY STYLE */}
      <motion.div 
         initial={{ y: 20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         className="max-w-2xl mx-auto glass border-white/5 p-8 md:p-14 rounded-[3rem] text-center relative overflow-hidden mb-24 shadow-2xl bg-gradient-to-b from-blue-600/5 to-transparent backdrop-blur-3xl group"
      >
         <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
         
         <div className="relative z-10 flex flex-col items-center">
            <div className="flex justify-between w-full mb-10">
                <div className="text-left">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[3px] block mb-1">Batch #482</span>
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-[2px]">92% ACTIVE</span>
                </div>
                <div className="text-right">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[3px] block mb-1">Status</span>
                    <span className="text-[10px] font-black text-green-400 uppercase tracking-[2px]">SECURED</span>
                </div>
            </div>

            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-blue-500/10 flex items-center justify-center mb-10 border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform duration-700">
               {processing ? <Loader className="w-12 h-12 animate-spin text-blue-400" /> : <ShieldCheck className="w-12 h-12 text-blue-400" />}
            </div>
            
            <div className="flex flex-col items-center mb-10">
               <span className="glass px-6 py-2 rounded-full text-blue-400 text-[9px] font-black uppercase tracking-[5px] mb-8 border border-blue-500/20 shadow-2xl">One-Time Activation</span>
               <div className="text-7xl md:text-9xl font-black text-white tracking-tighter flex items-start gap-2 leading-none">
                  <span className="text-3xl md:text-4xl text-white/20 mt-3 md:mt-5 italic">₦</span>1,500
               </div>
            </div>

            <div className="w-full space-y-10">
               <p className="text-white/40 font-medium text-base md:text-lg mb-12 italic leading-relaxed px-4 md:px-0">
                  Join the elite earners. Members have withdrawn over <span className="text-white font-black">₦12,500,000</span> this month alone. Your slot is currently <span className="text-white underline decoration-blue-500 decoration-4 underline-offset-8">Reserved</span>.
               </p>
               
               <button 
                  type="button"
                  onClick={handleUpgrade}
                  disabled={processing}
                  className="w-full py-6 md:py-8 rounded-[1.5rem] md:rounded-[2rem] bg-white hover:bg-white/90 font-black text-xl md:text-2xl text-black shadow-2xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-[4px]"
               >
                  {processing ? 'Connecting Gateway...' : 'Activate Portal'}
               </button>

               <div className="flex items-center justify-center gap-6 pt-4 opacity-20">
                    <span className="text-[10px] font-black uppercase tracking-widest">Korapay Secured</span>
                    <div className="h-1 w-1 rounded-full bg-white" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Instant Activation</span>
               </div>
            </div>
         </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
         {[
           { icon: Zap, label: 'Instant Pay', desc: 'Withdraw rewards directly to your Nigerian bank instantly.' },
           { icon: TrendingUp, label: 'High Potential', desc: 'Unlock missions with rewards up to ₦100,000 monthly.' },
           { icon: ShieldCheck, label: 'Elite Access', desc: 'Secure the blue checkmark and premium community perks.' }
         ].map((item, i) => (
            <motion.div 
               key={i} 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 + (i * 0.1) }}
               className="glass border-white/5 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] text-center hover:bg-white/[0.02] transition-colors group"
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
