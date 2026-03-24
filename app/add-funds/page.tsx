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

      const PaystackPop = (await import('@paystack/inline-js')).default;
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
        <div className="clay-card p-10 border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl glass flex items-center justify-center text-primary shadow-xl border border-primary/20">
              <CreditCard className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">Paystack Gateway</h3>
              <p className="text-white/40 text-sm font-bold tracking-widest uppercase">Safe & Secure Payment</p>
            </div>
          </div>

          <form id="paymentForm" className="flex-1 max-w-xs w-full">
            <input
              type="number"
              placeholder="Amount (₦)"
              className="glass w-full px-6 py-4 rounded-2xl text-white outline-none mb-4 text-center font-black text-xl border border-white/5 focus:border-primary transition-all"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <button
              type="button"
              onClick={handlePayment}
              disabled={processing}
              className="clay-button w-full py-4 rounded-xl font-black text-lg text-white disabled:opacity-50"
            >
              {processing ? 'Launching...' : 'Pay with Paystack'}
            </button>
          </form>
        </div>

        <div className="clay-card p-10 border-white/5 bg-white/[0.01] text-center">
          <div className="flex items-center justify-center gap-3 text-white/40 text-[10px] font-black uppercase tracking-[3px] mb-6">
            <Target className="w-4 h-4" /> Why add funds?
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {['Launch Ad Campaigns', 'Membership Upgrade', 'High-Ticket Participation', 'Internal Transfers'].map((item, i) => (
              <div key={i} className="glass p-4 rounded-xl text-white/60 font-bold text-sm flex items-center gap-3 border border-white/5">
                <div className="w-2 h-2 rounded-full bg-primary" /> {item}
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
