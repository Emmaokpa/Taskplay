// File: c:\Users\Emmanuel Okpa\Desktop\TaskPlay\client\app\api\games\award-free-play\route.ts
import { NextResponse } from 'next/server';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import fs from 'fs';
import { initializeApp, cert, getApps, App as FirebaseAdminApp } from 'firebase-admin/app';
import type { FirestoreUser } from '@/lib/types'; // Assuming FirestoreUser type is defined

// --- Firebase Admin SDK Initialization ---
let serviceAccount: any;
const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING;
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (serviceAccountString) {
  try {
    serviceAccount = JSON.parse(serviceAccountString);
  } catch (e) {
    console.error("[API AwardFreePlay] Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING:", e);
  }
} else if (serviceAccountPath) {
  console.log(`[API AwardFreePlay] Attempting to load service account from path: ${serviceAccountPath}`);
  try {
    const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(fileContent);
    console.log("[API AwardFreePlay] Successfully loaded and parsed service account from path.");
  } catch (e) {
    console.error("[API AwardFreePlay] Failed to load or parse service account from path:", e);
  }
} else {
  console.error("[API AwardFreePlay] CRITICAL: Neither GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING nor GOOGLE_APPLICATION_CREDENTIALS env var is set.");
}

let adminApp: FirebaseAdminApp | undefined;
const adminAppName = 'TASKPLAY_API_GAMES_REWARD_APP'; 

const existingApp = getApps().find(app => app.name === adminAppName);

if (existingApp) {
  adminApp = existingApp;
  console.log(`[API AwardFreePlay] Using existing Firebase Admin App instance: ${adminAppName}`);
} else {
  if (serviceAccount) {
    try {
      console.log(`[API AwardFreePlay] Initializing new Firebase Admin App instance: ${adminAppName}`);
      adminApp = initializeApp({
        credential: cert(serviceAccount),
      }, adminAppName);
    } catch (e) {
      console.error(`[API AwardFreePlay] Error initializing Firebase Admin SDK with unique name '${adminAppName}':`, e);
      if (getApps().length > 0) adminApp = getApps()[0]; // Fallback
    }
  } else {
    // This console.error will be hit if serviceAccount loading failed above
    console.error("[API AwardFreePlay] Firebase Admin SDK cannot be initialized: Service account credentials not loaded.");
  }
}

const db = adminApp ? getFirestore(adminApp) : null;
if (db) {
  try {
    db.settings({ ignoreUndefinedProperties: true });
    console.log("[API AwardFreePlay] Firestore settings configured for ignoreUndefinedProperties.");
  } catch (error: any) {
    if (error.message.includes("Firestore has already been initialized")) {
      // This is acceptable if the settings were already applied.
      console.warn("[API AwardFreePlay] Firestore settings were already applied. Continuing.");
    } else {
      // Log other unexpected errors from settings
      console.error("[API AwardFreePlay] Error applying Firestore settings:", error);
    }
  }
}
// --- End Firebase Admin SDK Initialization ---

export async function POST(request: Request) {
  // Log when the POST handler is invoked
  console.log('[API AwardFreePlay] POST handler invoked.');

  if (!adminApp) { 
    console.error('[API AwardFreePlay] Firebase Admin App (adminApp) is not initialized. Cannot proceed.');
    return NextResponse.json({ error: 'Server configuration error: Firebase Admin App not initialized.' }, { status: 500 });
  }
  if (!db) { // db instance relies on adminApp
    console.error('[API AwardFreePlay] Firestore database instance (db) is not available.');
    return NextResponse.json({ error: 'Server configuration error: Firestore not available.' }, { status: 500 });
  }

  try {
    const { userId, gameId, rewardAmount } = await request.json();
    const DAILY_FREE_GAME_LIMIT = 20;

    console.log('[API AwardFreePlay] Request body:', { userId, gameId, rewardAmount });

    if (!userId || !gameId || typeof rewardAmount !== 'number' || rewardAmount <= 0) {
      console.warn('[API AwardFreePlay] Invalid parameters received:', { userId, gameId, rewardAmount });
      return NextResponse.json({ error: 'Missing or invalid parameters (userId, gameId, rewardAmount).' }, { status: 400 });
    }

    const userRef = db.collection('users').doc(String(userId));
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.warn(`[API AwardFreePlay] User not found: ${userId}`);
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const userData = userDoc.data() as FirestoreUser;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    let currentDailyPlays = userData.dailyFreeGamesPlayed || 0;
    const lastPlayDate = userData.lastFreeGamePlayDate;

    if (lastPlayDate !== today) {
      // Reset daily count if it's a new day
      currentDailyPlays = 0;
    }

    if (currentDailyPlays >= DAILY_FREE_GAME_LIMIT) {
      console.warn(`[API AwardFreePlay] User ${userId} reached daily free game limit.`);
      return NextResponse.json({ error: `Daily free game limit of ${DAILY_FREE_GAME_LIMIT} reached. Try again tomorrow.` }, { status: 429 }); // 429 Too Many Requests
    }

    // Prepare updates
    const updates: { [key: string]: any } = {
      balance: FieldValue.increment(rewardAmount),
      lastRewardAt: FieldValue.serverTimestamp(),
      dailyFreeGamesPlayed: FieldValue.increment(1),
      lastFreeGamePlayDate: today,
    };

    if (lastPlayDate !== today) { // If it's the first play of the day, set the count to 1 instead of incrementing from old value
      updates.dailyFreeGamesPlayed = 1;
    }

    await userRef.update(updates);

    console.log(`[API AwardFreePlay] Awarded ₦${rewardAmount} to user ${userId} for game ${gameId}. Plays today update: ${JSON.stringify(updates.dailyFreeGamesPlayed)}`);
    return NextResponse.json({ message: `Successfully awarded ₦${rewardAmount}.` }, { status: 200 });

  } catch (error: any) {
    console.error('[API AwardFreePlay] Error processing free play reward:', error);
    return NextResponse.json({ error: 'Failed to process reward.', details: error.message }, { status: 500 });
  }
}
