"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Logo from '@/app/components/Logo';



export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          fullName: user.displayName,
          photoUrl: user.photoURL,
          balance: 0,
          role: 'user',
          isMember: false,
          referralCode: user.uid.slice(0, 8),
          totalReferrals: 0,
          earnedFromReferrals: 0,
          createdAt: serverTimestamp(),
        });
      }
      router.push('/dashboard');
    } catch (err: any) {
      const ignoredErrors = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'];
      if (!ignoredErrors.includes(err.code)) {
        setError(err.message || 'Google login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-20 px-6 overflow-hidden z-10">
      
      {/* 🔮 Background Glow Decor */}
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full -translate-x-1/2 pointer-events-none" />

      <div className="w-full max-w-6xl flex flex-col lg:flex-row-reverse items-center justify-between gap-20 relative z-20">
        
        {/* 🚀 Hero Character - RIGHT SIDE (DESKTOP) */}
        <motion.div 
          className="hidden lg:flex flex-1 flex-col items-end text-right"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="mb-10 relative"
          >
             <div className="absolute inset-0 bg-purple-500/10 blur-[60px] rounded-full" />
             <Image 
                src="/images/hero-character.png" 
                alt="Account Hero" 
                width={450} 
                height={450} 
                className="relative z-10 w-full max-w-sm object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] -scale-x-100" 
             />
          </motion.div>
          <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase mb-4 leading-none">
            Secure <span className="text-purple-400">Access.</span>
          </h2>
          <p className="text-white/30 text-sm font-bold tracking-[4px] uppercase max-w-xs">Return to your rewards pipeline.</p>
        </motion.div>

        {/* 🧱 Claymorphism Card */}
        <motion.div 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           className="w-full max-w-lg relative"
        >
          <div className="relative group">
            {/* Top Light Highlight */}
            <div className="absolute inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="bg-[#05070A]/30 backdrop-blur-3xl p-10 md:p-16 rounded-[4rem] border border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7),inset_0_1px_5px_rgba(255,255,255,0.05)] relative overflow-hidden">
                <div className="text-center mb-16">
                    <Logo size="md" className="justify-center mb-10" />
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter italic leading-none">Welcome Back.</h1>
                    <p className="text-white/20 text-[9px] font-black uppercase tracking-[5px]">The Rewards Pipeline is Active</p>
                </div>

                {error && (
                    <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="p-5 rounded-3xl bg-red-500/5 border border-red-500/10 text-red-400 text-[10px] mb-10 text-center font-black uppercase tracking-widest"
                    >
                    {error}
                    </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-white/10 uppercase tracking-[4px] ml-4 italic">Security Email</label>
                        <div className="group bg-white/[0.01] flex items-center px-8 py-5 rounded-[2rem] border border-white/5 focus-within:border-blue-500/40 focus-within:bg-blue-500/[0.01] transition-all duration-500 shadow-inner">
                            <Mail className="w-5 h-5 text-white/10 mr-4 group-focus-within:text-blue-400" />
                            <input 
                                required type="email" placeholder="example@taskplay.ng" 
                                className="bg-transparent border-none outline-none text-white text-base w-full placeholder-white/5 font-medium"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-3 text-left">
                        <div className="flex justify-between items-center ml-4">
                            <label className="text-[9px] font-black text-white/10 uppercase tracking-[4px] italic">Access Key</label>
                            <Link href="/forgot-password" title="Forgot Password" className="text-[8px] text-white/10 hover:text-blue-400 transition-colors uppercase tracking-[2px] font-black">Forgot Key?</Link>
                        </div>
                        <div className="group bg-white/[0.01] flex items-center px-8 py-5 rounded-[2rem] border border-white/5 focus-within:border-blue-500/40 focus-within:bg-blue-500/[0.01] transition-all duration-500 relative shadow-inner">
                            <Lock className="w-5 h-5 text-white/10 mr-4 group-focus-within:text-blue-400" />
                            <input 
                                required type={showPassword ? 'text' : 'password'} placeholder="••••••••" 
                                className="bg-transparent border-none outline-none text-white text-base w-full placeholder-white/5 pr-12 font-medium"
                                onChange={(e) => setPassword(e.target.value)}
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
                        disabled={loading}
                        type="submit" 
                        className="w-full py-6 rounded-[2rem] bg-white text-black font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_20px_40px_-5px_rgba(255,255,255,0.1)] hover:shadow-[0_30px_60px_-10px_rgba(255,255,255,0.2)]"
                    >
                        {loading ? <Loader className="w-6 h-6 animate-spin" /> : <>Access Account <ArrowRight className="w-6 h-6" /></>}
                    </button>
                </form>

                <div className="mt-16">
                    <div className="flex items-center gap-6 mb-12 opacity-20">
                        <div className="h-px flex-1 bg-white" />
                        <span className="text-[7px] font-black text-white uppercase tracking-[5px]">Secure Social Login</span>
                        <div className="h-px flex-1 bg-white" />
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full py-6 rounded-[2rem] bg-white/[0.01] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] flex items-center justify-center gap-4 transition-all active:scale-[0.98] group"
                    >
                        <svg className="w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                            <path fill="#EA4335" d="M12 5.04c1.9 0 3.51.64 4.86 1.91l3.6-3.6C18.17 1.19 15.34.62 12.33.62 7.64.62 3.65 3.3 1.63 7.21l4.23 3.28C6.88 7.33 9.22 5.04 12 5.04z" />
                            <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.3h6.44c-.28 1.48-1.11 2.74-2.37 3.58l3.7 2.88c2.16-1.99 3.42-4.92 3.42-8.49z" />
                            <path fill="#34A853" d="M12 23.38c3.24 0 5.95-1.07 7.94-2.91l-3.7-2.88c-1.03.69-2.34 1.1-3.7 1.1-3.18 0-5.87-2.15-6.83-5.04L1.48 16.93c1.99 3.91 5.96 6.45 10.52 6.45z" />
                            <path fill="#FBBC05" d="M5.17 13.65c-.24-.73-.38-1.51-.38-2.32s.14-1.59.38-2.32L1.48 7.21C.54 9.06 0 11.13 0 12.33s.54 3.27 1.48 5.12l4.23-3.28c-.24-.73-.38-1.51-.38-2.32z" />
                        </svg>
                        <span className="text-xs font-black text-white/30 group-hover:text-white/80 tracking-widest uppercase">Sign in with Google</span>
                    </button>
                </div>

                <p className="mt-16 text-center text-white/20 text-[10px] font-black uppercase tracking-[3px] italic">
                    New with us? <Link href="/signup" className="text-blue-500 hover:text-white transition-colors underline decoration-blue-500/20 underline-offset-8">Join Pipeline</Link>
                </p>
            </div>
            {/* Glow beneath the card */}
            <div className="absolute -z-10 inset-10 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
