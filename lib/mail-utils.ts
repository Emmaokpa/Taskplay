import { Resend } from 'resend';

export interface EmailParams {
  email: string;
  type: 'verification' | 'reset-password' | 'welcome' | 'rejection' | 'broadcast';
  otpCode?: string;
  reason?: string;
  subject?: string;
  content?: string;
}

export async function sendEmail({ email, type, otpCode, reason, subject, content }: EmailParams) {
  const preserve = (text?: string) => text ? text.replace(/\n/g, '<br />') : '';
  const resendApiKey = process.env.RESEND_API_KEY;
  const brevoApiKey = process.env.BREVO_API_KEY;

  if (!resendApiKey && !brevoApiKey) {
    throw new Error('No email provider API key found (RESEND_API_KEY or BREVO_API_KEY)');
  }

  const fromName = 'TaskPlay Team';
  const fromEmail = 'noreply@taskplay.com.ng';
  const fromAddress = `${fromName} <${fromEmail}>`;

  let emailSubject = '';
  let emailHeader = '';
  let emailBody = '';

  if (type === 'verification') {
    emailSubject = "Verify your TaskPlay account";
    emailHeader = "Initial Security Verification";
    emailBody = `
      <p style="margin-bottom: 24px; font-weight: 500;">Secure your presence on TaskPlay. Use the cryptographic signature below to finalize your registration.</p>
      <div style="background-color: #f8fafc; padding: 40px; border-radius: 20px; text-align: center; margin-bottom: 24px; border: 2px dashed #e2e8f0;">
        <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #05070A; font-family: 'Courier New', Courier, monospace;">${otpCode}</span>
      </div>
      <p style="font-size: 13px; text-align: center; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Access Expires in 15 Minutes</p>
    `;
  } else if (type === 'reset-password') {
    emailSubject = "Secure Password Reset Request";
    emailHeader = "Credential Security Update";
    emailBody = `
      <p style="margin-bottom: 24px; font-weight: 500;">A security update was initiated for your credentials. If this was you, use the code below to reset your authentication node.</p>
      <div style="background-color: #f8fafc; padding: 40px; border-radius: 20px; text-align: center; margin-bottom: 24px; border: 2px dashed #e2e8f0;">
        <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #05070A; font-family: 'Courier New', Courier, monospace;">${otpCode}</span>
      </div>
      <p style="font-size: 13px; text-align: center; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Valid for single use</p>
    `;
  } else if (type === 'welcome') {
    emailSubject = "🚀 Your Earning Journey Begins | TaskPlay Nigeria";
    emailHeader = "You're In. Let's Get You Paid.";
    emailBody = `
      <p style="margin-bottom: 20px; font-weight: 700; color: #05070A; font-size: 18px;">Welcome to the high-performance rewards engine.</p>
      <p style="margin-bottom: 20px;">Your account is now fully synced with our rewards cluster. You've joined a community of elite earners generating consistent daily flow.</p>
      
      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 24px; border-radius: 16px; margin-bottom: 32px; color: #92400e;">
         <strong style="text-transform: uppercase; letter-spacing: 1px; font-size: 12px;">Immediate Insight:</strong><br/>
         <span style="font-size: 15px;">New high-yield missions refresh in <strong>< 24 hours</strong>. Claim your slots early to maximize your bankroll.</span>
      </div>

      <div style="background-color: #f0f7ff; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
        <h3 style="margin-top: 0; color: #1d4ed8; font-size: 15px; text-transform: uppercase; letter-spacing: 1px;">Profit Channels:</h3>
        <ul style="margin: 0; padding-left: 20px; line-height: 2; color: #1e40af; font-weight: 600;">
          <li>Social Mining: Low effort, instant credit.</li>
          <li>CPA Hub: High-yield campaigns (up to ₦5k+).</li>
          <li>Global Payouts: Zero latency withdraws.</li>
        </ul>
      </div>

      <div style="text-align: center; margin-top: 40px;">
        <a href="https://taskplay.com.ng/dashboard" style="display: inline-block; background-color: #05070A; color: #ffffff; padding: 20px 40px; border-radius: 16px; text-decoration: none; font-weight: 900; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">Launch Dashboard &rarr;</a>
      </div>
    `;
  } else if (type === 'rejection') {
    emailSubject = "Update: Task Submission Reviewed";
    emailHeader = "Review Completed";
    emailBody = `
      <p style="margin-bottom: 20px; font-weight: 500;">Review complete. Your recent task proof was analyzed and could not be validated for the following reason:</p>
      <div style="background-color: #fff1f2; border-radius: 16px; padding: 24px; margin-bottom: 32px; color: #e11d48; font-weight: 700; border: 1px solid #ffe4e6;">
         "${preserve(reason) || "Proof did not meet verification criteria"}"
      </div>
      <p style="margin-bottom: 32px;">We've reset the task for you. Please check the requirements and resubmit from your dashboard to claim your reward.</p>
      <div style="text-align: center;">
        <a href="https://taskplay.com.ng/dashboard" style="display: inline-block; background-color: #05070A; color: #ffffff; padding: 18px 36px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; text-transform: uppercase;">Resubmit Proof</a>
      </div>
    `;
  } else if (type === 'broadcast') {
    emailSubject = subject || "TaskPlay Update";
    emailHeader = subject || "Notification";
    emailBody = preserve(content);
  }

  const templateHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${emailSubject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fa; color: #1a1c1e;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7fa; padding: 20px 10px;">
            <tr>
                <td align="center">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.03);">
                        <!-- Header Section (Obsidian) -->
                        <tr>
                            <td style="background-color: #05070A; padding: 50px 40px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -1.5px; text-transform: uppercase;">TaskPlay</h1>
                                <p style="color: #3b82f6; margin: 8px 0 0; font-size: 10px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase;">Nigeria's Rewards Engine</p>
                            </td>
                        </tr>

                        <!-- Body Section -->
                        <tr>
                            <td style="padding: 48px 40px;">
                                <h2 style="font-size: 26px; font-weight: 900; color: #05070A; margin: 0 0 24px; tracking: -0.5px;">${emailHeader}</h2>
                                <div style="font-size: 16px; line-height: 1.7; color: #4b5563; font-weight: 500;">
                                    ${emailBody}
                                </div>
                                <div style="height: 1px; background-color: #f3f4f6; margin: 40px 0;"></div>
                                <p style="font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0; font-style: italic;">
                                    Security Notice: This is an automated transmission from TaskPlay Node Server. If you did not initiate this, please secure your account immediately or contact support.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer Section -->
                        <tr>
                            <td align="center" style="padding: 40px; background-color: #fafbfc; border-top: 1px solid #f3f4f6;">
                                <p style="color: #6b7280; font-size: 12px; font-weight: 800; margin: 0; letter-spacing: 2px; text-transform: uppercase;">TaskPlay Nigeria &bull; Secured Rewards Hub</p>
                                <p style="color: #9ca3af; font-size: 11px; margin: 12px 0 0;">Lagos, Nigeria &bull; taskplay.com.ng</p>
                                <div style="margin-top: 24px;">
                                    <a href="https://taskplay.com.ng/support" style="color: #3b82f6; text-decoration: none; font-size: 11px; font-weight: bold; margin: 0 10px;">Support Center</a>
                                    <span style="color: #e5e7eb;">|</span>
                                    <a href="https://taskplay.com.ng/terms" style="color: #3b82f6; text-decoration: none; font-size: 11px; font-weight: bold; margin: 0 10px;">Terms of Service</a>
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

  // ─── Direct Send Strategy ───────────────────────────────────────────
  try {
    if (brevoApiKey) {
      console.log(`[Email Utils] Attempting via BREVO to: ${email}`);
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'content-type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: fromName, email: fromEmail },
          to: [{ email: email }],
          subject: emailSubject,
          htmlContent: templateHTML
        })
      });

      if (response.ok) {
        const data = await response.json();
        return { data: { id: data.messageId }, error: null };
      } else {
        const errData = await response.json();
        throw new Error(`Brevo API error: ${errData.message || response.statusText}`);
      }
    }
  } catch (err) {
    console.warn(`[Email Utils] Brevo failed, falling back...`, err);
  }

  // Fallback to Resend if Brevo fails or isn't configured
  if (resendApiKey) {
     console.log(`[Email Utils] Sending via RESEND as primary or fallback to: ${email}`);
     const resend = new Resend(resendApiKey);
     return await resend.emails.send({
        from: fromAddress,
        to: email,
        subject: emailSubject,
        html: templateHTML,
     });
  }

  return { data: null, error: new Error('No working email provider.') };
}

