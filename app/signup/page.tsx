import React, { Suspense } from 'react';
import SignupForm from './SignupForm';

export const metadata = {
  title: "Create Account | TaskPlay Nigeria",
  description: "Join thousands earning real money by completing simple tasks online.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white/20 font-black uppercase tracking-widest">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
