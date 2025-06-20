// Auth.tsx
"use client";

import { useState, useEffect } from 'react'; // Added useEffect for potential debug logging
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from "@/components/ui/button"; // shadcn/ui Button
import GoogleIcon from "./icons/GoogleIcon"; // Import the GoogleIcon
import { Input } from "@/components/ui/input";   // shadcn/ui Input
import { Eye, EyeOff } from 'lucide-react'; // Icons for password visibility

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [message, setMessage] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  // useEffect(() => {
  //   // DEBUG: Log environment variables if needed
  //   console.log("Auth.tsx - Supabase URL from env:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  //   console.log("Auth.tsx - Supabase Anon Key from env:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  // }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage(`Sign up failed: ${error.message}`);
    } else {
      setMessage('Sign up successful! Please check your email for verification (or you may be signed in automatically with Google).');
      // setEmail(''); // Keep fields for retry on error, clear on success if page doesn't redirect
      // setPassword('');
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const trimmedEmail = email.trim(); // Trim whitespace from email

    // Log exactly what's being sent
    console.log(`[Auth.tsx] Attempting to sign in with:`);
    console.log(`[Auth.tsx] Email (raw): '${email}' (length: ${email.length})`);
    console.log(`[Auth.tsx] Email (trimmed): '${trimmedEmail}' (length: ${trimmedEmail.length})`);
    console.log(`[Auth.tsx] Password (length): ${password.length}`); // Avoid logging password directly

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail, // Use the trimmed email
      password: password
    });

    if (error) {
      console.error("[Auth.tsx] Sign-in error object:", JSON.stringify(error, null, 2));
      setMessage(`Sign in failed: ${error.message}`);
    } else {
      setMessage('Sign in successful!');
      // Redirection is handled by AuthPage.tsx's useEffect
      // setEmail(''); // Clear fields if desired, but redirection should occur
      // setPassword('');
    }
    setLoading(false);
  };

  const handleSignInWithGoogle = async () => {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) {
      setMessage(`Google sign-in failed: ${error.message}`);
    }
    // No need to clear fields or redirect here, Supabase handles redirect on success.
    setLoading(false);
  };
    
    // A simple alert-like component for messages, or use shadcn/ui Alert
    const MessageDisplay = ({ message }: { message: string | null }) => {
      if (!message) return null;
      const isError = message.toLowerCase().includes('failed') || message.toLowerCase().includes('error');
      return (
        <div className={`mb-4 p-3 rounded-md text-sm ${isError ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-700 dark:text-green-400'}`}>
          {message}
        </div>
      );
    };

  return (
    <div className="space-y-6">
      <MessageDisplay message={message} />
      <div className="space-y-4">
        <div>
          <Input 
            id="email" 
            type="email" 
            placeholder="Email address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            disabled={loading} 
          />
        </div>
        <div className="relative">
          <Input 
            id="password" 
            type={showPassword ? "text" : "password"}
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            disabled={loading}
            className="pr-10" 
          />
          <Button 
            type="button"
            variant="ghost" 
            size="icon" 
            className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword(!showPassword)} 
            disabled={loading}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-3 sm:space-y-0">
        <Button onClick={handleSignIn} disabled={loading} className="w-full sm:flex-1">
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
        <Button onClick={handleSignUp} disabled={loading} variant="outline" className="w-full sm:flex-1">
          {loading ? 'Signing Up...' : 'Sign Up'}
        </Button>
      </div>
      
      <div className="pt-3">
        <Button 
          onClick={handleSignInWithGoogle} 
          disabled={loading} 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
        >
          <GoogleIcon className="w-5 h-5" />
          <span>{loading ? 'Processing...' : 'Sign in with Google'}</span>
        </Button>
      </div>
    </div>
  );
}
