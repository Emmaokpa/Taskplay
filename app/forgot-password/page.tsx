"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Loader, Send, KeyRound, Lock, Eye, EyeOff, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/app/components/Logo';

export default function ForgotPasswordPage() {
   const [step, setStep] = useState<1 | 2 | 3>(1);
   const [email, setEmail] = useState('');

   // Step 2 vars
   const [code, setCode] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const router = useRouter();

   const handleRequestCode = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
         const response = await fetch('/api/email', {
            method: 'POST',
            body: JSON.stringify({ email, type: 'reset-password' }),
         });
         const data = await response.json();
         if (!response.ok) throw new Error(data.error || 'Failed to dispatch sequence');
         setStep(2);
      } catch (err: any) {
         setError(err.message);
      } finally {
         setLoading(false);
      }
   };

   const handleResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
         const response = await fetch('/api/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ email, code, type: 'reset-password', newPassword }),
         });
         const data = await response.json();
         if (!response.ok) throw new Error(data.error || 'Invalid configuration');
         setStep(3);
      } catch (err: any) {
         setError(err.message);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen flex items-center justify-center py-12 px-6">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/10 blur-[120px] -mr-48 -mt-48 pointer-events-none" />

         <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="clay-card p-8 sm:p-12 md:p-16 w-full max-w-lg bg-[#0A0F1E]/60 backdrop-blur-3xl border-white/5 relative z-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]"
         >
            <Link href="/login" className="inline-flex items-center gap-2 text-white/30 hover:text-white transition-colors mb-8 text-[10px] font-black uppercase tracking-[3px]">
               <ArrowLeft className="w-4 h-4" /> Cancel Override
            </Link>

            <AnimatePresence mode="wait">
               {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                     <div className="text-center mb-10">
                        <Logo size="xl" className="justify-center mb-8" />
                        <div className="w-16 h-16 rounded-[1.5rem] bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-xl">
                           <ShieldAlert className="w-8 h-8 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tighter">Security Override</h1>
                        <p className="text-white/30 text-[10px] sm:text-xs font-bold uppercase tracking-[3px] text-center leading-relaxed italic px-4">
                           Dispatch a 6-digit cryptographic code <br />to recover access to your identity node
                        </p>
                     </div>

                     {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] mb-8 font-black uppercase tracking-widest text-center shadow-lg">{error}</div>}

                     <form onSubmit={handleRequestCode} className="space-y-6">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-white/30 uppercase tracking-[3px] ml-1">Target Email</label>
                           <div className="bg-white/[0.03] flex items-center px-5 py-4 rounded-[1.5rem] border border-white/5 focus-within:border-red-400/40 focus-within:bg-white/[0.05] transition-all duration-300">
                              <Mail className="w-5 h-5 text-white/20 mr-4" />
                              <input
                                 required type="email" placeholder="node@matrix.com"
                                 className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-white/10 font-medium"
                                 onChange={(e) => setEmail(e.target.value)}
                              />
                           </div>
                        </div>

                        <button
                           disabled={loading || !email}
                           type="submit"
                           className="clay-button w-full py-5 rounded-[1.5rem] font-black text-xl text-white flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl shadow-red-500/20 !bg-red-500 hover:!bg-red-600 !border-none uppercase tracking-tighter italic disabled:opacity-50"
                        >
                           {loading ? <Loader className="w-6 h-6 animate-spin" /> : <>Dispatch Code <Send className="w-6 h-6" /></>}
                        </button>
                     </form>
                  </motion.div>
               )}

               {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                     <div className="text-center mb-10">
                        <h1 className="text-3xl lg:text-4xl font-black text-white mb-2 tracking-tighter text-center">Reconfigure Identity</h1>
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-[3px] text-center italic break-all px-4">
                           Code transmitted to {email}
                        </p>
                     </div>

                     {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] mb-8 font-black uppercase tracking-widest text-center shadow-lg">{error}</div>}

                     <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-white/30 uppercase tracking-[4px] ml-1 flex justify-center text-red-400">Authorization Code</label>
                           <div className="bg-red-500/5 flex items-center px-6 py-5 rounded-[1.5rem] border border-red-500/20 focus-within:border-red-500 focus-within:bg-red-500/10 transition-all duration-300 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]">
                              <KeyRound className="w-6 h-6 text-red-400 mr-5" />
                              <input
                                 required type="text" maxLength={6} placeholder="000000"
                                 className="bg-transparent border-none outline-none text-red-400 text-3xl font-black tracking-[10px] w-full placeholder-red-500/30 text-center font-mono"
                                 onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // only numbers
                              />
                           </div>
                        </div>

                        <div className="space-y-3 pt-4">
                           <label className="text-[10px] font-black text-white/30 uppercase tracking-[3px] ml-1 flex justify-start">New Security Parameter</label>
                           <div className="bg-white/[0.03] flex items-center px-5 py-4 rounded-[1.5rem] border border-white/5 focus-within:border-white/40 focus-within:bg-white/[0.05] transition-all duration-300 relative">
                              <Lock className="w-5 h-5 text-white/20 mr-4" />
                              <input
                                 required type={showPassword ? 'text' : 'password'} placeholder="••••••••" minLength={6}
                                 className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-white/10 pr-12 font-medium"
                                 onChange={(e) => setNewPassword(e.target.value)}
                              />
                              <button
                                 type="button"
                                 onClick={() => setShowPassword(!showPassword)}
                                 className="absolute right-5 text-white/10 hover:text-white transition-colors"
                              >
                                 {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                           </div>
                        </div>

                        <button
                           disabled={loading || code.length !== 6 || newPassword.length < 6}
                           type="submit"
                           className="clay-button w-full py-5 rounded-[1.5rem] font-black text-xl text-white flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl uppercase tracking-tighter italic disabled:opacity-50 mt-6"
                        >
                           {loading ? <Loader className="w-6 h-6 animate-spin" /> : <>Finalize Reconstruction</>}
                        </button>
                     </form>
                  </motion.div>
               )}

               {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                     <div className="w-24 h-24 rounded-[2rem] bg-green-500/10 flex items-center justify-center mx-auto mb-8 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                        <CheckCircle2 className="w-12 h-12 text-green-400" />
                     </div>
                     <h2 className="text-3xl font-black text-white mb-4 tracking-tighter">System Recovered</h2>
                     <p className="text-white/30 text-[10px] font-black uppercase tracking-[3px] leading-relaxed mb-10 italic">
                        Identity matrix successfully reconfigured. <br />You may now log in.
                     </p>
                     <Link href="/login" className="clay-button inline-flex items-center gap-4 px-10 py-5 rounded-[1.5rem] text-sm uppercase tracking-widest font-black italic shadow-2xl">
                        Proceed to Login <ArrowRight className="w-5 h-5" />
                     </Link>
                  </motion.div>
               )}
            </AnimatePresence>
         </motion.div>
      </div>
   );
}
