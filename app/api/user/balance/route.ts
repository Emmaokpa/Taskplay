// app/api/user/balance/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/lib/firebaseAdmin';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (!adminApp) {
    console.error('[API /user/balance] Firebase Admin App not initialized.');
    return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
  }

  try {
    const db = getFirestore(adminApp);
    const userRef = db.collection('users').doc(session.user.id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // If user document doesn't exist, it implies a balance of 0 or an incomplete profile.
      // For now, return 0. You might want to create the user doc here if it's missing.
      return NextResponse.json({ balance: 0 }, { status: 200 });
    }

    const userData = userDoc.data();
    const balance = userData?.balance || 0; // Default to 0 if balance field is missing

    return NextResponse.json({ balance }, { status: 200 });

  } catch (error) {
    console.error('[API /user/balance] Error fetching user balance:', error);
    return NextResponse.json({ error: 'Internal Server Error fetching balance' }, { status: 500 });
  }
}
