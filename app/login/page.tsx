"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
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

      // Check if user exists in Firestore
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
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[30%] bg-accent/20 blur-[100px] -z-10" />
      
      <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className="clay-card p-10 md:p-14 w-full max-w-md border-white/5"
      >
        <div className="text-center mb-10">
           <Logo size="xl" className="justify-center mb-6" />
           <h1 className="text-3xl font-black text-white mb-2">Welcome Back</h1>
           <p className="text-white/40 text-sm font-bold tracking-widest uppercase">Earn again today</p>
        </div>

        {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6 text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
           <div className="space-y-2">
              <label className="text-xs font-black text-white/40 uppercase tracking-[2px] ml-1">Email Address</label>
              <div className="glass flex items-center px-4 py-3.5 rounded-2xl border-white/10 focus-within:border-primary transition-all">
                 <Mail className="w-5 h-5 text-white/30 mr-3" />
                 <input 
                    required type="email" placeholder="email@example.com" 
                    className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-white/10"
                    onChange={(e) => setEmail(e.target.value)}
                 />
              </div>
           </div>

            <div className="space-y-2">
               <label className="text-xs font-black text-white/40 uppercase tracking-[2px] ml-1 flex justify-between">
                  <span>Password</span>
                  <Link href="/forgot-password" title="Forgot Password" className="text-primary hover:underline lowercase tracking-normal">Forgot?</Link>
               </label>
               <div className="glass flex items-center px-4 py-3.5 rounded-2xl border-white/10 focus-within:border-primary transition-all relative">
                  <Lock className="w-5 h-5 text-white/30 mr-3" />
                  <input 
                     required type={showPassword ? 'text' : 'password'} placeholder="••••••••" 
                     className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-white/10 pr-10"
                     onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-white/20 hover:text-white transition-colors"
                  >
                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
               </div>
            </div>

           <button 
              disabled={loading}
              type="submit" 
              className="clay-button w-full py-4 rounded-2xl font-black text-xl text-white flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
           >
              {loading ? <Loader className="w-6 h-6 animate-spin" /> : <>Login Now <ArrowRight className="w-6 h-6" /></>}
           </button>
        </form>

        {/* Google Social Signin */}
        <div className="mt-8">
           <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none">Or sign with</span>
              <div className="h-px flex-1 bg-white/5" />
           </div>

           <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-4 rounded-2xl glass border-white/5 hover:border-white/10 flex items-center justify-center gap-4 transition-all active:scale-[0.98]"
           >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                 <path fill="#EA4335" d="M12 5.04c1.9 0 3.51.64 4.86 1.91l3.6-3.6C18.17 1.19 15.34.62 12.33.62 7.64.62 3.65 3.3 1.63 7.21l4.23 3.28C6.88 7.33 9.22 5.04 12 5.04z" />
                 <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.3h6.44c-.28 1.48-1.11 2.74-2.37 3.58l3.7 2.88c2.16-1.99 3.42-4.92 3.42-8.49z" />
                 <path fill="#34A853" d="M12 23.38c3.24 0 5.95-1.07 7.94-2.91l-3.7-2.88c-1.03.69-2.34 1.1-3.7 1.1-3.18 0-5.87-2.15-6.83-5.04L1.48 16.93c1.99 3.91 5.96 6.45 10.52 6.45z" />
                 <path fill="#FBBC05" d="M5.17 13.65c-.24-.73-.38-1.51-.38-2.32s.14-1.59.38-2.32L1.48 7.21C.54 9.06 0 11.13 0 12.33s.54 3.27 1.48 5.12l4.23-3.28c-.24-.73-.38-1.51-.38-2.32z" />
              </svg>
              <span className="text-sm font-bold text-white tracking-tight leading-none">Google Security</span>
           </button>
        </div>

        <p className="mt-10 text-center text-white/40 text-sm font-bold">
           New earner? <Link href="/signup" className="text-primary hover:underline">Get Started</Link>
        </p>
      </motion.div>
    </div>
  );
}
