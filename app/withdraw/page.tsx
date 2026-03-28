"use client";

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Loader,
  ArrowUpRight,
  AlertCircle,
  Search,
  CheckCircle2,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Skeleton, StatSkeleton } from '@/app/components/Skeleton';
import Modal from '@/app/components/Modal';

interface UserData {
  balance?: number;
  isMember?: boolean;
  totalEarned?: number;
  fullName?: string;
  [key: string]: unknown;
}

export default function WithdrawalPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  // Paystack Bank & Resolve Logic
  const [banks, setBanks] = useState<{name: string, code: string}[]>([]);
  const [selectedBank, setSelectedBank] = useState<{name: string, code: string} | null>(null);
  const [bankSearch, setBankSearch] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState('');

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

  // Form State
  const [amount, setAmount] = useState<number | ''>('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // ─── 1. Fetch Banks on mount ──────────────────────────────────────
  useEffect(() => {
    fetch('/api/paystack/banks')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBanks(data);
      })
      .catch(err => console.error("Error fetching banks:", err));
  }, []);

  // ─── 2. Auth & Realtime Data ──────────────────────────────────────
  useEffect(() => {
    let unsubscribeSnap: () => void;
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        unsubscribeSnap = onSnapshot(doc(db, 'users', u.uid), (snap) => {
          if (snap.exists()) setUserData(snap.data() as UserData);
          setLoading(false);
        });
      } else {
        router.push('/login');
      }
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnap) unsubscribeSnap();
    };
  }, [router]);

  // ─── 3. Auto-Resolve Account Name ──────────────────────────────────
  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank) {
      resolveAccount(accountNumber, selectedBank.code);
    } else {
      setAccountName('');
      setResolveError('');
    }
  }, [accountNumber, selectedBank]);

  const resolveAccount = async (num: string, code: string) => {
    setIsResolving(true);
    setResolveError('');
    try {
      const res = await fetch(`/api/paystack/resolve?account_number=${num}&bank_code=${code}`);
      const data = await res.json();
      if (data.account_name) {
        setAccountName(data.account_name);
      } else {
        setResolveError(data.error || 'Could not verify account');
      }
    } catch {
      setResolveError('Verification failed');
    } finally {
      setIsResolving(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !userData?.isMember) {
      setModal({ isOpen: true, type: 'error', title: 'Membership Required', message: 'You must upgrade to a Standard Plan before withdrawing.'});
      return;
    }

    if (!amount || amount < 1000) {
      setModal({ isOpen: true, type: 'error', title: 'Invalid Amount', message: 'Minimum withdrawal is ₦1,000.'});
      return;
    }

    if (amount > (userData?.balance || 0)) {
      setModal({ isOpen: true, type: 'error', title: 'Insufficient Balance', message: 'You cannot withdraw more than your current balance.'});
      return;
    }

    if (!accountName || !selectedBank || !accountNumber) {
      setModal({ isOpen: true, type: 'error', title: 'Missing Details', message: 'Please ensure account number is verified.'});
      return;
    }

    setProcessing(true);
    setModal({ isOpen: true, type: 'loading', title: 'Processing', message: 'Queueing your withdrawal request...'});

    try {
      await addDoc(collection(db, 'withdrawals'), {
        userId: user.uid,
        userEmail: user.email,
        fullName: userData.fullName || accountName,
        amount: Number(amount),
        accountName,
        bankName: selectedBank.name,
        bankCode: selectedBank.code,
        accountNumber,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(-Number(amount))
      });

      setModal({
        isOpen: true,
        type: 'success',
        title: 'Success!',
        message: `Your withdrawal of ₦${Number(amount).toLocaleString()} is pending approval.`
      });

      setAmount('');
      setAccountNumber('');
      setSelectedBank(null);
      setAccountName('');

    } catch {
      setModal({ isOpen: true, type: 'error', title: 'Error', message: 'Failed to process withdrawal.'});
    } finally {
      setProcessing(false);
    }
  };

  const filteredBanks = banks.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase())).slice(0, 10);

  if (loading) return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-12">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StatSkeleton /><StatSkeleton />
       </div>
       <div className="clay-card p-12 rounded-[2.5rem] border-white/5 space-y-8">
          <Skeleton className="h-40 w-full rounded-3xl" />
       </div>
    </div>
  );

  return (
    <div className="relative min-h-screen px-4 md:px-10 py-10 max-w-5xl mx-auto pb-44 z-10 overflow-hidden">
      
      {/* 🔮 Background Glows */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full -translate-x-1/2 pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/dashboard" className="inline-flex items-center gap-3 text-white/40 hover:text-white mb-16 transition-all font-black text-[10px] uppercase tracking-[4px] group">
          <div className="p-2.5 rounded-xl glass border-white/5 group-hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
          Exit to Dashboard
        </Link>
      </motion.div>

      <div className="mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tighter uppercase italic leading-none">Withdraw <span className="text-blue-500">Earnings.</span></h1>
        <p className="text-white/20 text-[10px] font-black uppercase tracking-[5px]">Instant pipeline to your Nigerian Bank</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
        <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-[#05070A]/40 backdrop-blur-3xl p-8 md:p-10 rounded-[3rem] border border-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5),inset_0_2px_10px_rgba(255,255,255,0.05)] relative overflow-hidden group"
        >
           <div className="relative z-10">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[4px] block mb-2 italic">Withdrawable</span>
              <div className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-3">₦{(userData?.balance || 0).toLocaleString()}</div>
              <p className="text-white/20 text-[8px] font-black uppercase tracking-widest leading-none">Min Limit: ₦1,000</p>
           </div>
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wallet className="w-16 h-16 text-blue-400" />
           </div>
        </motion.div>

        <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}
            className="bg-[#05070A]/40 backdrop-blur-3xl p-8 md:p-10 rounded-[3rem] border border-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5),inset_0_2px_10px_rgba(255,255,255,0.05)] flex flex-col justify-between"
        >
           <div>
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[4px] block mb-2 italic">Total Payouts</span>
              <div className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none">₦{(userData?.totalEarned || 0).toLocaleString()}</div>
           </div>
           <div className="flex items-center gap-3 text-green-400/60 mt-6 md:mt-0">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[3px]">Verified VIP Tier</span>
           </div>
        </motion.div>
      </div>

      <motion.div 
         initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
         className="bg-[#05070A]/30 backdrop-blur-3xl p-8 md:p-16 rounded-[4rem] border border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7),inset_0_2px_10px_rgba(255,255,255,0.05)] relative overflow-hidden"
      >
         <div className="absolute inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

         <form className="space-y-8" onSubmit={handleWithdraw}>
            
            {/* Bank Selection - CLAY STYLE */}
            <div className="relative space-y-3">
               <label className="text-[10px] font-black text-white/10 uppercase tracking-[4px] ml-4 italic">Destination Bank</label>
               <div 
                  onClick={() => setShowBankDropdown(!showBankDropdown)}
                  className="bg-white/[0.01] w-full px-8 py-5 rounded-[2rem] text-white outline-none border border-white/5 cursor-pointer flex justify-between items-center hover:bg-white/[0.03] transition-all shadow-inner"
               >
                  <span className={`text-base font-medium ${selectedBank ? 'text-white' : 'text-white/10'}`}>
                    {selectedBank ? selectedBank.name : 'Choose receiving bank'}
                  </span>
                  <div className="p-2 rounded-xl glass border-white/5">
                     <Search className="w-5 h-5 text-white/20" />
                  </div>
               </div>

               <AnimatePresence>
                {showBankDropdown && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-4 glass rounded-[2.5rem] border border-white/10 overflow-hidden z-[50] shadow-[0_50px_100px_rgba(0,0,0,0.8)] backdrop-blur-[50px] p-4"
                    >
                        <input 
                            autoFocus
                            placeholder="Type to filter..."
                            className="w-full p-6 bg-white/[0.03] text-white outline-none border border-white/5 rounded-3xl text-sm mb-4 placeholder-white/10 font-medium"
                            value={bankSearch}
                            onChange={(e) => setBankSearch(e.target.value)}
                        />
                        <div className="max-h-72 overflow-y-auto px-2 custom-scrollbar">
                           {filteredBanks.map((b, i) => (
                              <div 
                                 key={i} 
                                 onClick={() => { setSelectedBank(b); setShowBankDropdown(false); }}
                                 className="p-5 hover:bg-blue-500/10 text-white/40 hover:text-white cursor-pointer transition-all text-sm font-bold rounded-2xl mb-1 flex items-center justify-between group"
                              >
                                 {b.name}
                                 <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                           ))}
                        </div>
                    </motion.div>
                )}
               </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/10 uppercase tracking-[4px] ml-4 italic">Account Number</label>
                  <div className={`bg-white/[0.01] flex items-center px-8 py-5 rounded-[2rem] border transition-all shadow-inner ${resolveError ? 'border-red-500/30 bg-red-500/[0.01]' : accountName ? 'border-green-500/30 bg-green-500/[0.01]' : 'border-white/5'}`}>
                    <input 
                        required
                        type="number" placeholder="0123456789" 
                        className="bg-transparent border-none outline-none text-white text-xl w-full placeholder-white/5 font-black tracking-[4px]" 
                        value={accountNumber}
                        maxLength={10}
                        onChange={(e) => setAccountNumber(e.target.value.slice(0, 10))}
                    />
                  </div>
                  {resolveError && <p className="text-[10px] text-red-400 font-black uppercase tracking-widest ml-6">{resolveError}</p>}
                </div>
                
                <div className="space-y-3 relative">
                  <label className="text-[10px] font-black text-white/10 uppercase tracking-[4px] ml-4 italic">Identity Verification</label>
                  <div className="relative group">
                    <input 
                      readOnly
                      placeholder={isResolving ? 'Resolving Identity...' : 'Full Legal Name'}
                      className="bg-black/40 w-full px-8 py-5 rounded-[2rem] text-white/40 outline-none border border-white/5 text-base font-black italic cursor-not-allowed uppercase truncate pr-16" 
                      value={accountName}
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                        {isResolving ? <Loader className="w-6 h-6 animate-spin text-blue-400" /> : accountName && <CheckCircle2 className="w-6 h-6 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]" />}
                    </div>
                  </div>
                </div>
            </div>

            <div className="space-y-3 relative">
               <label className="text-[10px] font-black text-white/10 uppercase tracking-[4px] ml-4 italic">Sum to Transfer (₦)</label>
               <div className="relative group">
                    <div className="absolute left-10 top-1/2 -translate-y-1/2 text-2xl font-black text-blue-500 opacity-40 italic">₦</div>
                    <input 
                        required
                        type="number" placeholder="1000" 
                        className="bg-blue-500/[0.03] w-full pl-20 pr-10 py-8 rounded-[2.5rem] text-white outline-none border border-blue-500/20 text-4xl font-black text-center shadow-inner focus:border-blue-500/40 transition-all placeholder-white/5" 
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                    />
               </div>
            </div>

            <button 
               disabled={processing || isResolving || !accountName}
               type="submit"
               className="bg-white hover:bg-white/90 w-full py-8 rounded-[2.5rem] font-black text-2xl text-black flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-[0_20px_50px_rgba(255,255,255,0.1)] disabled:opacity-20 uppercase tracking-[4px]"
            >
               {processing ? <Loader className="w-8 h-8 animate-spin" /> : <>Process Payout <ArrowUpRight className="w-8 h-8" /></>}
            </button>
         </form>

         <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-orange-500/5 border border-orange-500/10">
                <AlertCircle className="w-4 h-4 text-orange-500/40" />
                <p className="text-[9px] text-white/30 font-black uppercase tracking-[2px]">
                   Requests are audited & settled within 24 business hours.
                </p>
            </div>
         </div>
      </motion.div>

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
