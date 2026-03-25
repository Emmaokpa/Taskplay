import { adminApp } from '@/lib/firebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { adminId, targetUserId } = await req.json();

    if (!adminId || !targetUserId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (!adminApp) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const db = getFirestore(adminApp);
    const auth = getAuth(adminApp);

    // 1. Verify admin
    const adminDoc = await db.collection('users').doc(adminId).get();
    if (!adminDoc.exists || !adminDoc.data()?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    // 2. Delete User from Firebase Auth
    try {
      await auth.deleteUser(targetUserId);
    } catch (authError: any) {
      if (authError.code !== 'auth/user-not-found') {
        throw authError; // Ignore if user is already deleted from auth somehow
      }
    }

    // 3. Delete User Document from Firestore
    await db.collection('users').doc(targetUserId).delete();

    // 4. (Optional) Delete associated submissions, etc.
    // For now, we leave submissions isolated or rely on cleanup jobs.

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Delete User Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
