import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import { initializeApp, cert, getApps, App as FirebaseAdminApp } from 'firebase-admin/app';
import type { FirestoreUser } from '@/lib/types';

// --- Firebase Admin SDK Initialization (Consistent with other API routes) ---
let serviceAccount: any;
const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING;
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (serviceAccountString) {
  try { serviceAccount = JSON.parse(serviceAccountString); } catch (e) { console.error("API UserGameStats: Failed to parse JSON_STRING:", e); }
} else if (serviceAccountPath) {
  try {
    const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(fileContent);
  } catch (e) { console.error("API UserGameStats: Failed to load from path:", e); }
} else {
  console.error("API UserGameStats CRITICAL: No Firebase credentials found.");
}

let adminApp: FirebaseAdminApp | undefined;
const adminAppName = 'TASKPLAY_API_USER_STATS_APP';

const existingApp = getApps().find(app => app.name === adminAppName);
if (existingApp) {
  adminApp = existingApp;
} else if (serviceAccount) {
  try {
    adminApp = initializeApp({ credential: cert(serviceAccount) }, adminAppName);
  } catch (e) {
    console.error(`API UserGameStats: Error initializing Firebase Admin SDK '${adminAppName}':`, e);
    if (getApps().length > 0) adminApp = getApps()[0];
  }
}

const db = adminApp ? getFirestore(adminApp) : null;
// --- End Firebase Admin SDK Initialization ---

export async function GET(request: Request) {
  if (!db) {
    return NextResponse.json({ error: 'Server Firebase connection not initialized.' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId query parameter is required.' }, { status: 400 });
  }

  try {
    const userRef = db.collection('users').doc(String(userId));
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const userData = userDoc.data() as FirestoreUser;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const playsToday = (userData.lastFreeGamePlayDate === today) ? (userData.dailyFreeGamesPlayed || 0) : 0;
    const playsLeft = Math.max(0, 20 - playsToday); // Assuming DAILY_FREE_GAME_LIMIT is 20

    return NextResponse.json({
      dailyFreeGamesPlayed: playsToday,
      lastFreeGamePlayDate: userData.lastFreeGamePlayDate || null,
      playsLeftToday: playsLeft,
    }, { status: 200 });

  } catch (error: any) {
    console.error('[API UserGameStats] Error fetching user game stats:', error);
    return NextResponse.json({ error: 'Failed to fetch user game stats.', details: error.message }, { status: 500 });
  }
}