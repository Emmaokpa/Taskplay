"use client";

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CreditCard,
  Target,
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, updateDoc, increment } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatSkeleton, Skeleton } from '@/app/components/Skeleton';
import Modal from '@/app/components/Modal';

export default function AddFundsPage() {
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState<number | ''>('');
  const [user, setUser] = useState<User | null>(null);
  const [processing, setProcessing] = useState(false);
  const [PaystackPop, setPaystackPop] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Pre-load Paystack for instant reaction
    import('@paystack/inline-js').then(mod => setPaystackPop(() => mod.default));
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
        if (isMounted) setLoading(false);
      } else {
        router.push('/login');
      }
    });
    return () => { isMounted = false; unsubscribe(); };
  }, [router]);

  const handlePayment = async () => {
    if (!amount || amount < 100) return setModal({ isOpen: true, type: 'error', title: 'Invalid Amount', message: "Minimum deposit is ₦100" });

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) return setModal({ isOpen: true, type: 'error', title: 'Config Error', message: "Paystack Public Key is missing! Check your .env setup." });

    if (!user) return;

    setProcessing(true);

    try {

      if (!PaystackPop) {
        setModal({ isOpen: true, type: 'error', title: 'Loading...', message: 'Connecting to payment gateway. Please try again in a second.' });
        return;
      }
      const paystack = new PaystackPop();

      paystack.newTransaction({
        key: publicKey,
        email: user.email,
        amount: Number(amount) * 100, // In kobo
        currency: "NGN",
        onSuccess: async (response: { reference: string }) => {
          try {
            setModal({ isOpen: true, type: 'loading', title: 'Verifying', message: 'Securing your credit...' });
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
              balance: increment(Number(amount))
            });
            setModal({ isOpen: true, type: 'success', title: 'Success!', message: `₦${amount} has been added to your balance.` });
            router.push('/dashboard');
          } catch {
            setModal({ isOpen: true, type: 'error', title: 'Balance Update Failed', message: "Payment received but account update failed. Contact support with ref: " + response.reference });
          } finally {
            setProcessing(false);
          }
        },
        onCancel: () => {
          setProcessing(false);
          setModal({ isOpen: true, type: 'info', title: 'Cancelled', message: 'The payment process was closed.' });
        }
      });
    } catch (err) {
      console.error("Paystack error:", (err as Error).message || err);
      setModal({ isOpen: true, type: 'error', title: 'Payment Error', message: "Payment window failed to launch. Please try again." });
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-10">
      <Skeleton className="h-12 w-48" />
      <div className="glass p-10 h-64 rounded-3xl"><Skeleton className="h-full w-full rounded-2xl" /></div>
      <StatSkeleton />
    </div>
  );

  return (
    <div className="px-4 md:px-10 py-10 max-w-4xl mx-auto pb-44">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-10 transition-colors font-black text-[10px] uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Exit to Dashboard
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Add Funds</h1>
        <p className="text-white/40 text-sm font-bold tracking-[2px] uppercase">Refill your wallet balance</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="glass p-8 md:p-12 rounded-[2.5rem] border-white/5 bg-white/[0.01] flex flex-col items-center text-center gap-8 relative overflow-hidden shadow-2xl">
          <div className="w-16 h-16 rounded-3xl glass flex items-center justify-center text-primary shadow-xl border border-primary/20">
            <CreditCard className="w-8 h-8" />
          </div>
          <div className="max-w-xs w-full">
            <h3 className="text-xl font-black text-white tracking-tight mb-2">Secure Deposit</h3>
            <p className="text-white/20 text-[9px] font-black tracking-widest uppercase mb-8 leading-none">Powered by Paystack Network</p>
            
            <form id="paymentForm" className="space-y-4">
              <input
                type="number"
                placeholder="Amount (₦)"
                className="glass w-full px-6 py-4 rounded-xl text-white outline-none text-center font-black text-xl border border-white/10 focus:border-primary/40 transition-all bg-black/20"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
              <button
                type="button"
                onClick={handlePayment}
                disabled={processing}
                className="bg-primary hover:bg-primary/80 w-full py-4 rounded-xl font-black text-sm text-white disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-primary/20 uppercase tracking-widest"
              >
                {processing ? 'Processing...' : 'Complete Payment'}
              </button>
            </form>
          </div>
        </div>

        <div className="glass p-8 rounded-[2.3rem] border-white/5 bg-white/[0.01]">
          <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[4px] mb-8 text-center italic font-bold">Wallet Benefits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {['Launch Campaigns', 'Daily Tasks', 'Instant Payouts', 'Bonus Rewards'].map((item, i) => (
              <div key={i} className="glass px-5 py-4 rounded-2xl text-white/40 font-bold text-[10px] flex items-center gap-3 border border-white/5 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {item}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        actionText={modal.type !== 'loading' ? 'Close' : undefined}
      />
    </div>
  );
}
