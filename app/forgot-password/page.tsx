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
            <div className="bg-[#0A0D14] p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
               <Link href="/login" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-xs font-bold">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
               </Link>

               <AnimatePresence mode="wait">
                  {step === 1 && (
                     <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        <div className="text-center mb-10">
                           <Logo size="md" className="justify-center mb-6" />
                           <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Reset Password</h1>
                           <p className="text-white text-sm font-medium">
                              We'll send a 6-digit recovery code to your registered email box.
                           </p>
                        </div>

                        {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-6 text-center font-bold">{error}</div>}

                        <form onSubmit={handleRequestCode} className="space-y-6">
                           <div className="space-y-1.5">
                              <label className="text-xs font-bold text-white ml-1">Registered Email</label>
                              <div className="group bg-[#141820] flex items-center px-4 py-3 rounded-xl border border-white/5 focus-within:border-blue-500/50 transition-all shadow-sm">
                                 <Mail className="w-5 h-5 text-white/40 mr-3 group-focus-within:text-blue-400 transition-colors" />
                                 <input
                                    required type="email" placeholder="example@gmail.com"
                                    className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-white/20 font-medium"
                                    onChange={(e) => setEmail(e.target.value)}
                                 />
                              </div>
                           </div>

                           <button
                              disabled={loading || !email}
                              type="submit"
                              className="w-full py-3.5 mt-2 rounded-xl bg-white text-black font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg disabled:opacity-50"
                           >
                              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <>Send Recovery Code <ArrowRight className="w-4 h-4" /></>}
                           </button>
                        </form>
                     </motion.div>
                  )}

                  {step === 2 && (
                     <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        <div className="text-center mb-10">
                           <h1 className="text-3xl font-black text-white mb-2 tracking-tight text-center">Verify Recovery</h1>
                           <p className="text-white text-sm font-medium text-center break-all">
                              Verification code sent to {email}
                           </p>
                        </div>

                        {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-6 text-center font-bold">{error}</div>}

                        <form onSubmit={handleResetPassword} className="space-y-6">
                           <div className="space-y-1.5">
                              <label className="text-xs font-bold text-blue-400 ml-1">6-Digit Code</label>
                              <div className="group bg-blue-500/5 flex items-center px-4 py-3.5 rounded-xl border border-blue-500/20 focus-within:border-blue-500/60 transition-all shadow-sm">
                                 <KeyRound className="w-5 h-5 text-blue-400/60 mr-4 group-focus-within:text-blue-400 transition-colors" />
                                 <input
                                    required type="text" maxLength={6} placeholder="000000"
                                    className="bg-transparent border-none outline-none text-blue-400 text-2xl font-black tracking-[8px] w-full placeholder-blue-500/20 text-center font-mono"
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} 
                                 />
                              </div>
                           </div>

                           <div className="space-y-1.5 pt-2">
                              <label className="text-xs font-bold text-white ml-1">Set New Password</label>
                              <div className="group bg-[#141820] flex items-center px-4 py-3 rounded-xl border border-white/5 focus-within:border-blue-500/50 transition-all relative shadow-sm">
                                 <Lock className="w-5 h-5 text-white/40 mr-3 group-focus-within:text-blue-400 transition-colors" />
                                 <input
                                    required type={showPassword ? 'text' : 'password'} placeholder="••••••••" minLength={6}
                                    className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-white/20 pr-10 font-medium"
                                    onChange={(e) => setNewPassword(e.target.value)}
                                 />
                                 <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 text-white/40 hover:text-white transition-colors"
                                 >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                 </button>
                              </div>
                           </div>

                           <button
                              disabled={loading || code.length !== 6 || newPassword.length < 6}
                              type="submit"
                              className="w-full py-3.5 mt-4 rounded-xl bg-white text-black font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg disabled:opacity-50"
                           >
                              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <>Finalize Recovery <ArrowRight className="w-4 h-4" /></>}
                           </button>
                        </form>
                     </motion.div>
                  )}

                  {step === 3 && (
                     <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                        <div className="w-20 h-20 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6 border border-green-500/20 relative overflow-hidden">
                           <CheckCircle2 className="w-10 h-10 text-green-400 relative z-10" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Access Restored</h2>
                        <p className="text-white text-sm font-medium leading-relaxed mb-10">
                           Your password was successfully updated. You can now return to the app.
                        </p>
                        <Link href="/login" className="w-full py-3.5 rounded-xl bg-white text-black font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg">
                           Go to Login <ArrowRight className="w-4 h-4" />
                        </Link>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
         </motion.div>
      </div>
   );
}
