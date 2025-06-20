// route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getFirestore, FieldValue } from 'firebase-admin/firestore'; // Import FieldValue
import { adminApp } from '@/lib/firebaseAdmin'; // Import the centralized adminApp

// Initialize Supabase client - credentials should come from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for admin actions

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("CRITICAL: Supabase URL or Service Role Key is not defined for link-account API.");
}

const supabaseAdmin: SupabaseClient | null = supabaseUrl && supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : null;

export async function POST(request: NextRequest) {
  console.log("--- [API LinkAccount] POST handler started ---");

  if (!supabaseAdmin) {
    console.error("[API LinkAccount] Supabase admin client not initialized. Check environment variables.");
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  if (!adminApp) {
    console.error('[API LinkAccount] Firebase Admin App from lib/firebaseAdmin.ts is not initialized.');
    return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
  }

  try {
    const { telegramId, supabaseAuthUserId } = await request.json();

    if (!telegramId || !supabaseAuthUserId) {
      console.error("[API LinkAccount] Missing telegramId or supabaseAuthUserId in request body.");
      return NextResponse.json({ error: 'Missing telegramId or supabaseAuthUserId' }, { status: 400 });
    }

    // Validate telegramId is a number and supabaseAuthUserId is a string (UUID)
    if (typeof telegramId !== 'number' || typeof supabaseAuthUserId !== 'string') {
        console.error("[API LinkAccount] Invalid data types for telegramId or supabaseAuthUserId.");
        return NextResponse.json({ error: 'Invalid data types' }, { status: 400 });
    }

    console.log(`[API LinkAccount] Attempting to link Telegram ID: ${telegramId} with Supabase Auth User ID: ${supabaseAuthUserId}`);

    // Check if the Supabase user actually exists (optional but good practice)
    // This requires the service_role key
    const { data: userCheck, error: userCheckError } = await supabaseAdmin.auth.admin.getUserById(supabaseAuthUserId);
    if (userCheckError || !userCheck?.user) {
        console.error(`[API LinkAccount] Supabase Auth User ID ${supabaseAuthUserId} not found or error fetching:`, userCheckError?.message);
        return NextResponse.json({ error: 'Invalid Supabase user ID or failed to verify user.' }, { status: 400 });
    }

    const db = getFirestore(adminApp);
    const linkRef = db.collection('user_telegram_links').doc(telegramId.toString());
    const userRef = db.collection('users').doc(supabaseAuthUserId); // Reference to the user's profile

    // Use a Firestore transaction to ensure atomicity
    await db.runTransaction(async (transaction) => {
      // Check if the Supabase user is already linked to a different Telegram ID
      // This requires an index on user_telegram_links: supabase_auth_user_id (asc)
      const existingLinkQuery = db.collection('user_telegram_links').where('supabase_auth_user_id', '==', supabaseAuthUserId);
      const existingLinkSnapshot = await transaction.get(existingLinkQuery);

      if (!existingLinkSnapshot.empty) {
        const alreadyLinkedDoc = existingLinkSnapshot.docs[0];
        if (alreadyLinkedDoc.id !== telegramId.toString()) {
          // This Supabase account is already linked to a different Telegram account.
          // You need to decide on the policy here: error, overwrite, or allow multiple.
          // For now, let's throw an error.
          throw new Error('This account is already linked to another Telegram user.');
        }
        // If it's the same Telegram ID, we can proceed (upsert will handle it)
      }

      // Set/overwrite the link in user_telegram_links
      // Using set with merge: true acts like an upsert for this specific document ID (telegramId)
      transaction.set(linkRef, {
        supabase_auth_user_id: supabaseAuthUserId,
        telegram_id: telegramId,
        createdAt: FieldValue.serverTimestamp(), // Use server timestamp
        updatedAt: FieldValue.serverTimestamp(), // Use server timestamp
      }, { merge: true }); // Use merge: true to update if doc exists, create if not


      // Create or update the user's profile in the 'users' collection
      // Using .set with { merge: true } will create if not exists, or update if it does.
      // We only want to set the initial balance if the document is being created.
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        transaction.set(userRef, {
          supabaseAuthUserId: supabaseAuthUserId, // Storing it again for easier querying if needed
          telegramId: telegramId, // Store Telegram ID here too
          balance: 0, // Initial balance
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        // If user doc exists, just update the updatedAt timestamp or other relevant fields if necessary
        // You might also want to update telegramId here if it can change
        transaction.update(userRef, { updatedAt: FieldValue.serverTimestamp() });
      }
    });

    // After successfully linking and creating/updating Firestore doc,
    // update Supabase user metadata to sync telegram_id.
    // This is outside the Firestore transaction but inside the main try block.
    const { data: updatedUser, error: metadataUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
        supabaseAuthUserId,
        {
            user_metadata: {
                ...userCheck.user.user_metadata, // Preserve existing metadata
                telegram_id: telegramId,
                // You could also set/update telegram_username here if you have it
            }
        }
    );

    if (metadataUpdateError) {
        console.warn(`[API LinkAccount] Account linked, but failed to update Supabase user metadata for ${supabaseAuthUserId} with telegram_id ${telegramId}:`, metadataUpdateError.message);
        // This is not a critical failure for the linking itself, but good to log.
    } else {
        console.log(`[API LinkAccount] Successfully updated Supabase user metadata for ${supabaseAuthUserId} with telegram_id ${telegramId}.`);
    }


    console.log(`[API LinkAccount] Account linked successfully for Telegram ID ${telegramId} and Supabase Auth User ID ${supabaseAuthUserId}.`);
    return NextResponse.json({ message: 'Account linked successfully' }, { status: 200 });

  } catch (e: any) {
    console.error('[API LinkAccount] Error processing link request:', e.message, e.stack);
    let errorMessage = 'Failed to process link request.';
    let statusCode = 500;

    if (e instanceof Error && e.message === 'This account is already linked to another Telegram user.') {
      errorMessage = e.message;
      statusCode = 409; // Conflict
    } else if (e.code === '23505') { // Unique violation in Supabase (less likely with upsert, but possible)
       errorMessage = 'This Telegram account is already linked or another error occurred.';
       statusCode = 409; // Conflict
    }

    return NextResponse.json({ error: errorMessage, details: e.message }, { status: statusCode });
  } finally {
      console.log("--- [API LinkAccount] POST handler finished ---");
  }
}
