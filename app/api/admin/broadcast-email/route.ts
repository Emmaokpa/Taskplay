import { adminApp } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

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

    // Since we want "Automated mails" and user-friendly UX, we'll send them in batches or sequentially.
    // To avoid timeouts in Next.js Edge/Serverless, we'll send a subset or just loop if small.
    // For 400 users, we can loop, but we should do it cautiously.
    
    console.log(`[Broadcast API] Starting broadcast to ${userEmails.length} users.`);

    const results = {
      success: 0,
      failed: 0,
    };

    // We call our internal email API for each to reuse the template logic
    // Alternatively, we could import the logic here, but calling the route is simpler for separation.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    for (const email of userEmails) {
      try {
        const response = await fetch(`${baseUrl}/api/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            type: 'broadcast',
            subject,
            content
          })
        });

        if (response.ok) {
          results.success++;
        } else {
          results.failed++;
          console.error(`[Broadcast API] Failed to send to ${email}`);
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
