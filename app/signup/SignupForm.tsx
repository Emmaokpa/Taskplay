"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader, Eye, EyeOff, Gift } from 'lucide-react';
import Link from 'next/link';
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
        referralCode: user.uid.slice(0, 8),
        referredBy: referralInput.trim() || null,
        totalReferrals: 0,
        earnedFromReferrals: 0,
        createdAt: serverTimestamp(),
      });

      await fetch('/api/email', {
         method: 'POST',
         body: JSON.stringify({ email, type: 'verification' }),
      });

      router.push('/verify?email=' + encodeURIComponent(email));
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

        // Send Welcome Email upon proper first-time Google Signup
        await fetch('/api/email', {
           method: 'POST',
           body: JSON.stringify({ email: user.email, type: 'welcome' }),
        }).catch(console.error);
      }
      router.push('/dashboard');
    } catch (err: any) {
      // Silently ignore if user simply closed or dismissed the popup
      const ignoredErrors = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'];
      if (!ignoredErrors.includes(err.code)) {
        setError(err.message || 'Google signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] -ml-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/10 blur-[120px] -mr-48 -mb-48 pointer-events-none" />
      
      <motion.div 
         initial={{ opacity: 0, scale: 0.98, y: 10 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         transition={{ duration: 0.5, ease: "easeOut" }}
         className="clay-card p-10 md:p-16 w-full max-w-lg bg-[#0A0F1E]/60 backdrop-blur-3xl border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]"
      >
        <div className="text-center mb-12">
           <Logo size="xl" className="justify-center mb-8" />
           <h1 className="text-4xl font-black text-white mb-3 tracking-tighter">Create Account</h1>
           <p className="text-white/30 text-[10px] font-black uppercase tracking-[5px]">Join the rewards pipeline</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-8 text-center font-bold tracking-tight"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
           <div className="space-y-2.5">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[3px] ml-1">Identity Name</label>
              <div className="bg-white/[0.03] flex items-center px-5 py-4 rounded-[1.5rem] border border-white/5 focus-within:border-primary/40 focus-within:bg-white/[0.05] transition-all duration-300">
                 <User className="w-5 h-5 text-white/20 mr-4" />
                 <input 
                    required type="text" placeholder="John Doe" 
                    className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-white/10 font-medium"
                    onChange={(e) => setFullName(e.target.value)}
                 />
              </div>
           </div>

           <div className="space-y-2.5">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[3px] ml-1">Secure Email</label>
              <div className="bg-white/[0.03] flex items-center px-5 py-4 rounded-[1.5rem] border border-white/5 focus-within:border-primary/40 focus-within:bg-white/[0.05] transition-all duration-300">
                 <Mail className="w-5 h-5 text-white/20 mr-4" />
                 <input 
                    required type="email" placeholder="email@example.com" 
                    className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-white/10 font-medium"
                    onChange={(e) => setEmail(e.target.value)}
                 />
              </div>
           </div>

           <div className="space-y-2.5">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[3px] ml-1">Access Password</label>
              <div className="bg-white/[0.03] flex items-center px-5 py-4 rounded-[1.5rem] border border-white/5 focus-within:border-primary/40 focus-within:bg-white/[0.05] transition-all duration-300 relative">
                 <Lock className="w-5 h-5 text-white/20 mr-4" />
                 <input 
                    required type={showPassword ? 'text' : 'password'} placeholder="••••••••" 
                    className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-white/10 pr-12 font-medium"
                    onChange={(e) => setPassword(e.target.value)}
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

           <div className="space-y-2.5">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[3px] ml-1">Referral Node (Optional)</label>
              <div className="bg-white/[0.03] flex items-center px-5 py-4 rounded-[1.5rem] border border-white/5 focus-within:border-accent/40 focus-within:bg-white/[0.05] transition-all duration-300">
                 <Gift className="w-5 h-5 text-white/20 mr-4" />
                 <input 
                    type="text" placeholder="GIFT CODE" 
                    className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-white/10 uppercase font-black"
                    value={referralInput}
                    onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                 />
              </div>
           </div>

           <button 
              disabled={loading}
              type="submit" 
              className="clay-button w-full py-5 rounded-[1.5rem] font-black text-xl text-white flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl shadow-primary/30 uppercase tracking-tighter italic mt-4"
           >
              {loading ? <Loader className="w-6 h-6 animate-spin" /> : <>Initialize Account <ArrowRight className="w-6 h-6" /></>}
           </button>
        </form>

        <div className="mt-12">
           <div className="flex items-center gap-6 mb-10">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[9px] font-black text-white/20 uppercase tracking-[4px] leading-none">Social Signon</span>
              <div className="h-px flex-1 bg-white/5" />
           </div>

           <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full py-5 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] flex items-center justify-center gap-4 transition-all active:scale-[0.98] group"
           >
              <svg className="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                 <path fill="#EA4335" d="M12 5.04c1.9 0 3.51.64 4.86 1.91l3.6-3.6C18.17 1.19 15.34.62 12.33.62 7.64.62 3.65 3.3 1.63 7.21l4.23 3.28C6.88 7.33 9.22 5.04 12 5.04z" />
                 <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.3h6.44c-.28 1.48-1.11 2.74-2.37 3.58l3.7 2.88c2.16-1.99 3.42-4.92 3.42-8.49z" />
                 <path fill="#34A853" d="M12 23.38c3.24 0 5.95-1.07 7.94-2.91l-3.7-2.88c-1.03.69-2.34 1.1-3.7 1.1-3.18 0-5.87-2.15-6.83-5.04L1.48 16.93c1.99 3.91 5.96 6.45 10.52 6.45z" />
                 <path fill="#FBBC05" d="M5.17 13.65c-.24-.73-.38-1.51-.38-2.32s.14-1.59.38-2.32L1.48 7.21C.54 9.06 0 11.13 0 12.33s.54 3.27 1.48 5.12l4.23-3.28c-.24-.73-.38-1.51-.38-2.32z" />
              </svg>
              <span className="text-sm font-black text-white/60 group-hover:text-white tracking-widest uppercase">Google Security</span>
           </button>
        </div>

        <p className="mt-12 text-center text-white/30 text-xs font-bold uppercase tracking-widest">
           Already earning? <Link href="/login" className="text-primary hover:text-purple-400 transition-colors">Sign In</Link>
        </p>
      </motion.div>
    </div>

  );
}
