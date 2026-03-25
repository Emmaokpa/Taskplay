import { NextResponse } from 'next/server';
import { adminApp } from '@/lib/firebaseAdmin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export async function POST(req: Request) {
  try {
    const { email, code, type, newPassword } = await req.json();

    if (!email || !code || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!adminApp) {
      throw new Error('Firebase Admin not initialized.');
    }

    const db = getFirestore(adminApp);
    const auth = getAuth(adminApp);

    // Fetch OTP Document
    const otpRef = db.collection('otps').doc(email);
    const otpDoc = await otpRef.get();

    if (!otpDoc.exists) {
      return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 400 });
    }

    const data = otpDoc.data()!;
    
    // Validations
    if (data.used) {
      return NextResponse.json({ error: 'Code has already been used.' }, { status: 400 });
    }
    if (data.code !== code) {
      return NextResponse.json({ error: 'Incorrect code. Please try again.' }, { status: 400 });
    }
    if (new Date() > new Date(data.expiresAt)) {
      return NextResponse.json({ error: 'Code has expired. Request a new one.' }, { status: 400 });
    }
    if (data.type !== type) {
      return NextResponse.json({ error: 'Invalid operation type.' }, { status: 400 });
    }

    // Mark as used
    await otpRef.update({ used: true });

    // Execute the actual Verification Actions
    let actionResult = {};
    if (type === 'verification') {
       try {
         const userRecord = await auth.getUserByEmail(email);
         await auth.updateUser(userRecord.uid, { emailVerified: true });
         actionResult = { message: 'Email successfully verified' };
       } catch (err: any) {
         return NextResponse.json({ error: 'User not found in authentication system.' }, { status: 404 });
       }
    } else if (type === 'reset-password') {
       if (!newPassword || newPassword.length < 6) {
           return NextResponse.json({ error: 'A secure new password of at least 6 characters is required.' }, { status: 400 });
       }

       try {
         const userRecord = await auth.getUserByEmail(email);
         await auth.updateUser(userRecord.uid, { password: newPassword });
         actionResult = { message: 'Password reset completely successful.', canReset: true };
       } catch (err: any) {
         return NextResponse.json({ error: 'Target user no longer exists or network failure.' }, { status: 404 });
       }
    }

    return NextResponse.json({ success: true, ...actionResult });
  } catch (error) {
    console.error('OTP Verification Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
