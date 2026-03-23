import { adminApp } from '@/lib/firebaseAdmin';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: Request) {
  try {
    const { reference, userId } = await req.json();

    if (!reference || !userId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (!adminApp) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const db = getFirestore(adminApp);

    // 1. Verify Payment with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await response.json();

    if (!data.status || data.data.status !== 'success' || data.data.amount !== 1500 * 100) {
      return NextResponse.json({ error: 'Payment verification failed or invalid amount' }, { status: 400 });
    }

    // 2. Update User Document
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userSnap.data();

    // Already a member? 
    if (userData?.isMember) {
      return NextResponse.json({ success: true, alreadyMember: true });
    }

    // Atomic Updates
    const batch = db.batch();
    
    // a. Mark user as member
    batch.update(userRef, {
      isMember: true,
      membershipAt: FieldValue.serverTimestamp()
    });

    // b. Referral Payout (₦500)
    if (userData?.referredBy) {
      // Find the user who owns this referral code
      const referrersQuery = await db.collection('users')
        .where('referralCode', '==', userData.referredBy)
        .limit(1)
        .get();

      if (!referrersQuery.empty) {
        const referrerDoc = referrersQuery.docs[0];
        batch.update(referrerDoc.ref, {
          balance: FieldValue.increment(500),
          totalReferrals: FieldValue.increment(1),
          earnedFromReferrals: FieldValue.increment(500)
        });
      }
    }

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Verify Upgrade Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
