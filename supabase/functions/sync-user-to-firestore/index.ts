import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2' // Only if you need to interact with Supabase DB from function

// Use npm: specifier for Firebase Admin SDK
import admin from 'npm:firebase-admin@11.11.1'; // Specify version

// Type for Firebase Admin App
type FirebaseAdminApp = admin.app.App; // This type is correctly namespaced under admin.app

const serviceAccountString = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_KEY");
if (!serviceAccountString) {
  console.error("FATAL: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
  // Deno.exit(1); // Consider exiting if critical, or let it fail at JSON.parse
}
// Ensure serviceAccount is only parsed if the string exists to avoid runtime error on undefined
const serviceAccount = serviceAccountString ? JSON.parse(serviceAccountString) : null;

// const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '' // Only if using Supabase client
// const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '' // Only if using Supabase client

serve(async (req: Request) => {
  if (!serviceAccount) {
    console.error("Firebase service account is not loaded. Cannot proceed.");
    return new Response(JSON.stringify({ error: "Firebase service account not configured." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let adminAppInstance: FirebaseAdminApp;
  const appName = 'FIREBASE_ADMIN_APP_SYNC_CLI_V2'; // Unique name for the Firebase app instance

  // Initialize Firebase Admin SDK if not already initialized
  // Use admin.apps array to find existing app
  const existingApp = admin.apps.find(app => app?.name === appName);
  if (existingApp) {
    adminAppInstance = existingApp;
  } else {
    // Call initializeApp and cert directly on the admin object and its properties
    adminAppInstance = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    }, appName);
  }
  // Call firestore directly on the admin object
  const db = admin.firestore(adminAppInstance);

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { record, type, old_record } = await req.json();
    console.log("Webhook received:", { type, record: type !== 'DELETE' ? record : undefined, old_record: type === 'DELETE' ? old_record : undefined });

    if (type === 'INSERT' || type === 'UPDATE') {
      if (!record || !record.id) {
        console.error("No record or record.id found in webhook data for INSERT/UPDATE.");
        return new Response(JSON.stringify({ error: "Invalid record data for INSERT/UPDATE" }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const userId = record.id; // This is the Supabase auth user ID (UUID string)
      const email = record.email;
      const username = record.raw_user_meta_data?.username || null;
      const currentTier = record.raw_user_meta_data?.current_tier || "free";
      const walletBalance = record.raw_user_meta_data?.wallet_balance || 0;
      // Attempt to get telegram_id from raw_user_meta_data
      const telegramId = record.raw_user_meta_data?.telegram_id || null;

      // Firestore document ID will be the Supabase user ID (string)
      const userRef = db.collection('users').doc(userId);
      const userData: { [key: string]: any } = { // Define userData with a more flexible type
        supabase_user_id: userId,
        email: email || null,
        username: username,
        current_tier: currentTier,
        wallet_balance: walletBalance,
      };

      // Conditionally add telegram_id if it exists and is not null
      if (telegramId !== null) {
        userData.telegram_id = telegramId;
      }

      await userRef.set(userData, { merge: true });
      console.log(`Upserted user in Firestore: ${userId}`);

    } else if (type === 'DELETE') {
      if (!old_record || !old_record.id) {
        console.error("No old_record or old_record.id found in DELETE webhook data.");
        return new Response(JSON.stringify({ error: "Invalid record data for DELETE" }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const userId = old_record.id;
      const userRef = db.collection('users').doc(userId);
      await userRef.delete();
      console.log(`Deleted user from Firestore: ${userId}`);
    } else {
      console.warn(`Received unhandled webhook type: ${type}`);
      return new Response(JSON.stringify({ error: `Unhandled webhook type: ${type}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ message: 'User sync processed' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error("Error in webhook handler:", e.message, e.stack);
    return new Response(JSON.stringify({ error: e.message, stack: e.stack }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
