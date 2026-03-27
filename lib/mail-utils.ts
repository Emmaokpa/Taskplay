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
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set');
  }

  const resend = new Resend(apiKey);
  const fromAddress = 'TaskPlay Team <noreply@taskplay.com.ng>';

  let emailSubject = '';
  let emailHeader = '';
  let emailBody = '';

  if (type === 'verification') {
    emailSubject = "Verify your TaskPlay account";
    emailHeader = "Welcome to the Community! 🎉";
    emailBody = `
      <p style="font-size: 16px; color: rgba(255,255,255,0.6); margin-bottom: 24px;">Please use the secure verification code below to finalize your registration and begin your journey.</p>
      <div style="background-color: rgba(255,255,255,0.05); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.1);">
        <span style="font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #3b82f6;">${otpCode}</span>
      </div>
      <p style="font-size: 14px; text-align: center; color: rgba(255,255,255,0.3);">This code will expire in 15 minutes for your security.</p>
    `;
  } else if (type === 'reset-password') {
    emailSubject = "Secure Password Reset Request";
    emailHeader = "Security Update";
    emailBody = `
      <p style="font-size: 16px; color: rgba(255,255,255,0.6); margin-bottom: 24px;">A password reset was requested for your account. Use the code below to securely update your credentials.</p>
      <div style="background-color: rgba(255,255,255,0.05); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.1);">
        <span style="font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #3b82f6;">${otpCode}</span>
      </div>
      <p style="font-size: 14px; text-align: center; color: rgba(255,255,255,0.3);">If you did not request this, please ignore this email. Your account remains secure.</p>
    `;
  } else if (type === 'welcome') {
    emailSubject = "✨ Welcome to TaskPlay | Your Journey Starts Now";
    emailHeader = "Account Successfully Activated!";
    emailBody = `
      <p style="font-size: 16px; color: rgba(255,255,255,0.6); margin-bottom: 20px;">We're thrilled to have you as part of our growing community!</p>
      <p style="font-size: 16px; color: rgba(255,255,255,0.6); margin-bottom: 20px;">TaskPlay is designed to help you generate consistent digital rewards by completing simple, verified interactions.</p>
      <div style="background-color: rgba(59,130,246,0.1); border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 24px; border-radius: 0 12px 12px 0;">
        <h3 style="margin-top: 0; color: #3b82f6; font-size: 18px;">Next steps for you:</h3>
        <ul style="color: rgba(255,255,255,0.6); margin-bottom: 0; padding-left: 20px; line-height: 1.8;">
          <li>Visit your <strong>Activity Dashboard</strong> to see available tasks.</li>
          <li>Complete simple social engagements or app interactions.</li>
          <li>Watch your balance grow and withdraw directly to your account.</li>
        </ul>
      </div>
      <p style="font-size: 16px; color: rgba(255,255,255,0.6); margin-bottom: 24px;">New tasks are updated daily. Log in now to explore your first opportunities.</p>
      <div style="text-align: center;">
        <a href="https://taskplay.com.ng/dashboard" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: bold; font-size: 16px; shadow: 0 10px 20px rgba(37,99,235,0.2);">Enter Dashboard &rarr;</a>
      </div>
    `;
  } else if (type === 'rejection') {
    emailSubject = "Update Regarding Your Task Submission";
    emailHeader = "Submission Review Completed";
    emailBody = `
      <p style="font-size: 16px; color: rgba(255,255,255,0.6); margin-bottom: 20px;">Your recent task proof has been reviewed. Currently, we are unable to approve this submission due to the following:</p>
      <div style="background-color: rgba(239,68,68,0.1); border-left: 4px solid #ef4444; padding: 20px; border-radius: 4px; margin-bottom: 24px;">
         <p style="margin: 0; font-size: 16px; color: #ef4444; font-weight: 500;">"${reason || "The provided proof did not meet the specific task guidelines."}"</p>
      </div>
      <p style="font-size: 16px; color: rgba(255,255,255,0.6); margin-bottom: 24px;">You can review the guidelines and resubmit your proof at any time. We look forward to your next successful submission!</p>
      <div style="text-align: center;">
        <a href="https://taskplay.com.ng/dashboard" style="display: inline-block; background-color: #ef4444; color: #ffffff; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: bold; font-size: 16px;">Review & Resubmit &rarr;</a>
      </div>
    `;
  } else if (type === 'broadcast') {
    emailSubject = subject || "An update from TaskPlay Nigeria";
    emailHeader = subject || "Important Update";
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
    <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #05070A;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #05070A; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0A0F1E; border: 1px solid rgba(255,255,255,0.05); border-radius: 32px; overflow: hidden; box-shadow: 0 40px 100px -20px rgba(0,0,0,0.5);">
                        <tr>
                            <td align="center" style="padding: 40px 40px 20px;">
                                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 18px; margin-bottom: 24px; display: table; font-size: 30px; line-height: 60px; color: white; font-weight: 900; box-shadow: 0 10px 20px rgba(37,99,235,0.3); text-align: center;">T</div>
                                <h1 style="color: #ffffff; font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -1px;">TaskPlay</h1>
                                <p style="color: #3b82f6; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; margin: 8px 0 0;">Premium Rewards Hub</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0 40px;">
                                <div style="height: 1px; background: linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.05), rgba(255,255,255,0));"></div>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 32px 40px 10px;">
                                <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0;">${emailHeader}</h2>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 32px 40px 48px;">
                                <div style="color: rgba(255,255,255,0.6); font-size: 16px; line-height: 1.6; font-weight: 400;">
                                    ${emailBody}
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Engagement Tip -->
                        <tr>
                            <td align="center" style="padding: 0 40px 20px;">
                                <div style="padding: 16px; background-color: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.05); border-radius: 16px;">
                                    <p style="color: rgba(255,255,255,0.3); font-size: 11px; margin: 0; font-style: italic;">💡 Don't miss out! Drag this email to your <strong>Primary</strong> tab to ensure you never miss a reward update.</p>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td align="center" style="padding: 40px; background-color: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.03);">
                                <p style="color: rgba(255,255,255,0.1); font-size: 11px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 2px;">TaskPlay &copy; ${new Date().getFullYear()}</p>
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

  return await resend.emails.send({
    from: fromAddress,
    to: email,
    subject: emailSubject,
    html: templateHTML,
  });
}
