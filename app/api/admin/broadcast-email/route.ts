import { adminApp } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mail-utils';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    if (!adminApp) {
      throw new Error('Firebase Admin not initialized.');
    }

    const { target, specificEmails, group, subject, content } = await req.json();

    const { getFirestore } = await import('firebase-admin/firestore');
    const db = getFirestore(adminApp);
    
    let userEmails: string[] = [];

    if (target === 'all') {
      const usersSnapshot = await db.collection('users').get();
      userEmails = usersSnapshot.docs.map(doc => doc.data().email).filter(Boolean);
    } else if (target === 'specific') {
      userEmails = specificEmails.split(',').map((e: string) => e.trim()).filter(Boolean);
    } else if (target === 'group') {
      let q;
      if (group === 'verified') {
        q = db.collection('users').where('isMember', '==', true);
      } else {
        q = db.collection('users').where('isMember', '==', false);
      }
      const groupSnapshot = await q.get();
      userEmails = groupSnapshot.docs.map(doc => doc.data().email).filter(Boolean);
    }

    if (userEmails.length === 0) {
      return NextResponse.json({ error: 'No recipients found.' }, { status: 400 });
    }
    
    console.log(`[Broadcast API] Starting direct broadcast to ${userEmails.length} users.`);

    const results = {
      success: 0,
      failed: 0,
    };

    // Sequential sending to avoid rate limits and too many concurrent promises
    // In a real high-scale app, this would be a background job (BullMQ, QStash, etc.)
    // But for 400 users, we'll loop directly.
    for (const email of userEmails) {
      try {
        const result = await sendEmail({
          email,
          type: 'broadcast',
          subject,
          content
        });

        if (!result.error) {
          results.success++;
        } else {
          results.failed++;
          console.error(`[Broadcast API] Failed to send to ${email}:`, result.error);
        }
      } catch (err) {
        results.failed++;
        console.error(`[Broadcast API] Error sending to ${email}:`, err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Broadcast completed. Success: ${results.success}, Failed: ${results.failed}`,
      results 
    });

  } catch (error) {
    console.error('[Broadcast API] Fatal error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
