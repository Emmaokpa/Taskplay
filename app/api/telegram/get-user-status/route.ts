// app/api/telegram/get-user-status/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseAuthUserIdForTelegramUser } from '@/lib/supabaseAdmin';


export async function POST(request: Request) {
  try {
    const { telegramId } = await request.json();

    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    // Note: We don't strictly need to create a Supabase client here if
    // getSupabaseAuthUserIdForTelegramUser handles its own client creation
    // for admin operations. If it relies on a passed client, adjust accordingly.
    // For now, assuming getSupabaseAuthUserIdForTelegramUser can work independently
    // or uses an admin client.

    const supabaseAuthUserId = await getSupabaseAuthUserIdForTelegramUser(Number(telegramId));

    if (supabaseAuthUserId) {
      // User is linked
      return NextResponse.json({
        isLinked: true,
        supabaseAuthUserId: supabaseAuthUserId,
        // You could potentially fetch and return some basic user profile info here too
      });
    } else {
      // User is not linked
      return NextResponse.json({ isLinked: false });
    }
  } catch (error) {
    console.error('[API /get-user-status] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
