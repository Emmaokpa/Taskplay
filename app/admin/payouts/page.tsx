"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Loader, 
  Eye, 
  CreditCard,
  Building2,
  User,
  ExternalLink,
  Wallet
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import Link from 'next/link';
import AdminGuard from '@/app/components/AdminGuard';

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayouts = async () => {
      const q = query(collection(db, 'withdrawals'), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPayouts(items);
      setLoading(false);
    };
    fetchPayouts();
  }, []);

  const handleProcess = async (payoutId: string, action: 'paid' | 'rejected') => {
    setVerifying(payoutId);
    const payout = payouts.find(p => p.id === payoutId);
    
    if (!payout) {
      alert("Payout data not found.");
      setVerifying(null);
      return;
    }

    try {
      const payoutRef = doc(db, 'withdrawals', payoutId);
      
      // 1. Update Withdrawal Status
      await updateDoc(payoutRef, { 
        status: action,
        processedAt: serverTimestamp()
      });

      // 2. If Rejected → Refund the user
      if (action === 'rejected') {
        const userRef = doc(db, 'users', payout.userId);
        await updateDoc(userRef, {
          balance: increment(payout.amount)
        });
      }

      setPayouts(prev => prev.filter(p => p.id !== payoutId));
    } catch (err) {
      console.error("Payout error:", err);
      alert("Processing failed. Check console for details.");
    } finally {
      setVerifying(null);
    }
  };

  if (loading) return <div className="p-20 text-center text-white/50"><Loader className="w-10 h-10 animate-spin mx-auto text-primary" /> Loading payouts...</div>;

  return (
    <AdminGuard>
      <div className="p-10 max-w-6xl mx-auto pb-32">
      <div className="mb-12 flex items-center justify-between">
         <div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Withdrawal Requests</h1>
            <p className="text-white/40 text-sm font-bold tracking-[2px] uppercase">Process pending payout batches</p>
         </div>
         <Link href="/admin" className="p-4 rounded-xl glass border-white/5 text-white/40 hover:text-white transition-all font-bold text-xs uppercase tracking-widest">
            Admin Root
         </Link>
      </div>

      {payouts.length === 0 ? (
        <div className="clay-card p-20 text-center border-white/5 bg-white/[0.01]">
           <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-6 opacity-30" />
           <h3 className="text-xl font-bold text-white mb-2">No pending payouts</h3>
           <p className="text-white/40">The queue is currently empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {payouts.map((payout, i) => (
            <motion.div 
               key={payout.id}
               initial={{ x: -20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: i * 0.05 }}
               className="clay-card p-8 border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 group"
            >
               <div className="flex-1 space-y-4 w-full">
                  <div className="flex items-center gap-3">
                     <span className="text-3xl font-black text-white">₦{payout.amount.toLocaleString()}</span>
                     <span className="px-3 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-widest">Pending</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="flex items-center gap-3 text-white/40">
                        <User className="w-4 h-4" />
                        <span className="text-xs font-bold text-white/80">{payout.accountName}</span>
                     </div>
                     <div className="flex items-center gap-3 text-white/40">
                        <Building2 className="w-4 h-4" />
                        <span className="text-xs font-bold text-white/80">{payout.bankName}</span>
                     </div>
                     <div className="flex items-center gap-3 text-white/40">
                        <Wallet className="w-4 h-4" />
                        <span className="text-xs font-bold text-white/80 font-mono tracking-widest">{payout.accountNumber}</span>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-3 w-full md:w-auto">
                  <button 
                     disabled={verifying === payout.id}
                     onClick={() => handleProcess(payout.id, 'rejected')}
                     className="flex-1 md:flex-none px-6 py-4 rounded-xl glass border-red-500/20 text-red-400 font-bold hover:bg-red-500/10 transition-all text-xs uppercase"
                  >
                     Reject
                  </button>
                  <button 
                     disabled={verifying === payout.id}
                     onClick={() => handleProcess(payout.id, 'paid')}
                     className="flex-1 md:flex-none clay-button px-10 py-4 rounded-xl font-black text-white text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                  >
                     {verifying === payout.id ? <Loader className="w-4 h-4 animate-spin" /> : "Mark as Paid"}
                  </button>
               </div>
            </motion.div>
          ))}
        </div>
      )}
      </div>
    </AdminGuard>
  );
}
