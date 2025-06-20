// page.tsx
// This file is responsible for the /games route (the main game listing page)

import React from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link'; // Keep Link if you use it for navigation within the page

// Assuming you have these types and components
import type { Game } from '@/lib/types'; // Ensure this path is correct
import GameCardClient from './GameCardClient'; // Assuming this is your game card component

// Firebase Admin SDK imports needed for Firestore interaction
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
// Import the centralized adminApp instance
import { adminApp } from '@/lib/firebaseAdmin';


async function getAllGames(): Promise<Game[]> {
  if (!adminApp) {
    console.error("[GamesPage getAllGames] Firebase Admin App is not initialized.");
    return [];
  }
  const db = getFirestore(adminApp);
  const gamesCollection = db.collection('games');
  // Example: Fetch active games, ordered by creation date
  const gamesQuery = gamesCollection.where('status', '==', 'active').orderBy('createdAt', 'desc');

  const snapshot = await gamesQuery.get();
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: (data?.createdAt as Timestamp)?.toDate() || new Date(),
    } as Game;
  });
}

// This is now an async Server Component
export default async function GamesPage() {
  // --- Supabase Authentication Check ---
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // If no session, redirect to the authentication page
    // This redirect will be handled by the middleware if you have one,
    // but it's good for defense in depth or if middleware isn't covering this exact path.
    redirect('/auth');
  }
  // --- End Supabase Authentication Check ---

  // If authenticated, proceed to fetch data
  const games = await getAllGames(); // Fetch all games

  return (
    <div className="p-4 sm:p-6 pt-8"> {/* Add padding, similar to homepage */}
      <h1 className="text-2xl font-bold text-foreground mb-6">All Games</h1> {/* Use themed text color */}
      {games.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <GameCardClient key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-6">No games available at the moment.</p>
      )}
    </div>
  );
}
