// app/link-telegram/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClientComponentClient, Session } from '@supabase/auth-helpers-nextjs';
// Import your app's custom Auth component
import AppAuthComponent from '@/components/Auth'; // Using an alias for clarity

export default function LinkTelegramPage() {
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();
  const telegramIdParam = searchParams.get('tid'); // Assuming your bot sends ?tid=<telegram_id>
  const [telegramId, setTelegramId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (telegramIdParam) {
      const id = parseInt(telegramIdParam, 10);
      if (!isNaN(id)) {
        setTelegramId(id);
      } else {
        setMessage('Error: Invalid Telegram ID in link.');
      }
    } else {
      setMessage('Error: Telegram ID missing from link.');
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, sessionState) => {
      setSession(sessionState);
      if (sessionState && telegramId) { // User is logged in AND we have a telegramId
        // Avoid duplicate calls if already processing or successful
        if (message === 'Linking your account...' || message.startsWith('Success!') || message.startsWith('Error linking account:')) {
            return;
        }

        try {
          setMessage('Linking your account...');
          const response = await fetch('/api/link-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              telegramId: telegramId,
              supabaseAuthUserId: sessionState.user.id,
            }),
          });
          const result = await response.json();
          if (response.ok) {
            setMessage('Success! Your Telegram account is now linked. You can return to Telegram.');
            // Optionally redirect or close window after a delay
            // setTimeout(() => window.close(), 5000);
          } else {
            setMessage(`Error linking account: ${result.error || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('Link account API call failed:', error);
          setMessage('An error occurred while trying to link your account.');
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [telegramIdParam, supabase, telegramId, message]); // message in dependency array to re-evaluate if needed, but guarded by conditions inside.

  // Initial loading or error states before rendering the main layout
  // This handles cases where telegramIdParam is missing or invalid before the main UI is built.
  if (!telegramId && !(message && message.startsWith('Error:'))) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <p>Loading or invalid link...</p>
      </div>
    );
  }
  // This handles "Error: Invalid Telegram ID" or "Error: Telegram ID missing" from useEffect's initial parsing.
  if (message.startsWith('Error: Invalid Telegram ID') || message.startsWith('Error: Telegram ID missing')) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <p className="text-red-600 text-center">{message}</p>
      </div>
    );
  }

  return (
    // Replicate the structure and Tailwind classes from app/auth/page.tsx
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {/* You can add a logo here if you have one, similar to auth/page.tsx if desired */}
        {/* <img className="mx-auto h-12 w-auto" src="/path-to-your-logo.svg" alt="TaskPlay" /> */}
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          Link Your Telegram Account
        </h2>
        {telegramId && ( // Only show this if telegramId is validly parsed
          <p className="mt-2 text-center text-sm text-muted-foreground">
            To connect with Telegram ID: {telegramId}
          </p>
        )}
      </div>
      <div className="mt-8 w-full sm:mx-auto sm:max-w-lg">
        <div className="bg-card text-card-foreground p-6 sm:p-10 shadow-xl rounded-xl border border-border/50">
          {(() => {
            // State 1: Final outcome messages (success or API error after attempting to link)
            if (message.startsWith('Success!') || message.startsWith('Error linking account:')) {
              return <p className={`text-center text-sm ${message.startsWith('Success!') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>;
            }
            // State 2: User is logged in (session exists) and telegramId is present; linking process is active
            // This message ("Linking your account..." or "Processing...") is shown while the API call in useEffect is pending.
            if (session && telegramId) {
              return <p className="text-center text-sm text-muted-foreground">{message || 'Processing...'}</p>;
            }
            // State 3: telegramId is present, but user is not logged in (no session) - show Auth form
            if (telegramId && !session) {
              // This assumes your `@/components/Auth` (imported as AppAuthComponent)
              // is styled as desired and handles Supabase client/logic internally.
              return <AppAuthComponent />;
            }
            // Fallback: Should ideally not be reached if telegramId is valid and other states are handled.
            // This might occur briefly if telegramId is set but session state is still resolving.
            // If telegramId is valid, and we are not in a final message state or session linking state,
            // and there's no session, it implies we should show the Auth form.
            // The condition `telegramId && !session` above should cover this.
            return null;
          })()}
        </div>
      </div>
    </div>
  );
}
