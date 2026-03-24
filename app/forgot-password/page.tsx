"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail as MailIcon, ArrowLeft as ArrowLeftIcon, Loader as LoaderIcon, Send as SendIcon } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
   const [email, setEmail] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [success, setSuccess] = useState(false);

   const handleReset = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setSuccess(false);

      try {
         const response = await fetch('/api/email', {
            method: 'POST',
            body: JSON.stringify({ email, type: 'reset-password' }),
         });
         const data = await response.json();
         if (!response.ok) throw new Error(data.error);
         setSuccess(true);
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
         setError(err.message || 'Failed to send reset email');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen flex items-center justify-center py-12 px-6">
         <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="clay-card p-10 md:p-14 w-full max-w-md border-white/5"
         >
            <Link href="/login" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-8 transition-colors text-sm font-bold">
               <ArrowLeftIcon className="w-4 h-4" /> Back to Sign In
            </Link>

            <div className="text-center mb-10">
               <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Recover Account</h1>
               <p className="text-white/40 text-sm font-bold tracking-widest uppercase">Reset your password</p>
            </div>

            {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6 text-center">{error}</div>}
            {success && <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-6 text-center">Reset link sent! Check your email.</div>}

            <form onSubmit={handleReset} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-xs font-black text-white/40 uppercase tracking-[2px] ml-1">Email Address</label>
                  <div className="glass flex items-center px-4 py-3.5 rounded-2xl border-white/10 focus-within:border-primary transition-all">
                     <MailIcon className="w-5 h-5 text-white/30 mr-3" />
                     <input
                        required type="email" placeholder="email@example.com"
                        className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-white/10"
                        onChange={(e) => setEmail(e.target.value)}
                     />
                  </div>
               </div>

               <button
                  disabled={loading}
                  type="submit"
                  className="clay-button w-full py-4 rounded-2xl font-black text-xl text-white flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
               >
                  {loading ? <LoaderIcon className="w-6 h-6 animate-spin" /> : <>Send Reset Link <SendIcon className="w-6 h-6" /></>}
               </button>
            </form>
         </motion.div>
      </div>
   );
}
