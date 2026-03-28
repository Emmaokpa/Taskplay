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
      <p style="margin-bottom: 24px;">Please use the secure code below to finalize your registration and begin earning.</p>
      <div style="background-color: #f3f4f6; padding: 32px; border-radius: 8px; text-align: center; margin-bottom: 24px; border: 1px solid #e5e7eb;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${otpCode}</span>
      </div>
      <p style="font-size: 14px; text-align: center; color: #6b7280;">Expires in 15 minutes.</p>
    `;
  } else if (type === 'reset-password') {
    emailSubject = "Secure Password Reset Request";
    emailHeader = "Credential Security Update";
    emailBody = `
      <p style="margin-bottom: 24px;">A password reset was requested. Use the code below to update your security credentials.</p>
      <div style="background-color: #f3f4f6; padding: 32px; border-radius: 8px; text-align: center; margin-bottom: 24px; border: 1px solid #e5e7eb;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${otpCode}</span>
      </div>
    `;
  } else if (type === 'welcome') {
    emailSubject = "🚀 Your Earning Journey Begins | TaskPlay Nigeria";
    emailHeader = "You're In. Let's Get You Paid.";
    emailBody = `
      <p style="margin-bottom: 20px; font-weight: 500;">Welcome to the elite circle of earners on TaskPlay!</p>
      <p style="margin-bottom: 20px;">You are now part of a community where thousands of Nigerians are generating consistent rewards. Top-tier members are currently <strong>earning up to ₦100,000 monthly</strong> by staying active and consistent.</p>
      
      <div style="background-color: #fefce8; border: 1px solid #fef08a; padding: 20px; border-radius: 8px; margin-bottom: 24px; color: #854d0e;">
         <strong>🔥 High Demand Alert:</strong> New high-paying tasks and CPA loops refresh every 24 hours. Because of the high reward potential, these slots are claimed within minutes. <strong>Don't let others take your share today.</strong>
      </div>

      <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 24px;">
        <h3 style="margin-top: 0; color: #3b82f6; font-size: 16px;">How to Maximise Earnings:</h3>
        <ul style="margin: 0; padding-left: 20px; line-height: 1.8; color: #1e40af;">
          <li>Access the <strong>CPA Loop</strong> for tasks paying up to ₦5,000 each.</li>
          <li>Complete daily <strong>Social Missions</strong> for instant, effortless cash.</li>
          <li>Withdraw your earnings directly to any Nigerian Bank.</li>
        </ul>
      </div>

      <div style="text-align: center; margin-top: 32px;">
        <a href="https://taskplay.com.ng/dashboard" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(37,99,235,0.2);">Claim Your First Reward &rarr;</a>
      </div>
      <p style="font-size: 13px; color: #6b7280; text-align: center; margin-top: 24px;">Log in now to secure your spot for today's mission cycle.</p>
    `;
  } else if (type === 'rejection') {
    emailSubject = "Update: Task Submission Reviewed";
    emailHeader = "Review Completed";
    emailBody = `
      <p style="margin-bottom: 16px;">Your recent task proof was reviewed. We could not approve the submission for the following reason:</p>
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin-bottom: 24px; color: #991b1b;">
         "${reason || "Proof did not meet guidelines"}"
      </div>
      <p>Please review the task steps and resubmit from your dashboard.</p>
    `;
  } else if (type === 'broadcast') {
    emailSubject = subject || "TaskPlay Update";
    emailHeader = subject || "Notification";
    emailBody = content || "";
  }

  const templateHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${emailSubject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; color: #111827;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; padding: 20px;">
            <tr>
                <td align="center">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <tr>
                            <td style="padding: 40px;">
                                <div style="font-size: 24px; font-weight: bold; color: #3b82f6; margin-bottom: 8px;">TaskPlay</div>
                                <div style="height: 1px; background-color: #e5e7eb; margin: 24px 0;"></div>
                                <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 16px;">${emailHeader}</h2>
                                <div style="font-size: 16px; line-height: 1.6; color: #374151;">
                                    ${emailBody}
                                </div>
                                <div style="height: 1px; background-color: #e5e7eb; margin: 32px 0;"></div>
                                <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">
                                    Security Notice: This is an automated transactional message. If you did not expect this, please ignore it or contact our support team.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 30px; background-color: #f3f4f6; border-top: 1px solid #e5e7eb;">
                                <p style="color: #6b7280; font-size: 12px; margin: 0;">TaskPlay Nigeria &bull; Secured Rewards Hub</p>
                                <p style="color: #9ca3af; font-size: 11px; margin: 8px 0 0;">Lagos, Nigeria &bull; taskplay.com.ng</p>
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

