import { NextResponse } from 'next/server';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';
import { initializeApp, cert, getApps, App as FirebaseAdminApp } from 'firebase-admin/app';
import { createClient } from '@supabase/supabase-js'; // For deleting from Supabase
import type { Game } from '@/lib/types';

// --- Firebase Admin SDK Initialization ---
let serviceAccount: any;
const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING;
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (serviceAccountString) {
  try { serviceAccount = JSON.parse(serviceAccountString); } catch (e) { console.error("API Admin Game [gameId]: Failed to parse JSON_STRING:", e); }
} else if (serviceAccountPath) {
  try {
    const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(fileContent);
  } catch (e) { console.error("API Admin Game [gameId]: Failed to load from path:", e); }
}

let adminApp: FirebaseAdminApp | undefined;
const adminAppName = 'TASKPLAY_API_ADMIN_GAME_DETAIL_APP'; // More generic name for GET/PUT/DELETE
const existingApp = getApps().find(app => app.name === adminAppName);
if (existingApp) {
  adminApp = existingApp;
} else if (serviceAccount) {
  try { adminApp = initializeApp({ credential: cert(serviceAccount) }, adminAppName); } catch (e) { console.error(`API Admin Game Delete: Error initializing Firebase Admin SDK '${adminAppName}':`, e); }
}
const db = adminApp ? getFirestore(adminApp) : null;
// --- End Firebase Admin SDK Initialization ---

// --- Supabase Client Initialization (for deleting images) ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // IMPORTANT: Use Service Role Key for backend operations

let supabaseAdminClient: any = null;
if (supabaseUrl && supabaseServiceKey) {
    supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey);
} else {
    console.warn("API Admin Game [gameId]: Supabase URL or Service Role Key not configured. Image operations (delete/update) from Supabase will be skipped.");
}
// --- End Supabase Client Initialization ---

export async function GET(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  if (!db) {
    return NextResponse.json({ error: 'Server Firebase connection not initialized.' }, { status: 500 });
  }
  const gameId = params.gameId;
  if (!gameId) {
    return NextResponse.json({ error: 'Game ID is required.' }, { status: 400 });
  }

  try {
    const gameRef = db.collection('games').doc(gameId);
    const doc = await gameRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Game not found.' }, { status: 404 });
    }
    // Convert Firestore Timestamps to ISO strings or ensure client can handle them
    const gameData = { id: doc.id, ...doc.data() } as Game; // Cast to Game type
    return NextResponse.json(gameData, { status: 200 });
  } catch (error: any) {
    console.error(`API Admin Game GET: Error fetching game ${gameId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch game data.', details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  if (!db) {
    return NextResponse.json({ error: 'Server Firebase connection not initialized.' }, { status: 500 });
  }

  const gameId = params.gameId;
  if (!gameId) {
    return NextResponse.json({ error: 'Game ID is required.' }, { status: 400 });
  }

  try {
    const gameRef = db.collection('games').doc(gameId);
    const gameDoc = await gameRef.get();

    if (!gameDoc.exists) {
      return NextResponse.json({ error: 'Game not found.' }, { status: 404 });
    }

    const gameData = gameDoc.data();

    // Delete from Firestore
    await gameRef.delete();

    // Attempt to delete image from Supabase Storage if imageUrl exists and supabaseAdminClient is configured
    if (gameData?.imageUrl && supabaseAdminClient && gameData.imageUrl.includes(supabaseUrl!)) {
      try {
        const pathParts = new URL(gameData.imageUrl).pathname.split('/');
        const bucketName = pathParts[pathParts.length - 2]; // Assumes URL like .../bucketName/fileName.ext
        const filePath = pathParts[pathParts.length - 1];
        
        if (bucketName && filePath) {
            const { error: deleteError } = await supabaseAdminClient.storage.from(bucketName).remove([filePath]);
            if (deleteError) console.error(`API Admin Game DELETE: Failed to delete image from Supabase for game ${gameId}: ${deleteError.message}`);
            else console.log(`API Admin Game DELETE: Successfully deleted image from Supabase for game ${gameId}`);
        }
      } catch (imgDelErr) { console.error(`API Admin Game DELETE: Error processing image deletion from Supabase for game ${gameId}:`, imgDelErr); }
    }

    return NextResponse.json({ message: `Game ${gameId} deleted successfully.` }, { status: 200 });
  } catch (error: any) {
    console.error(`API Admin Game DELETE: Error deleting game ${gameId}:`, error);
    return NextResponse.json({ error: 'Failed to delete game.', details: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  if (!db) {
    return NextResponse.json({ error: 'Server Firebase connection not initialized.' }, { status: 500 });
  }

  const gameId = params.gameId;
  if (!gameId) {
    return NextResponse.json({ error: 'Game ID is required.' }, { status: 400 });
  }

  try {
    const gameDataToUpdate: Partial<Game> = await request.json();

    if (!gameDataToUpdate.title || !gameDataToUpdate.embedCode) {
      return NextResponse.json({ error: 'Title and Embed Code are required.' }, { status: 400 });
    }

    const gameRef = db.collection('games').doc(gameId);
    const gameDoc = await gameRef.get();

    if (!gameDoc.exists) {
      return NextResponse.json({ error: 'Game not found to update.' }, { status: 404 });
    }

    const oldGameData = gameDoc.data() as Game;

    if (
      supabaseAdminClient &&
      oldGameData.imageUrl &&
      gameDataToUpdate.imageUrl !== oldGameData.imageUrl &&
      oldGameData.imageUrl.includes(supabaseUrl!)
    ) {
      try {
        const pathParts = new URL(oldGameData.imageUrl).pathname.split('/');
        const bucketName = pathParts[pathParts.length - 2];
        const filePath = pathParts[pathParts.length - 1];
        if (bucketName && filePath) {
          await supabaseAdminClient.storage.from(bucketName).remove([filePath]);
          console.log(`API Admin Game PUT: Successfully deleted old image from Supabase for game ${gameId}`);
        }
      } catch (imgDelErr) {
        console.error(`API Admin Game PUT: Error deleting old image from Supabase for game ${gameId}:`, imgDelErr);
      }
    }

    const updatePayload = { ...gameDataToUpdate, updatedAt: FieldValue.serverTimestamp() };
    await gameRef.update(updatePayload);

    return NextResponse.json({ message: `Game ${gameId} updated successfully.`, game: { id: gameId, ...updatePayload } }, { status: 200 });
  } catch (error: any) {
    console.error(`API Admin Game PUT: Error updating game ${gameId}:`, error);
    return NextResponse.json({ error: 'Failed to update game.', details: error.message }, { status: 500 });
  }
}