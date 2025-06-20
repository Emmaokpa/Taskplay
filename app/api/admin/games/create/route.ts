import { NextResponse } from 'next/server';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import fs from 'fs'; // Import the 'fs' module
import { initializeApp, cert, getApps, App as FirebaseAdminApp } from 'firebase-admin/app';
import type { Game } from '@/lib/types'; // Ensure this path is correct

// Attempt to load service account credentials
let serviceAccount: any;
const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING;
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (serviceAccountString) {
  try {
    serviceAccount = JSON.parse(serviceAccountString);
  } catch (e) {
    console.error("Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING:", e);
  }
} else if (serviceAccountPath) { // GOOGLE_APPLICATION_CREDENTIALS is a file path
  console.log(`[API Create Game] Attempting to load service account from path: ${serviceAccountPath}`);
  try {
    const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(fileContent);
    console.log("[API Create Game] Successfully loaded and parsed service account from path.");
  } catch (e) {
    console.error("Failed to require GOOGLE_APPLICATION_CREDENTIALS from path:", e);
  }
} else {
  console.error("CRITICAL: Neither GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING nor GOOGLE_APPLICATION_CREDENTIALS env var is set for API route.");
}

// Initialize Firebase Admin SDK
let adminApp: FirebaseAdminApp | undefined;
const adminAppName = 'TASKPLAY_API_ADMIN_APP'; // Unique name for API routes if needed

const existingApp = getApps().find(app => app.name === adminAppName);

if (existingApp) {
  adminApp = existingApp;
  console.log(`[API Create Game] Using existing Firebase Admin App instance: ${adminAppName}`);
} else {
  if (!serviceAccount) {
    throw new Error("Firebase Admin SDK initialization failed: Service account credentials not loaded.");
  }
  console.log(`[API Create Game] Initializing new Firebase Admin App instance: ${adminAppName}`);
  adminApp = initializeApp({
    credential: cert(serviceAccount),
  }, adminAppName);
}

const db = getFirestore(adminApp);
// Configure Firestore to ignore undefined fields.
db.settings({ ignoreUndefinedProperties: true });


export async function POST(request: Request) {
  try {
    const gameData = await request.json() as Partial<Game>;

    if (!gameData.title || !gameData.embedCode || !gameData.type || !gameData.status) {
      return NextResponse.json({ error: 'Missing required game fields (title, embedCode, type, status)' }, { status: 400 });
    }

    const newGameRef = db.collection('games').doc();
    const newGame: Omit<Game, 'createdAt'> & { createdAt: FieldValue } = { // Use Omit for type safety before serverTimestamp
      id: newGameRef.id,
      title: gameData.title,
      description: gameData.description || '',
      embedCode: gameData.embedCode,
      gamePlatform: gameData.gamePlatform || '',
      category: gameData.category || '',
      type: gameData.type,
      rewardAmount: gameData.type === 'free' ? Number(gameData.rewardAmount || 0) : undefined,
      minBet: gameData.type === 'paid' ? Number(gameData.minBet || 0) : undefined,
      maxBet: gameData.type === 'paid' ? Number(gameData.maxBet || 0) : undefined,
      winMultiplier: gameData.type === 'paid' ? Number(gameData.winMultiplier || 1.5) : undefined,
      status: gameData.status,
      createdAt: FieldValue.serverTimestamp(), // Firestore will set this
      imageUrl: gameData.imageUrl || '',
    };

    await newGameRef.set(newGame);

    // Fetch the document to get the server-generated timestamp and convert it
    const savedGameDoc = await newGameRef.get();
    const savedGameData = savedGameDoc.data();
    
    const responseGame: Game = {
      ...(savedGameData as Omit<Game, 'createdAt' | 'id'>), // Cast to ensure type safety
      id: savedGameDoc.id,
      createdAt: (savedGameData?.createdAt as Timestamp)?.toDate() || new Date(), // Convert Timestamp to Date
    };

    return NextResponse.json({ message: 'Game created successfully', game: responseGame }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating game:', error);
    return NextResponse.json({ error: 'Failed to create game', details: error.message }, { status: 500 });
  }
}