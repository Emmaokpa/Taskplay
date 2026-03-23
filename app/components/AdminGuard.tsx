"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { ShieldAlert, Loader } from 'lucide-react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'granted' | 'denied'>('loading');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().isAdmin === true) {
        setStatus('granted');
      } else {
        setStatus('denied');
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-10">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <ShieldAlert className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-3xl font-black text-white">Access Denied</h1>
        <p className="text-white/40 font-bold text-center max-w-xs">
          You do not have admin privileges to view this page.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="clay-button px-8 py-4 rounded-2xl font-black text-white"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
