"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, ArrowRight, Loader, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/app/components/Logo';

function VerifyContent() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
           'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code, type: 'verification' }),
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Verification failed');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid authorization code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
       initial={{ opacity: 0, scale: 0.98, y: 10 }}
       animate={{ opacity: 1, scale: 1, y: 0 }}
       transition={{ duration: 0.5, ease: "easeOut" }}
       className="clay-card p-10 md:p-16 w-full max-w-lg bg-[#0A0F1E]/60 backdrop-blur-3xl border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] relative z-10"
    >
      <div className="mb-12">
         <Link href="/login" className="inline-flex items-center gap-2 text-white/30 hover:text-white transition-colors mb-8 text-[10px] font-black uppercase tracking-[3px]">
            <ArrowLeft className="w-4 h-4" /> Cancel Verification
         </Link>
         <Logo size="xl" className="mb-6 justify-center" />
         <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-xl">
             <ShieldCheck className="w-8 h-8 text-primary shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
         </div>
         <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tighter text-center">Verify Identity</h1>
         <p className="text-white/30 text-[10px] sm:text-xs font-bold uppercase tracking-[3px] text-center leading-relaxed">
            We dispatched a secure 6-digit code to <br/><span className="text-primary italic">{email || 'your email'}</span>
         </p>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] uppercase font-black tracking-widest mb-8 text-center shadow-lg"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleVerify} className="space-y-8">
         <div className="space-y-3">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[4px] ml-1 flex justify-center">Authorization Code</label>
            <div className="bg-white/[0.03] flex items-center px-6 py-5 rounded-[1.5rem] border border-white/5 focus-within:border-primary/40 focus-within:bg-white/[0.05] transition-all duration-300">
               <KeyRound className="w-6 h-6 text-primary mr-5" />
               <input 
                  required type="text" maxLength={6} placeholder="000000" 
                  className="bg-transparent border-none outline-none text-white text-3xl font-black tracking-[10px] w-full placeholder-white/10 text-center font-mono"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} 
               />
            </div>
         </div>

         <button 
            disabled={loading || code.length !== 6 || !email}
            type="submit" 
            className="clay-button w-full py-6 rounded-[1.5rem] font-black text-xl text-white flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl shadow-primary/30 uppercase tracking-tighter italic disabled:opacity-50 disabled:grayscale"
         >
            {loading ? <Loader className="w-6 h-6 animate-spin" /> : <>Finalize Access <ArrowRight className="w-6 h-6" /></>}
         </button>
      </form>
    </motion.div>
  );
}

export default function VerifyOTPPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 blur-[120px] -ml-48 -mb-48 pointer-events-none" />
      
      <Suspense fallback={
        <div className="p-20 flex flex-col items-center justify-center text-white/20">
          <Loader className="w-10 h-10 animate-spin mb-4" />
          <p className="text-xs font-black uppercase tracking-widest italic">Decrypting Matrix...</p>
        </div>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  );
}

