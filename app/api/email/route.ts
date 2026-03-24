import { Resend } from 'resend';
import { adminApp } from '@/lib/firebaseAdmin';
import { getAuth } from 'firebase-admin/auth';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    if (!adminApp) {
      throw new Error('Firebase Admin not initialized. Please check GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING environment variable.');
    }
    const auth = getAuth(adminApp);
    const { email, type } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let result;
    if (type === 'verification') {
      // 1. Generate Link
      const link = await auth.generateEmailVerificationLink(email);

      // 2. Send via Resend
      result = await resend.emails.send({
        from: 'TaskPlay <onboarding@resend.dev>', // Replace with your domain if verified
        to: email,
        subject: 'Verify your TaskPlay account',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0A0F1E; color: white; padding: 40px; border-radius: 20px;">
            <h1 style="color: #4A90E2; font-size: 32px; font-weight: 900; margin-bottom: 20px;">Welcome to TaskPlay!</h1>
            <p style="color: rgba(255,255,255,0.6); line-height: 1.6; font-size: 16px;">
              Thanks for joining our community of earners. To start performing tasks and earning real money, please verify your email address below.
            </p>
            <div style="margin: 40px 0;">
              <a href="${link}" style="background-color: #4A90E2; color: white; padding: 18px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                Verify My Email
              </a>
            </div>
            <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin-top: 40px;">
              If you didn't create an account on TaskPlay, you can safely ignore this email.
            </p>
          </div>
        `,
      });
    } else if (type === 'reset-password') {
      // 1. Generate Reset Link
      const link = await auth.generatePasswordResetLink(email);

      // 2. Send via Resend
      result = await resend.emails.send({
        from: 'TaskPlay <onboarding@resend.dev>',
        to: email,
        subject: 'Reset your TaskPlay password',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0A0F1E; color: white; padding: 40px; border-radius: 20px;">
            <h1 style="color: #4A90E2; font-size: 32px; font-weight: 900; margin-bottom: 20px;">Reset Password</h1>
            <p style="color: rgba(255,255,255,0.6); line-height: 1.6; font-size: 16px;">
              We received a request to reset your password. Click the button below to secure your account.
            </p>
            <div style="margin: 40px 0;">
              <a href="${link}" style="background-color: #4A90E2; color: white; padding: 18px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: rgba(255,255,255,0.3); font-size: 12px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
              This link will expire soon. If you didn't request a password reset, please contact support or update your security settings.
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true, data: result });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Email API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
