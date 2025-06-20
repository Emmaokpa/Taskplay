import React from 'react';
import Link from 'next/link';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, cert, getApps, App as FirebaseAdminApp } from 'firebase-admin/app';
import fs from 'fs'; // Ensure fs is imported
import type { Game } from '@/lib/types'; // Ensure this path is correct
import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation'; // Import redirect for navigation
import GamePlayerClient from './GamePlayerClient'; // Import the new client component
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'; // Supabase helper
import { cookies } from 'next/headers'; // To get cookies for Supabase

// Attempt to load service account credentials
let serviceAccount: any;
const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING;
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (serviceAccountString) {
  try {
    serviceAccount = JSON.parse(serviceAccountString);
  } catch (e) {
    console.error("GameEmbedPage: Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING:", e);
  }
} else if (serviceAccountPath) { // GOOGLE_APPLICATION_CREDENTIALS is a file path
  console.log(`[GameEmbedPage] Attempting to load service account from path: ${serviceAccountPath}`);
  try {
    const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(fileContent);
    console.log("[GameEmbedPage] Successfully loaded and parsed service account from path.");
  } catch (e) {
    console.error(`GameEmbedPage: Failed to load or parse service account from path '${serviceAccountPath}':`, e);
  }
} else {
  console.error("GameEmbedPage CRITICAL: Neither GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING nor GOOGLE_APPLICATION_CREDENTIALS env var is set.");
}

// Initialize Firebase Admin SDK
let adminApp: FirebaseAdminApp | undefined;
const adminAppName = 'TASKPLAY_GAME_EMBED_ADMIN_APP'; // Unique name for this app instance

if (!getApps().find(app => app.name === adminAppName)) {
  if (!serviceAccount) {
    console.error("GameEmbedPage: Firebase Admin SDK initialization failed: Service account credentials not loaded.");
  } else {
     try {
      adminApp = initializeApp({
        credential: cert(serviceAccount),
      }, adminAppName);
    } catch (e) {
      console.error("GameEmbedPage: Error initializing Firebase Admin SDK with unique name:", e);
      if (getApps().length > 0 && !getApps().find(app => app.name === adminAppName)) {
        adminApp = getApps()[0];
        console.warn("GameEmbedPage: Falling back to default Firebase Admin app instance.");
      }
    }
  }
} else {
  adminApp = getApps().find(app => app.name === adminAppName);
}

if (adminApp) {
  console.log(`[GameEmbedPage] Connected to Firebase Project ID: ${adminApp.options?.projectId} (App Name: ${adminApp.name})`);
}

async function getGameById(gameId: string): Promise<Game | null> {
  if (!adminApp) {
    console.error("[GameEmbedPage getGameById] Firebase Admin App is not initialized.");
    return null;
  }
  const db = getFirestore(adminApp);
  const gameRef = db.collection('games').doc(gameId);
  const doc = await gameRef.get();

  if (!doc.exists) {
    return null;
  }
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: (data?.createdAt as Timestamp)?.toDate() || new Date(),
  } as Game;
}

interface GameEmbedPageProps {
  params: { gameId: string };
}

const GameEmbedPage = async ({ params }: GameEmbedPageProps) => {
  const { gameId } = params;

  // --- Supabase Authentication Check ---
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // If no session, redirect to the authentication page
    redirect('/auth'); // Ensure you have an /auth page
  }
  // --- End Supabase Authentication Check ---

  const game = await getGameById(gameId);

  if (!game) {
    notFound(); // Triggers the not-found.tsx page or a default 404 if game not found
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-start bg-black p-2 pt-8 md:pt-4">
      <div className="w-full text-center mb-2 md:mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-white">{game.title}</h1>
        {/* Placeholder for timer, ad logic, submission form will go here or around the iframe */}
      </div>
      <div className="w-full max-w-5xl aspect-[16/9] md:aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
        <GamePlayerClient game={game} />
      </div>
      <Link href="/games" className="mt-6 bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded-lg text-sm transition-colors">
        Back to Games
      </Link>
    </div>
  );
};

export default GameEmbedPage;