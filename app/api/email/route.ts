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

    const body = await req.json();
    const { email, type, reason, subject, content } = body;

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
    } else if (type === 'rejection') {
      emailSubject = "⚠️ Task Submission Rejected";
      emailHeader = "Update on your submission";
      emailBody = `
        <p style="font-size: 16px; color: rgba(255,255,255,0.6); margin-bottom: 20px;">Your recent task proof was reviewed and unfortunately rejected for the following reason:</p>
        <div style="background-color: rgba(239,68,68,0.1); border-left: 4px solid #ef4444; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
           <p style="margin: 0; font-size: 16px; color: #ef4444; font-weight: 500;">"${reason || "Proof did not match the task requirements."}"</p>
        </div>
        <p style="font-size: 16px; color: rgba(255,255,255,0.6); margin-bottom: 24px;">Don't worry! You can correct the issue and re-submit your proof, or try another available task to keep earning.</p>
        <div style="text-align: center;">
          <a href="https://taskplay.ng/dashboard" style="display: inline-block; background-color: #ef4444; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">Try Another Task &rarr;</a>
        </div>
      `;
    } else if (type === 'broadcast') {
      emailSubject = subject || "An update from TaskPlay Nigeria";
      emailHeader = subject || "Important Update";
      emailBody = content || "";
    } else {
      return NextResponse.json({ error: 'Invalid email type.' }, { status: 400 });
    }

    const templateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${emailSubject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #05070A;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #05070A; padding: 40px 20px;">
              <tr>
                  <td align="center">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0A0F1E; border: 1px solid rgba(255,255,255,0.05); border-radius: 32px; overflow: hidden; box-shadow: 0 40px 100px -20px rgba(0,0,0,0.5);">
                          
                          <!-- Header -->
                          <tr>
                              <td align="center" style="padding: 40px 40px 20px;">
                                  <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 18px; margin-bottom: 24px; display: table; font-size: 30px; line-height: 60px; color: white; font-weight: 900; box-shadow: 0 10px 20px rgba(37,99,235,0.3); text-align: center;">T</div>
                                  <h1 style="color: #ffffff; font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -1px;">TaskPlay</h1>
                                  <p style="color: #3b82f6; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; margin: 8px 0 0;">Premium Rewards Hub</p>
                              </td>
                          </tr>

                          <!-- Title Divider -->
                          <tr>
                              <td style="padding: 0 40px;">
                                  <div style="height: 1px; background: linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.05), rgba(255,255,255,0));"></div>
                              </td>
                          </tr>

                          <!-- Sub-Header -->
                          <tr>
                              <td align="center" style="padding: 32px 40px 10px;">
                                  <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0;">${emailHeader}</h2>
                              </td>
                          </tr>

                          <!-- Main Content -->
                          <tr>
                              <td style="padding: 32px 40px 48px;">
                                  <div style="color: rgba(255,255,255,0.6); font-size: 16px; line-height: 1.6; font-weight: 400;">
                                      ${emailBody}
                                  </div>
                              </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                              <td align="center" style="padding: 40px; background-color: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.03);">
                                  <p style="color: rgba(255,255,255,0.1); font-size: 11px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 2px;">TaskPlay Nigeria &copy; ${new Date().getFullYear()}</p>
                                  <p style="color: rgba(255,255,255,0.05); font-size: 10px; margin: 8px 0 0;">Elevating the digital economy. Instant rewards, real cash.</p>
                                  <div style="margin-top: 24px;">
                                      <a href="https://taskplay.com.ng" style="color: #3b82f6; text-decoration: none; font-size: 12px; font-weight: 700;">Visit Website</a>
                                      <span style="color: rgba(255,255,255,0.05); margin: 0 12px;">•</span>
                                      <a href="https://taskplay.com.ng/support" style="color: #3b82f6; text-decoration: none; font-size: 12px; font-weight: 700;">Get Support</a>
                                  </div>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>
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
