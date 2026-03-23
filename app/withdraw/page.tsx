"use client";

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  Loader,
  ArrowUpRight,
  AlertCircle,
  Search,
  CheckCircle2
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Skeleton, StatSkeleton } from '@/app/components/Skeleton';
import Modal from '@/app/components/Modal';

export default function WithdrawalPage() {
  const [user, setUser] = useState<unknown>(null);
  const [userData, setUserData] = useState<Record<string, unknown> | null>(null);
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
          if (snap.exists()) setUserData(snap.data());
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
    } catch (_err) {
      setResolveError('Verification failed');
    } finally {
      setIsResolving(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData?.isMember) {
      setModal({ isOpen: true, type: 'error', title: 'Membership Required', message: 'You must upgrade to a Standard Plan before withdrawing.'});
      return;
    }

    if (!amount || amount < 500) {
      setModal({ isOpen: true, type: 'error', title: 'Invalid Amount', message: 'Minimum withdrawal is ₦500.'});
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

    } catch (_err) {
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
    <div className="p-6 md:p-10 max-w-4xl mx-auto pb-40">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-10 transition-colors font-bold text-sm text-[10px] uppercase tracking-widest leading-none">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Withdrawal Hub</h1>
        <p className="text-white/40 text-sm font-bold tracking-[2px] uppercase">Cash out your earnings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="clay-card p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
           <span className="text-[10px] font-black text-primary uppercase tracking-[4px]">Available Balance</span>
           <div className="text-5xl font-black text-white mt-4 mb-2">₦{(userData?.balance || 0).toLocaleString()}</div>
           <p className="text-white/30 text-[10px] font-black uppercase tracking-[2px]">Min Withdrawal: ₦500</p>
        </div>
        <div className="clay-card p-8 bg-white/[0.01] flex flex-col justify-between">
           <div>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[4px]">Verified Target</span>
              <div className="text-3xl font-black text-white mt-4">₦{(userData?.totalEarned || 0).toLocaleString()}</div>
           </div>
           <div className="flex items-center gap-2 text-green-400 mt-4">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00FF88]">Auto-Verifying Payouts</span>
           </div>
        </div>
      </div>

      <div className="clay-card p-10 border-white/5 relative transition-all">
         <form className="space-y-6" onSubmit={handleWithdraw}>
            
            {/* Bank Selection */}
            <div className="relative">
               <label className="text-[10px] font-black text-white/30 uppercase tracking-[2px] ml-1 mb-2 block">Select Bank</label>
               <div 
                  onClick={() => setShowBankDropdown(!showBankDropdown)}
                  className="glass w-full px-6 py-4 rounded-2xl text-white outline-none border border-white/5 cursor-pointer flex justify-between items-center bg-white/[0.02] hover:bg-white/[0.05]"
               >
                  <span className={selectedBank ? 'text-white' : 'text-white/20'}>
                    {selectedBank ? selectedBank.name : 'Choose your bank...'}
                  </span>
                  <Search className="w-4 h-4 text-white/20" />
               </div>

               {showBankDropdown && (
                 <div className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl border border-white/10 overflow-hidden z-[50] shadow-2xl backdrop-blur-2xl">
                    <input 
                      autoFocus
                      placeholder="Search bank..."
                      className="w-full p-4 bg-white/5 text-white outline-none border-b border-white/5 text-sm"
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                    />
                    <div className="max-h-60 overflow-y-auto">
                       {filteredBanks.map((b, i) => (
                         <div 
                            key={i} 
                            onClick={() => { setSelectedBank(b); setShowBankDropdown(false); }}
                            className="p-4 hover:bg-white/5 text-white/60 hover:text-white cursor-pointer transition-colors text-sm font-bold"
                         >
                            {b.name}
                         </div>
                       ))}
                    </div>
                 </div>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[2px] ml-1">Account Number</label>
                  <input 
                     required
                     type="number" placeholder="0123456789" 
                     className={`glass w-full px-6 py-4 rounded-2xl text-white outline-none border transition-all font-mono focus:bg-white/[0.05] ${resolveError ? 'border-red-500/50' : accountName ? 'border-green-500/50' : 'border-white/5'}`} 
                     value={accountNumber}
                     maxLength={10}
                     onChange={(e) => setAccountNumber(e.target.value.slice(0, 10))}
                  />
                  {resolveError && <p className="text-[9px] text-red-400 font-bold uppercase tracking-wider ml-2">{resolveError}</p>}
                </div>
                
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[2px] ml-1">Account Name</label>
                  <div className="relative">
                    <input 
                      readOnly
                      placeholder={isResolving ? 'Verifying...' : 'Account holder name...'}
                      className="glass w-full px-6 py-4 rounded-2xl text-white/40 outline-none border border-white/5 bg-black/20" 
                      value={accountName}
                    />
                    {isResolving && <Loader className="absolute right-4 top-4 w-5 h-5 animate-spin text-primary" />}
                    {accountName && !isResolving && <CheckCircle2 className="absolute right-4 top-4 w-5 h-5 text-green-400" />}
                  </div>
                </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-white/30 uppercase tracking-[2px] ml-1">Amount to Withdraw (₦)</label>
               <input 
                  required
                  type="number" placeholder="500" 
                  className="glass w-full px-6 py-5 rounded-2xl text-white outline-none border-primary border bg-primary/5 text-2xl font-black text-center" 
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
               />
            </div>

            <button 
               disabled={processing || isResolving || !accountName}
               type="submit"
               className="clay-button w-full py-5 rounded-2xl font-black text-xl text-white flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl shadow-primary/10 disabled:opacity-40"
            >
               {processing ? <Loader className="w-6 h-6 animate-spin" /> : <>Request Secure Payout <ArrowUpRight className="w-6 h-6" /></>}
            </button>
         </form>

         <div className="mt-10 p-6 rounded-2xl glass border-orange-500/20 bg-orange-500/5">
            <div className="flex items-center gap-3 text-orange-400 mb-2 font-black uppercase text-[10px] tracking-widest">
               <AlertCircle className="w-4 h-4" /> Withdrawal Terms
            </div>
            <p className="text-xs text-white/40 leading-relaxed font-bold">
               Withdrawals are processed in 24–48 hours. Account name must match your profile name for instant approval.
            </p>
         </div>
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
