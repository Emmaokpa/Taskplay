// Header.tsx
"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClientComponentClient, Session } from '@supabase/auth-helpers-nextjs';
import HamburgerIcon from './icons/HamburgerIcon';
import CloseIcon from './icons/CloseIcon';
import MobileSidebar from './MobileSidebar';
// import { ThemeToggle } from './ThemeToggle'; // No longer needed
export default function Header() {
  const [session, setSession] = useState<Session | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setIsLoading(false);
    };

    getSession();

    // This is the corrected destructuring for the auth listener
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setIsLoading(false); // Update loading state on auth change
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setIsMobileMenuOpen(false); // Close menu on auth change
      }
    });

    return () => {
      authListener?.unsubscribe(); // This should now work correctly
    };
  }, [supabase]); // supabase is correctly in the dependency array

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Use shadcn/ui theme variables for background and text, add a border */}
      <header className="bg-background text-foreground shadow-sm sticky top-0 z-50 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button (Left on Mobile) */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMobileMenu}
                // Using themed colors for consistency, though your original orange might be a specific branding choice
                className="text-muted-foreground hover:text-primary focus:outline-none p-2 -ml-2" 
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
              </button>
            </div>

            {/* Logo / Site Title (Center on mobile, Left on Desktop) */}
            <div className="flex-1 md:flex-initial flex justify-center md:justify-start">
              {/* Ensuring dark theme compatibility for the orange accent or using text-primary */}
              <Link href="/" className="text-2xl font-bold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-500 transition-colors">
                TaskPlay
              </Link>
            </div>

            {/* Desktop Navigation & Auth Buttons (Right on Desktop) */}
            <div className="hidden md:flex items-center space-x-4">
              <nav className="flex space-x-6 items-center">
                <Link href="/games" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Games</Link>
                <Link href="/tasks" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Tasks</Link>
                {!isLoading && (
                  session ? (
                    <form action="/auth/sign-out" method="post">
                      <button
                        type="submit"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                      >
                        Logout
                      </button>
                    </form>
                  ) : (
                    <Link href="/auth" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                      Login / Sign Up
                    </Link>
                  )
                )}
                {isLoading && <div className="text-sm text-muted-foreground">...</div>}
              </nav>
              {/* ThemeToggle removed */}
            </div>

            {/* Spacer for mobile right side */}
            <div className="md:hidden" style={{ width: '2.5rem' }}> 
              {/* Intentionally empty or for future right-side mobile icons */}
            </div>

          </div>
        </div>
      </header>
      <MobileSidebar isOpen={isMobileMenuOpen} onClose={toggleMobileMenu} session={session} isLoading={isLoading} />
    </>
  );
}
