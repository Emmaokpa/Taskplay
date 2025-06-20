// page.tsx
"use client";

import Auth from '@/components/Auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/'); // Redirect to homepage if already logged in
      }
    };

    // Check session on initial load
    checkSessionAndRedirect();

    // Listen for auth state changes
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        router.push('/'); // Redirect to homepage after successful sign-in
      }
      // You could also handle 'SIGNED_OUT' here if needed,
      // though the sign-out route handler already redirects.
    });

    // Clean up the listener when the component unmounts
    return () => {
      authListener?.unsubscribe();
    };
  }, [router, supabase]); // Added supabase to dependency array

  return (
    // Use shadcn/ui theme variables for background
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background"> {/* Adjusted px-4 for base padding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg"> {/* Changed sm:max-w-md to sm:max-w-lg */}
        {/* You can add a logo here if you have one */}
        {/* <img className="mx-auto h-12 w-auto" src="/path-to-your-logo.svg" alt="TaskPlay" /> */}
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          Sign in to your account
        </h2>
      </div>
      <div className="mt-8 w-full sm:mx-auto sm:max-w-lg"> {/* Changed sm:max-w-md to sm:max-w-lg, added w-full for base */}
        {/* Use shadcn/ui theme variables for card background and text */}
        {/* Added border and slightly increased padding for a more defined look */}
        <div className="bg-card text-card-foreground p-6 sm:p-10 shadow-xl rounded-xl border border-border/50">
          <Auth />
        </div>
      </div>
    </div>
  );
}
