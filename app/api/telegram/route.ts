// File: route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client - credentials should come from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for admin actions

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("CRITICAL: Supabase URL or Service Role Key is not defined in environment variables for Telegram API. Functionality will be impaired.");
  // Depending on your setup, you might throw an error or handle this differently
  // For now, the supabaseAdmin client will be null, and requests will likely fail.
}

// Create a Supabase client with the service role key for admin operations
// IMPORTANT: Only use the service role key on the server-side.
// This API route, when called by Telegram, is server-side.
const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : null;

export async function POST(request: NextRequest) {
  // Add a very clear log at the start to confirm this specific code version is running
  console.log("--- [API Telegram] POST handler started ---");
  console.log(`--- [API Telegram] Supabase Admin Client Initialized: ${!!supabaseAdmin} ---`);


  if (!supabaseAdmin) {
    console.error("[API Telegram] Supabase admin client not initialized. Cannot process webhook. Check environment variables.");
    return NextResponse.json({ error: 'Server configuration error: Supabase admin client not initialized.' }, { status: 500 });
  }

  try {
    const body = await request.json(); // Assuming Telegram sends webhook data as JSON
    console.log("[API Telegram] Webhook received:", JSON.stringify(body, null, 2));

    // --- Adapt this section to your Telegram bot's webhook payload structure ---
    // This attempts to find a message object, common in Telegram webhook payloads.
    // It could be directly in `body.message` or nested if it's a callback query.
    const message = body.message || body.callback_query?.message;

    if (!message || !message.from || !message.from.id) {
      console.log("[API Telegram] No valid 'message' or 'message.from.id' found in webhook payload. Cannot identify user.");
      // It's often best to return a 200 OK to Telegram even if you don't process,
      // to prevent Telegram from resending the webhook.
      return NextResponse.json({ message: "Webhook received, but no actionable user info." }, { status: 200 });
    }

    const telegramUserId: number = message.from.id; // This is the user's Telegram ID (number)
    const telegramUsername: string | null = message.from.username || null; // Optional
    console.log(`[API Telegram] Identified Telegram User ID: ${telegramUserId}, Username: ${telegramUsername}`);


    // Attempt to find the corresponding Supabase Auth User ID using the implemented function
    const supabaseAuthUserId: string | null = await getSupabaseAuthUserIdForTelegramUser(telegramUserId);

    if (supabaseAuthUserId) {
      console.log(`[API Telegram] Found Supabase Auth User ID: ${supabaseAuthUserId} for Telegram ID: ${telegramUserId}`);
      // Fetch the current Supabase user to check existing metadata
      const { data: { user: currentSupabaseUser }, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(supabaseAuthUserId);

      if (fetchError) {
        console.error(`[API Telegram] Error fetching Supabase user ${supabaseAuthUserId} using admin API:`, fetchError.message);
        // Decide how to handle this - maybe the user was deleted from Supabase Auth?
        // Or the supabaseAuthUserId obtained from getSupabaseAuthUserIdForTelegramUser was invalid.
      } else if (currentSupabaseUser) {
        const currentMetadata = currentSupabaseUser.user_metadata || {};
        let needsUpdate = false;
        const newMetadata: { [key: string]: any } = { ...currentMetadata }; // Create a mutable copy

        // Check and update telegram_id
        if (currentMetadata.telegram_id !== telegramUserId) {
          newMetadata.telegram_id = telegramUserId;
          needsUpdate = true;
          console.log(`[API Telegram] Metadata needs update: telegram_id changed from ${currentMetadata.telegram_id} to ${telegramUserId}`);
        }

        // Check and update telegram_username (optional)
        if (telegramUsername && currentMetadata.telegram_username !== telegramUsername) {
          newMetadata.telegram_username = telegramUsername; // Store username for reference
          needsUpdate = true;
           console.log(`[API Telegram] Metadata needs update: telegram_username changed from ${currentMetadata.telegram_username} to ${telegramUsername}`);
        }

        // Set default username if not present and telegramUsername is available
        // This assumes you want the Supabase 'username' to be the Telegram username by default
        if (!newMetadata.username && telegramUsername) {
            newMetadata.username = telegramUsername;
            needsUpdate = true;
             console.log(`[API Telegram] Metadata needs update: username set to ${telegramUsername} (was not present)`);
        }
        // Set default tier if not present
        if (!newMetadata.current_tier) {
            newMetadata.current_tier = "free"; // Default tier for new users
            needsUpdate = true;
             console.log(`[API Telegram] Metadata needs update: current_tier set to "free" (was not present)`);
        }
        // Set default wallet balance if not present (e.g., for a new user)
         if (typeof newMetadata.wallet_balance === 'undefined') { // Check for undefined specifically
            newMetadata.wallet_balance = 0; // Default wallet balance
            needsUpdate = true;
             console.log(`[API Telegram] Metadata needs update: wallet_balance set to 0 (was not present)`);
        }


        if (needsUpdate) {
          console.log(`[API Telegram] Updating Supabase user ${supabaseAuthUserId} metadata to:`, JSON.stringify(newMetadata, null, 2));
          const { data: updatedUserData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            supabaseAuthUserId,
            { user_metadata: newMetadata } // Pass the entire new metadata object
          );

          if (updateError) {
            console.error(`[API Telegram] Error updating Supabase user ${supabaseAuthUserId} metadata:`, updateError.message);
            // Potentially return an error response or log for retry
          } else {
            console.log(`[API Telegram] Successfully updated Supabase user ${supabaseAuthUserId} metadata. User:`, updatedUserData?.user?.id);
            // This update will trigger your `sync-user-to-firestore` Edge Function.
          }
        } else {
          console.log(`[API Telegram] Supabase user ${supabaseAuthUserId} metadata already up-to-date with Telegram ID ${telegramUserId}. No update needed.`);
        }
      } else {
        // This case means getUserById returned successfully but found no user.
        // This shouldn't happen if supabaseAuthUserId was valid.
        console.warn(`[API Telegram] Supabase user with ID ${supabaseAuthUserId} not found via admin API, though no error was thrown.`);
      }
    } else {
      console.log(`[API Telegram] Could not determine Supabase Auth User ID for Telegram user ${telegramUserId}. User might need to authenticate or link account with Supabase.`);
      // Here you might send a message back to the user via Telegram (if your bot setup allows)
      // asking them to /login or /start an authentication process to link their accounts.
      // Example (requires your bot library setup):
      // await sendTelegramMessage(telegramUserId, "Please link your account first. Type /link to get started.");
    }

    // Always respond to Telegram to acknowledge receipt of the webhook
    console.log("--- [API Telegram] POST handler finished ---");
    return NextResponse.json({ message: "Webhook processed by Telegram API" }, { status: 200 });
  } catch (error: any) {
    console.error('[API Telegram] Error processing webhook:', error.message, error.stack);
    console.log("--- [API Telegram] POST handler finished with error ---");
    return NextResponse.json({ error: 'Failed to process Telegram webhook', details: error.message }, { status: 500 });
  }
}

// Implementation to map Telegram User ID to Supabase Auth User ID (UUID string)
// This function queries the 'user_telegram_links' table.
// PREREQUISITE: You MUST have created the 'user_telegram_links' table in your Supabase public schema.
// Table structure: telegram_id BIGINT PRIMARY KEY, supabase_auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
async function getSupabaseAuthUserIdForTelegramUser(telegramUserId: number): Promise<string | null> {
  if (!supabaseAdmin) {
    console.error("[API Telegram] Supabase admin client not available in getSupabaseAuthUserIdForTelegramUser.");
    return null;
  }
  try {
    console.log(`[API Telegram] Attempting to find Supabase Auth User ID for Telegram ID: ${telegramUserId} in 'user_telegram_links' table.`);
    const { data, error } = await supabaseAdmin
      .from('user_telegram_links') // Query your mapping table
      .select('supabase_auth_user_id')
      .eq('telegram_id', telegramUserId)
      .single(); // Use .single() as we expect at most one link per telegram_id

    // PGRST116 means "Searched item was not found". For .single(), this is expected if no link exists.
    if (error && error.code !== 'PGRST116') {
      console.error(`[API Telegram] Error fetching Supabase user ID for Telegram ID ${telegramUserId} from mapping table:`, error.message);
      return null;
    }

    if (data) {
      console.log(`[API Telegram] Found Supabase Auth User ID ${data.supabase_auth_user_id} for Telegram ID ${telegramUserId}.`);
      return data.supabase_auth_user_id;
    } else {
      console.log(`[API Telegram] No Supabase Auth User ID mapping found in 'user_telegram_links' for Telegram ID ${telegramUserId}.`);
      return null;
    }
  } catch (e: any) {
    console.error(`[API Telegram] Exception in getSupabaseAuthUserIdForTelegramUser for Telegram ID ${telegramUserId}:`, e.message, e.stack);
    return null;
  }
}

// Optional: A GET handler can be useful for initial webhook setup verification with Telegram,
// but Telegram primarily uses POST for updates.
// export async function GET(request: NextRequest) {
//   return NextResponse.json({ message: "Telegram API endpoint is live and ready for POST requests from Telegram." });
// }
