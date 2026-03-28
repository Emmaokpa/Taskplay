"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Loader, Send, KeyRound, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Logo from '@/app/components/Logo';

const AmbientOrb = ({ color, size, delay, x, y }: { color: string, size: string, delay: number, x: string, y: string }) => (
  <motion.div
    initial={{ x: 0, y: 0, scale: 1 }}
    animate={{ 
      x: [0, 30, -30, 0],
      y: [0, -20, 20, 0],
      scale: [1, 1.1, 0.95, 1]
    }}
    transition={{ 
      duration: 15 + delay, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }}
    className={`absolute rounded-full blur-[100px] opacity-[0.08] pointer-events-none -z-10 ${color} ${size}`}
    style={{ left: x, top: y }}
  />
);

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
         if (!response.ok) throw new Error(data.error || 'Identity verify failed');
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
         if (!response.ok) throw new Error(data.error || 'Invalid recovery code');
         setStep(3);
      } catch (err: any) {
         setError(err.message);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="relative min-h-screen flex items-center justify-center py-24 px-6 bg-[#05070A] overflow-hidden">
         
         <AmbientOrb color="bg-blue-600" size="w-[500px] h-[500px]" delay={0} x="-10%" y="-10%" />
         <AmbientOrb color="bg-purple-600" size="w-[400px] h-[400px]" delay={5} x="70%" y="60%" />

         <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg relative z-10"
         >
            <div className="glass p-10 md:p-16 rounded-[4rem] border-white/5 bg-white/[0.01] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] backdrop-blur-3xl">
               <Link href="/login" className="inline-flex items-center gap-2 text-white/20 hover:text-white transition-colors mb-12 text-[10px] font-black uppercase tracking-[4px] italic">
                  <ArrowLeft className="w-5 h-5" /> Back to Login
               </Link>

               <AnimatePresence mode="wait">
                  {step === 1 && (
                     <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        <div className="text-center mb-16">
                           <Logo size="md" className="justify-center mb-10" />
                           <div className="w-20 h-20 rounded-[2.5rem] bg-blue-500/5 flex items-center justify-center mx-auto mb-8 border border-blue-500/10 shadow-xl relative overflow-hidden group">
                              <ShieldCheck className="w-10 h-10 text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent pointer-events-none" />
                           </div>
                           <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter italic">Reset Password</h1>
                           <p className="text-white/30 text-[10px] sm:text-xs font-black uppercase tracking-[4px] text-center leading-relaxed italic px-4">
                              We&apos;ll send a 6-digit recovery code <br />to your registered email box.
                           </p>
                        </div>

                        {error && <div className="p-5 rounded-3xl bg-red-500/5 border border-red-500/10 text-red-400 text-[11px] mb-10 text-center font-black uppercase tracking-widest leading-relaxed">{error}</div>}

                        <form onSubmit={handleRequestCode} className="space-y-10">
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-white/20 uppercase tracking-[4px] ml-4 italic">Registered Email</label>
                              <div className="group bg-white/[0.02] flex items-center px-8 py-5 rounded-[2.5rem] border border-white/5 focus-within:border-blue-500/30 focus-within:bg-white/[0.04] transition-all duration-500">
                                 <Mail className="w-5 h-5 text-white/10 mr-4 group-focus-within:text-blue-400 transition-colors" />
                                 <input
                                    required type="email" placeholder="example@taskplay.ng"
                                    className="bg-transparent border-none outline-none text-white text-base w-full placeholder-white/10 font-medium"
                                    onChange={(e) => setEmail(e.target.value)}
                                 />
                              </div>
                           </div>

                           <button
                              disabled={loading || !email}
                              type="submit"
                              className="w-full py-6 rounded-[2.5rem] bg-white text-black font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)] disabled:opacity-50"
                           >
                              {loading ? <Loader className="w-6 h-6 animate-spin" /> : <>Send Recovery Code <ArrowRight className="w-6 h-6" /></>}
                           </button>
                        </form>
                     </motion.div>
                  )}

                  {step === 2 && (
                     <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        <div className="text-center mb-16">
                           <h1 className="text-4xl lg:text-5xl font-black text-white mb-4 tracking-tighter text-center italic">Verify Recovery.</h1>
                           <p className="text-white/30 text-[10px] font-black uppercase tracking-[4px] text-center italic break-all px-4">
                              Verification code sent to {email}
                           </p>
                        </div>

                        {error && <div className="p-5 rounded-3xl bg-red-500/5 border border-red-500/10 text-red-400 text-[11px] mb-10 text-center font-black uppercase tracking-widest leading-relaxed">{error}</div>}

                        <form onSubmit={handleResetPassword} className="space-y-10">
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-[6px] ml-1 flex justify-center text-blue-400 italic">6-Digit Code</label>
                              <div className="group bg-blue-500/[0.02] flex items-center px-8 py-6 rounded-[2.5rem] border border-blue-500/10 focus-within:border-blue-500 focus-within:bg-blue-500/5 transition-all duration-500 shadow-[inset_0_0_30px_rgba(59,130,246,0.03)]">
                                 <KeyRound className="w-6 h-6 text-blue-400/40 mr-5 group-focus-within:text-blue-400 transition-colors" />
                                 <input
                                    required type="text" maxLength={6} placeholder="000000"
                                    className="bg-transparent border-none outline-none text-blue-400 text-3xl font-black tracking-[12px] w-full placeholder-blue-500/10 text-center font-mono"
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} 
                                 />
                              </div>
                           </div>

                           <div className="space-y-4 pt-4">
                              <label className="text-[10px] font-black text-white/20 uppercase tracking-[4px] ml-4 italic">Set New Password</label>
                              <div className="group bg-white/[0.02] flex items-center px-8 py-5 rounded-[2.5rem] border border-white/5 focus-within:border-blue-500/30 focus-within:bg-white/[0.04] transition-all duration-500 relative">
                                 <Lock className="w-5 h-5 text-white/10 mr-4 group-focus-within:text-blue-400 transition-colors" />
                                 <input
                                    required type={showPassword ? 'text' : 'password'} placeholder="••••••••" minLength={6}
                                    className="bg-transparent border-none outline-none text-white text-base w-full placeholder-white/10 pr-12 font-medium"
                                    onChange={(e) => setNewPassword(e.target.value)}
                                 />
                                 <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-8 text-white/10 hover:text-white transition-colors"
                                 >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                 </button>
                              </div>
                           </div>

                           <button
                              disabled={loading || code.length !== 6 || newPassword.length < 6}
                              type="submit"
                              className="w-full py-6 rounded-[2.5rem] bg-white text-black font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)] disabled:opacity-50 mt-6"
                           >
                              {loading ? <Loader className="w-6 h-6 animate-spin" /> : <>Finalize Recovery <ArrowRight className="w-6 h-6" /></>}
                           </button>
                        </form>
                     </motion.div>
                  )}

                  {step === 3 && (
                     <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                        <div className="w-28 h-28 rounded-[3rem] bg-green-500/5 flex items-center justify-center mx-auto mb-10 border border-green-500/10 shadow-[0_30px_60px_rgba(34,197,94,0.1)] relative overflow-hidden">
                           <CheckCircle2 className="w-14 h-14 text-green-400 relative z-10" />
                           <motion.div 
                              animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
                              transition={{ duration: 4, repeat: Infinity }}
                              className="absolute inset-0 bg-green-500/20 blur-2xl" 
                           />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter italic">Access Restored</h2>
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-[5px] leading-relaxed mb-16 italic px-8">
                           Your password was successfully updated. <br />You can now return to the app.
                        </p>
                        <Link href="/login" className="w-full py-6 rounded-[2.5rem] bg-white text-black font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
                           Go to Login <ArrowRight className="w-6 h-6" />
                        </Link>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
         </motion.div>
      </div>
   );
}
