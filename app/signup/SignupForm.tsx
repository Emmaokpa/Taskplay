"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader, Eye, EyeOff, Gift } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { auth, db } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/app/components/Logo';



export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [referralInput, setReferralInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setReferralInput(ref);
  }, [searchParams]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullName });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: fullName,
        balance: 0,
        role: 'user',
        isMember: false,
        isVerified: true, 
        referralCode: user.uid.slice(0, 8),
        referredBy: referralInput.trim() || null,
        totalReferrals: 0,
        earnedFromReferrals: 0,
        createdAt: serverTimestamp(),
      });

      await fetch('/api/email', {
         method: 'POST',
         body: JSON.stringify({ email, type: 'welcome' }),
      }).catch(console.error);

      if (typeof window !== 'undefined' && (window as any).fbq) {
         (window as any).fbq('track', 'CompleteRegistration');
      }

      router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
          referredBy: referralInput.trim() || null,
          totalReferrals: 0,
          earnedFromReferrals: 0,
          createdAt: serverTimestamp(),
        });

        await fetch('/api/email', {
           method: 'POST',
           body: JSON.stringify({ email: user.email, type: 'welcome' }),
        }).catch(console.error);
      }
      router.push('/dashboard');
    } catch (err: any) {
      const ignoredErrors = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'];
      if (!ignoredErrors.includes(err.code)) {
        setError(err.message || 'Google signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-24 px-6 overflow-hidden z-20">
      
      {/* Floating Asset Decor */}
      <motion.div 
        animate={{ y: [0, 15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-24 left-24 w-24 h-24 opacity-10 hidden xl:block"
      >
        <Image src="/coin.png" alt="Coin" width={100} height={100} className="w-full h-full object-contain" />
      </motion.div>

      <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className="w-full max-w-xl relative z-10"
      >
        <div className="glass p-10 md:p-20 rounded-[4rem] border-white/5 bg-white/[0.01] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] backdrop-blur-3xl">
          <div className="text-center mb-16">
             <Logo size="md" className="justify-center mb-10" />
             <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter italic">Create Account.</h1>
             <p className="text-white/30 text-[10px] font-black uppercase tracking-[5px]">Join 15,000+ Active Earners</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-3xl bg-red-500/5 border border-red-500/10 text-red-400 text-[11px] mb-10 text-center font-black uppercase tracking-widest"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSignup} className="space-y-8">
             <div className="space-y-4">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[4px] ml-4 italic">Full Name</label>
                <div className="group bg-white/[0.02] flex items-center px-8 py-5 rounded-[2.5rem] border border-white/5 focus-within:border-blue-500/30 focus-within:bg-white/[0.04] transition-all duration-500">
                   <User className="w-5 h-5 text-white/10 mr-4 group-focus-within:text-blue-400 transition-colors" />
                   <input 
                      required type="text" placeholder="John Doe" 
                      className="bg-transparent border-none outline-none text-white text-base w-full placeholder-white/10 font-medium"
                      onChange={(e) => setFullName(e.target.value)}
                   />
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[4px] ml-4 italic">Email Address</label>
                <div className="group bg-white/[0.02] flex items-center px-8 py-5 rounded-[2.5rem] border border-white/5 focus-within:border-blue-500/30 focus-within:bg-white/[0.04] transition-all duration-500">
                   <Mail className="w-5 h-5 text-white/10 mr-4 group-focus-within:text-blue-400 transition-colors" />
                   <input 
                      required type="email" placeholder="email@example.com" 
                      className="bg-transparent border-none outline-none text-white text-base w-full placeholder-white/10 font-medium"
                      onChange={(e) => setEmail(e.target.value)}
                   />
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[4px] ml-4 italic">Password</label>
                <div className="group bg-white/[0.02] flex items-center px-8 py-5 rounded-[2.5rem] border border-white/5 focus-within:border-blue-500/30 focus-within:bg-white/[0.04] transition-all duration-500 relative">
                   <Lock className="w-5 h-5 text-white/10 mr-4 group-focus-within:text-blue-400 transition-colors" />
                   <input 
                      required type={showPassword ? 'text' : 'password'} placeholder="••••••••" 
                      className="bg-transparent border-none outline-none text-white text-base w-full placeholder-white/10 pr-12 font-medium"
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

             <div className="space-y-4">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[4px] ml-4 italic">Gift Code (Optional)</label>
                <div className="group bg-white/[0.02] flex items-center px-8 py-5 rounded-[2.5rem] border border-white/5 focus-within:border-amber-500/30 focus-within:bg-white/[0.04] transition-all duration-500">
                   <Gift className="w-5 h-5 text-white/10 mr-4 group-focus-within:text-amber-400 transition-colors" />
                   <input 
                      type="text" placeholder="REFERRAL CODE" 
                      className="bg-transparent border-none outline-none text-white text-base w-full placeholder-white/10 uppercase font-black"
                      value={referralInput}
                      onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                   />
                </div>
             </div>

             <button 
                disabled={loading}
                type="submit" 
                className="w-full py-6 rounded-[2.5rem] bg-white text-black font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)] mt-4"
             >
                {loading ? <Loader className="w-6 h-6 animate-spin" /> : <>Start Earning <ArrowRight className="w-6 h-6" /></>}
             </button>
          </form>

          <div className="mt-16">
             <div className="flex items-center gap-6 mb-12">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[8px] font-black text-white/10 uppercase tracking-[6px] leading-none">Social Signon</span>
                <div className="h-px flex-1 bg-white/5" />
             </div>

             <button
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full py-6 rounded-[2.5rem] bg-white/[0.01] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] flex items-center justify-center gap-4 transition-all active:scale-[0.98] group"
             >
                <svg className="w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                   <path fill="#EA4335" d="M12 5.04c1.9 0 3.51.64 4.86 1.91l3.6-3.6C18.17 1.19 15.34.62 12.33.62 7.64.62 3.65 3.3 1.63 7.21l4.23 3.28C6.88 7.33 9.22 5.04 12 5.04z" />
                   <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.3h6.44c-.28 1.48-1.11 2.74-2.37 3.58l3.7 2.88c2.16-1.99 3.42-4.92 3.42-8.49z" />
                   <path fill="#34A853" d="M12 23.38c3.24 0 5.95-1.07 7.94-2.91l-3.7-2.88c-1.03.69-2.34 1.1-3.7 1.1-3.18 0-5.87-2.15-6.83-5.04L1.48 16.93c1.99 3.91 5.96 6.45 10.52 6.45z" />
                   <path fill="#FBBC05" d="M5.17 13.65c-.24-.73-.38-1.51-.38-2.32s.14-1.59.38-2.32L1.48 7.21C.54 9.06 0 11.13 0 12.33s.54 3.27 1.48 5.12l4.23-3.28c-.24-.73-.38-1.51-.38-2.32z" />
                </svg>
                <span className="text-sm font-black text-white/30 group-hover:text-white/80 tracking-widest uppercase">Continue with Google</span>
             </button>
          </div>

          <p className="mt-16 text-center text-white/20 text-xs font-black uppercase tracking-[3px] italic">
             Already earning? <Link href="/login" className="text-blue-500 hover:text-white transition-colors underline decoration-blue-500/20 underline-offset-8">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
