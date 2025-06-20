// page.tsx
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import Link from 'next/link';
import React from 'react';
import { Game } from '@/lib/types';
import GameCardClient from './games/GameCardClient'; // Assuming this is the correct path
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { adminApp } from '@/lib/firebaseAdmin'; // Import the centralized adminApp


async function getFeaturedGames(limit: number = 4): Promise<Game[]> {
  if (!adminApp) {
    console.error('Firebase Admin App is not initialized (from getFeaturedGames).');
    return [];
  }

  const db = getFirestore(adminApp);
  const gamesCollection = db.collection('games');
  // Query for games that are active AND explicitly marked as featured
  const gamesQuery = gamesCollection
    .where('isFeatured', '==', true) // Filter by the 'isFeatured' flag
    .where('status', '==', 'active') // Also ensure they are active
    .orderBy('createdAt', 'desc').limit(limit);

  const snapshot = await gamesQuery.get();
  if (snapshot.empty) {
    return [];
  }

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    } as Game;
  });
}

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();

  const featuredGames = await getFeaturedGames(6);
  const heroGame = featuredGames.length > 0 ? featuredGames[0] : null;

  return (
    // The main content div, adjust padding as needed for your layout
    // The global Header component in layout.tsx now handles the top bar.
    // This page's content starts directly.
    <div className="p-4 sm:p-6 pt-8"> {/* Added pt-8 to give some space below the sticky header */}
      <main>
        {heroGame ? (
          <Link
            href={`/games/${heroGame.id}`}
            className="block w-full rounded-lg shadow-lg border border-gray-200 relative mb-8 overflow-hidden group"
          >
            <div
              className={`aspect-[16/7] sm:aspect-[16/5] flex items-center justify-center ${
                heroGame.imageUrl ? '' : 'bg-gray-300'
              }`}
            >
              {heroGame.imageUrl ? (
                <img
                  src={heroGame.imageUrl}
                  alt={heroGame.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="text-gray-500 text-xl">Featured Game</span>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col items-start justify-end p-4 md:p-8">
              <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold drop-shadow-lg">
                {heroGame.title}
              </h2>
              {heroGame.description && (
                <p className="text-gray-200 text-sm sm:text-base mt-2 drop-shadow-md max-w-xl truncate">
                  {heroGame.description}
                </p>
              )}
            </div>
            <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
              FEATURED
            </span>
          </Link>
        ) : (
          <div className="w-full rounded-lg shadow-md border border-gray-200 relative mb-6 bg-gray-200 aspect-[16/7] sm:aspect-[16/5] flex items-center justify-center">
            <span className="text-gray-500 text-xl">Explore Our Exciting Games & Tasks!</span>
          </div>
        )}

        <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">Featured Games</h2>
        {featuredGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {featuredGames.map(game => (
              <GameCardClient key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-6">No featured games available at the moment.</p>
        )}

        {featuredGames.length > 0 && (
          <div className="text-center mt-8 mb-4">
            <Link
              href="/games"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors"
            >
              View All Games
            </Link>
          </div>
        )}

        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Quick Actions</h2>
          <nav className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/tasks"
              className="group block w-full sm:max-w-xs text-center bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl rounded-xl px-6 py-8 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
              <h3 className="text-2xl font-bold mb-2">Explore Tasks</h3>
              <p className="text-sm opacity-90">Complete tasks and earn rewards.</p>
            </Link>
          </nav>
        </div>

        {featuredGames.length === 0 && (
          <div className="text-center py-10 px-4">
            <p className="text-xl text-gray-500">
              No featured games right now.{' '}
              <Link href="/games" className="text-orange-500 hover:underline">
                Explore all games
              </Link>
              !
            </p>
          </div>
        )}
      </main>
    </div>    
  );
}
