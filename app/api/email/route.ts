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

    // OTP Generation (Only for verification and password reset)
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
         <div style="background-color: #f3f4f6; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
           <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${otpCode}</span>
         </div>
         <p style="font-size: 14px; text-align: center; color: #9ca3af;">This code expires in 15 minutes.</p>
       `;
    } else if (type === 'passwordReset') {
       emailSubject = "Reset your TaskPlay password";
       emailHeader = "Password Reset Request";
       emailBody = `
         <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">We received a request to reset your password. Use the code below to securely change it.</p>
         <div style="background-color: #f3f4f6; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
           <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${otpCode}</span>
         </div>
         <p style="font-size: 14px; text-align: center; color: #9ca3af;">This code expires in 15 minutes. Ignore this email if you didn't request a password reset.</p>
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
           <a href="https://taskplay.ng/dashboard" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Go to Dashboard</a>
         </div>
       `;
    }

    const templateHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
           
           <div style="background-color: #ffffff; padding: 30px 40px 20px; text-align: center; border-bottom: 1px solid #f3f4f6;">
              <h1 style="font-size: 24px; font-weight: bold; margin: 0; color: #111827;">
                 ${emailHeader}
              </h1>
           </div>

           <div style="padding: 30px 40px;">
              ${emailBody}
           </div>

           <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #f3f4f6;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">TaskPlay Nigeria &copy; ${new Date().getFullYear()}</p>
              <p style="margin: 8px 0 0; color: #9ca3af; font-size: 12px;">The simplest way to make money online.</p>
           </div>
        </div>
      </div>
    `;

    const result = await resend.emails.send({
      from: 'TaskPlay <noreply@taskplay.com.ng>',
      to: email,
      subject: emailSubject,
      html: templateHTML,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Email API Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
