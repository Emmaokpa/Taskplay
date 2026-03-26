import { Resend } from 'resend';
import { adminApp } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[Email API] RESEND_API_KEY is not set!');
      return NextResponse.json({ error: 'Email service is not configured.' }, { status: 500 });
    }
    const resend = new Resend(apiKey);

    if (!adminApp) {
      throw new Error('Firebase Admin not initialized.');
    }

    const { email, type } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // OTP Generation (Only for verification and password reset — not welcome)
    let otpCode = '';
    if (type !== 'welcome') {
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

    // Email content based on type
    let emailSubject = '';
    let emailHeader = '';
    let emailBody = '';

    if (type === 'verification') {
      emailSubject = "Verify your TaskPlay email";
      emailHeader = "Welcome to TaskPlay! 🎉";
      emailBody = `
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">Please use the verification code below to complete your registration and start earning.</p>
        <div style="background-color: #f3f4f6; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #2563eb;">${otpCode}</span>
        </div>
        <p style="font-size: 14px; text-align: center; color: #9ca3af;">This code expires in 15 minutes.</p>
      `;
    } else if (type === 'reset-password') {
      emailSubject = "Reset your TaskPlay password";
      emailHeader = "Password Reset Request";
      emailBody = `
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">We received a request to reset your password. Use the code below to securely change it.</p>
        <div style="background-color: #f3f4f6; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #2563eb;">${otpCode}</span>
        </div>
        <p style="font-size: 14px; text-align: center; color: #9ca3af;">This code expires in 15 minutes. Ignore this email if you did not request a password reset.</p>
      `;
    } else if (type === 'welcome') {
      emailSubject = "🎉 Welcome to TaskPlay! Start Earning Now";
      emailHeader = "Congratulations on joining TaskPlay!";
      emailBody = `
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 20px;">We are so excited to have you on board!</p>
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 20px;">Did you know you can make up to <strong>₦100,000 monthly</strong> just by performing simple social tasks?</p>
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
          <h3 style="margin-top: 0; color: #1e3a8a; font-size: 18px;">How to start earning:</h3>
          <ol style="color: #3b82f6; margin-bottom: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;"><span style="color: #4b5563;">Go to your Dashboard and click on <strong>Social Tasks</strong> or <strong>CPA Offers</strong>.</span></li>
            <li style="margin-bottom: 8px;"><span style="color: #4b5563;">Follow the simple instructions (like following a page or downloading an app).</span></li>
            <li style="margin-bottom: 0;"><span style="color: #4b5563;">Get paid instantly to your wallet, and withdraw directly to your Nigerian bank account!</span></li>
          </ol>
        </div>
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">Log in now to claim your first available tasks before slots run out!</p>
        <div style="text-align: center;">
          <a href="https://taskplay.ng/dashboard" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Go to Dashboard &rarr;</a>
        </div>
      `;
    } else {
      return NextResponse.json({ error: 'Invalid email type.' }, { status: 400 });
    }

    const templateHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
        <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
          
          <div style="background-color: #1d4ed8; padding: 24px 40px; text-align: center;">
            <h1 style="font-size: 22px; font-weight: bold; margin: 0; color: #ffffff; letter-spacing: -0.5px;">TaskPlay Nigeria</h1>
          </div>

          <div style="padding: 30px 40px 10px; text-align: center; border-bottom: 1px solid #f3f4f6;">
            <h2 style="font-size: 20px; font-weight: bold; margin: 0 0 8px; color: #111827;">${emailHeader}</h2>
          </div>

          <div style="padding: 28px 40px;">
            ${emailBody}
          </div>

          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #f3f4f6;">
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">TaskPlay Nigeria &copy; ${new Date().getFullYear()}</p>
            <p style="margin: 6px 0 0; color: #9ca3af; font-size: 12px;">The simplest way to make money online in Nigeria.</p>
          </div>
        </div>
      </div>
    `;

    // Using your verified Resend domain
    const fromAddress = 'TaskPlay <noreply@taskplay.com.ng>';

    console.log(`[Email API] Sending '${type}' email to: ${email} from: ${fromAddress}`);

    const result = await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: emailSubject,
      html: templateHTML,
    });

    console.log('[Email API] Resend response:', JSON.stringify(result));

    if (result.error) {
      console.error('[Email API] Resend returned an error:', result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: result.data?.id });
  } catch (error) {
    console.error('[Email API] Fatal error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
