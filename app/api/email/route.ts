import { Resend } from 'resend';
import { adminApp } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    if (!adminApp) {
      throw new Error('Firebase Admin not initialized. Please check GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING environment variable.');
    }

    const { email, type } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // OTP Generation
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 mins expiry

    // Save OTP via Admin Firestore SDK
    const { getFirestore } = await import('firebase-admin/firestore');
    const db = getFirestore(adminApp);
    await db.collection('otps').doc(email).set({
       code: otpCode,
       type: type,
       expiresAt: expiresAt.toISOString(),
       used: false
    });

    const emailHeader = type === 'verification' ? 'VERIFY IDENTITY' : 'RESET PROTOCOL';
    const emailSub = type === 'verification' ? 'Welcome to TaskPlay' : 'Security Alert';
    const emailInstructions = type === 'verification'
       ? 'To finalize your network access and start earning daily, provide the authorization code below.'
       : 'A security breach was intercepted. Use the highly classified code below to reset your authentication matrix.';

    const templateHTML = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #05070A; color: white; padding: 40px 20px; line-height: 1.6; max-width: 100%; border-top: 5px solid #8b5cf6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0A0F1E; padding: 50px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 50px rgba(139,92,246,0.05);">
           
           <div style="text-align: center; margin-bottom: 40px;">
              <span style="display: inline-block; padding: 5px 15px; background: rgba(139,92,246,0.1); color: #8b5cf6; border-radius: 50px; font-size: 10px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 20px;">
                 ${emailSub}
              </span>
              <h1 style="font-size: 32px; font-weight: 900; margin: 0; color: #ffffff; letter-spacing: -1px; text-transform: uppercase;">
                 ${emailHeader}
              </h1>
           </div>

           <p style="text-align: center; color: rgba(255,255,255,0.5); font-size: 15px; margin-bottom: 50px; font-weight: 500;">
              ${emailInstructions}
           </p>

           <div style="background: linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(139,92,246,0.05) 100%); border: 1px solid rgba(139,92,246,0.3); padding: 40px; border-radius: 20px; text-align: center; margin-bottom: 30px; box-shadow: inset 0 0 30px rgba(139,92,246,0.1);">
              <div style="font-size: 52px; font-weight: 900; color: #ffffff; letter-spacing: 15px; font-variant-numeric: tabular-nums;">
                 ${otpCode}
              </div>
           </div>

           <p style="text-align: center; color: rgba(255,255,255,0.3); font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
              CODE EXPIRES IN 15 MINUTES
           </p>

           <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.05); margin: 40px 0;" />
           
           <p style="text-align: center; color: rgba(255,255,255,0.2); font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">
              SECURE SECTOR &bull; TASKPLAY NIGERIA &bull; ALL SYSTEMS OPERATIONAL
           </p>
        </div>
      </div>
    `;

    const result = await resend.emails.send({
      from: 'TaskPlay <onboarding@resend.dev>',
      to: email,
      subject: type === 'verification' ? 'Your TaskPlay Verification Code' : 'TaskPlay Password Reset Code',
      html: templateHTML,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Email API Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
