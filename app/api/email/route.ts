import { adminApp } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mail-utils';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    if (!adminApp) {
      throw new Error('Firebase Admin not initialized.');
    }

    const { email, type, reason, subject, content } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // OTP Generation (Only for verification and password reset)
    let otpCode = '';
    if (type === 'verification' || type === 'reset-password') {
      otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      const { getFirestore } = await import('firebase-admin/firestore');
      const db = getFirestore(adminApp);
      await db.collection('otps').doc(email).set({
        code: otpCode,
        type: type,
        expiresAt: expiresAt.toISOString(),
        used: false
      });
    }

    console.log(`[Email API] Sending '${type}' email to: ${email}`);

    const result = await sendEmail({
      email,
      type,
      otpCode,
      reason,
      subject,
      content
    });

    console.log('[Email API] Resend response:', JSON.stringify(result));

    if (result.error) {
       return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: result.data?.id });
  } catch (error) {
    console.error('[Email API] Fatal error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
