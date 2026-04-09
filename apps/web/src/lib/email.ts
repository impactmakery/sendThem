import { Resend } from 'resend';

// ---------------------------------------------------------------------------
// Resend client
// ---------------------------------------------------------------------------

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@sendthem.org';
const FROM_NAME = 'SendThem';
const FROM = `${FROM_NAME} <${FROM_EMAIL}>`;

// ---------------------------------------------------------------------------
// Shared styles / layout helpers
// ---------------------------------------------------------------------------

const COLORS = {
  bg: '#0f172a',
  card: '#1e293b',
  border: '#334155',
  emerald: '#10b981',
  emeraldDark: '#059669',
  teal: '#0d9488',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  textBright: '#f8fafc',
  white: '#ffffff',
} as const;

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>SendThem</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${COLORS.bg};font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.bg};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${COLORS.card};border-radius:12px;overflow:hidden;border:1px solid ${COLORS.border};">
          <!-- Logo header -->
          <tr>
            <td style="padding:32px 40px 24px 40px;text-align:center;border-bottom:1px solid ${COLORS.border};">
              <span style="font-size:28px;font-weight:700;letter-spacing:-0.5px;">
                <span style="color:${COLORS.emerald};">Send</span><span style="color:${COLORS.teal};">Them</span>
              </span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid ${COLORS.border};text-align:center;">
              <p style="margin:0 0 8px 0;font-size:12px;color:${COLORS.textMuted};line-height:1.5;">
                You received this email because you have an account on SendThem.
                <br />
                If you no longer wish to receive these emails, you can update your notification preferences in your account settings.
              </p>
              <p style="margin:0;font-size:12px;color:${COLORS.textMuted};line-height:1.5;direction:rtl;">
                &#x200F;קיבלת מייל זה כי יש לך חשבון ב-SendThem.
                <br />
                אם אינך רוצה לקבל הודעות אלו, ניתן לעדכן את העדפות ההתראות בהגדרות החשבון שלך.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function divider(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr>
      <td style="border-top:1px solid ${COLORS.border};font-size:0;line-height:0;">&nbsp;</td>
    </tr>
  </table>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 16px 0;font-size:22px;font-weight:700;color:${COLORS.textBright};line-height:1.3;">${text}</h1>`;
}

function paragraph(text: string, dir: 'ltr' | 'rtl' = 'ltr'): string {
  return `<p style="margin:0 0 14px 0;font-size:15px;color:${COLORS.text};line-height:1.6;direction:${dir};text-align:${dir === 'rtl' ? 'right' : 'left'};">${text}</p>`;
}

function statBlock(label: string, value: string | number, color: string = COLORS.emerald): string {
  return `<td style="padding:12px 16px;text-align:center;background-color:${COLORS.bg};border-radius:8px;">
    <div style="font-size:24px;font-weight:700;color:${color};line-height:1.2;">${value}</div>
    <div style="font-size:12px;color:${COLORS.textMuted};margin-top:4px;">${label}</div>
  </td>`;
}

// ---------------------------------------------------------------------------
// Email: Welcome
// ---------------------------------------------------------------------------

function welcomeHtml(name: string): string {
  const firstName = name.split(' ')[0] || name;

  const content = `
    ${heading(`Welcome to SendThem, ${firstName}!`)}
    ${paragraph('Your account is ready. You can now create campaigns, upload recipient lists, and send WhatsApp messages at scale using Meta\'s official Cloud API.')}
    ${paragraph('Here\'s how to get started:')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px 0;">
      <tr>
        <td style="padding:10px 0;font-size:15px;color:${COLORS.text};line-height:1.6;">
          <span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;background-color:${COLORS.emerald};color:${COLORS.bg};border-radius:50%;font-size:13px;font-weight:700;margin-right:12px;">1</span>
          Purchase credits to send messages
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-size:15px;color:${COLORS.text};line-height:1.6;">
          <span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;background-color:${COLORS.emerald};color:${COLORS.bg};border-radius:50%;font-size:13px;font-weight:700;margin-right:12px;">2</span>
          Create a campaign and upload your Excel recipient list
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-size:15px;color:${COLORS.text};line-height:1.6;">
          <span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;background-color:${COLORS.emerald};color:${COLORS.bg};border-radius:50%;font-size:13px;font-weight:700;margin-right:12px;">3</span>
          Compose your message template and get Meta approval
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-size:15px;color:${COLORS.text};line-height:1.6;">
          <span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;background-color:${COLORS.emerald};color:${COLORS.bg};border-radius:50%;font-size:13px;font-weight:700;margin-right:12px;">4</span>
          Send and track delivery in real time
        </td>
      </tr>
    </table>

    ${divider()}

    <div dir="rtl" style="text-align:right;">
      ${heading(`!${firstName} ,ברוכים הבאים ל-SendThem`)}
      ${paragraph('החשבון שלך מוכן. כעת ניתן ליצור קמפיינים, להעלות רשימות נמענים ולשלוח הודעות WhatsApp בהיקף גדול באמצעות ה-API הרשמי של Meta.', 'rtl')}
      ${paragraph('<strong>&#x200F;איך להתחיל:</strong>', 'rtl')}
      ${paragraph('&#x200F;1. רכשו קרדיטים לשליחת הודעות<br/>&#x200F;2. צרו קמפיין והעלו רשימת נמענים מאקסל<br/>&#x200F;3. חברו תבנית הודעה וקבלו אישור מ-Meta<br/>&#x200F;4. שלחו ועקבו אחרי המסירה בזמן אמת', 'rtl')}
    </div>
  `;

  return layout(content);
}

// ---------------------------------------------------------------------------
// Email: Credit Purchase
// ---------------------------------------------------------------------------

function creditPurchaseHtml(name: string, credits: number, amount: number): string {
  const firstName = name.split(' ')[0] || name;
  const formattedAmount = `$${amount.toFixed(2)}`;
  const formattedCredits = credits.toLocaleString();

  const content = `
    ${heading('Purchase Confirmed')}
    ${paragraph(`Hi ${firstName}, your credit purchase was successful. Here are the details:`)}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px 0;background-color:${COLORS.bg};border-radius:8px;border:1px solid ${COLORS.border};">
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid ${COLORS.border};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:14px;color:${COLORS.textMuted};">Credits</td>
              <td style="font-size:16px;color:${COLORS.emerald};font-weight:700;text-align:right;">${formattedCredits}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:14px;color:${COLORS.textMuted};">Amount Paid</td>
              <td style="font-size:16px;color:${COLORS.textBright};font-weight:700;text-align:right;">${formattedAmount}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${paragraph('Your credits are available immediately. You can start sending campaigns right away.')}

    ${divider()}

    <div dir="rtl" style="text-align:right;">
      ${heading('הרכישה אושרה')}
      ${paragraph(`&#x200F;${firstName}, רכישת הקרדיטים בוצעה בהצלחה.`, 'rtl')}

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px 0;background-color:${COLORS.bg};border-radius:8px;border:1px solid ${COLORS.border};">
        <tr>
          <td style="padding:16px 20px;border-bottom:1px solid ${COLORS.border};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:14px;color:${COLORS.textMuted};text-align:right;">קרדיטים</td>
                <td style="font-size:16px;color:${COLORS.emerald};font-weight:700;text-align:left;">${formattedCredits}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:14px;color:${COLORS.textMuted};text-align:right;">סכום ששולם</td>
                <td style="font-size:16px;color:${COLORS.textBright};font-weight:700;text-align:left;">${formattedAmount}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      ${paragraph('&#x200F;הקרדיטים זמינים באופן מיידי. ניתן להתחיל לשלוח קמפיינים כעת.', 'rtl')}
    </div>
  `;

  return layout(content);
}

// ---------------------------------------------------------------------------
// Email: Campaign Complete
// ---------------------------------------------------------------------------

function campaignCompleteHtml(
  name: string,
  campaignName: string,
  stats: { sent: number; delivered: number; failed: number },
): string {
  const firstName = name.split(' ')[0] || name;
  const total = stats.sent;
  const successRate = total > 0 ? Math.round((stats.delivered / total) * 100) : 0;

  const content = `
    ${heading('Campaign Complete')}
    ${paragraph(`Hi ${firstName}, your campaign <strong>"${campaignName}"</strong> has finished sending. Here is the summary:`)}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="8" style="margin:0 0 20px 0;">
      <tr>
        ${statBlock('Sent', stats.sent.toLocaleString())}
        ${statBlock('Delivered', stats.delivered.toLocaleString())}
        ${statBlock('Failed', stats.failed.toLocaleString(), stats.failed > 0 ? '#ef4444' : COLORS.emerald)}
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px 0;">
      <tr>
        <td style="padding:16px 20px;background-color:${COLORS.bg};border-radius:8px;text-align:center;border:1px solid ${COLORS.border};">
          <span style="font-size:14px;color:${COLORS.textMuted};">Delivery Rate</span>
          <br />
          <span style="font-size:32px;font-weight:700;color:${successRate >= 90 ? COLORS.emerald : successRate >= 70 ? '#eab308' : '#ef4444'};">${successRate}%</span>
        </td>
      </tr>
    </table>

    ${paragraph('Log in to your dashboard to view the full delivery report and per-message status.')}

    ${divider()}

    <div dir="rtl" style="text-align:right;">
      ${heading('הקמפיין הושלם')}
      ${paragraph(`&#x200F;${firstName}, הקמפיין <strong>"${campaignName}"</strong> סיים את השליחה. הנה הסיכום:`, 'rtl')}

      <table role="presentation" width="100%" cellpadding="0" cellspacing="8" style="margin:0 0 20px 0;">
        <tr>
          ${statBlock('נשלחו', stats.sent.toLocaleString())}
          ${statBlock('נמסרו', stats.delivered.toLocaleString())}
          ${statBlock('נכשלו', stats.failed.toLocaleString(), stats.failed > 0 ? '#ef4444' : COLORS.emerald)}
        </tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px 0;">
        <tr>
          <td style="padding:16px 20px;background-color:${COLORS.bg};border-radius:8px;text-align:center;border:1px solid ${COLORS.border};">
            <span style="font-size:14px;color:${COLORS.textMuted};">אחוז מסירה</span>
            <br />
            <span style="font-size:32px;font-weight:700;color:${successRate >= 90 ? COLORS.emerald : successRate >= 70 ? '#eab308' : '#ef4444'};">${successRate}%</span>
          </td>
        </tr>
      </table>

      ${paragraph('&#x200F;היכנסו ללוח הבקרה לצפייה בדו&quot;ח המסירה המלא וסטטוס כל הודעה.', 'rtl')}
    </div>
  `;

  return layout(content);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject: 'Welcome to SendThem! | !ברוכים הבאים ל-SendThem',
      html: welcomeHtml(name),
    });
  } catch (error) {
    console.error('[email] Failed to send welcome email:', error);
  }
}

export async function sendCreditPurchaseEmail(
  to: string,
  name: string,
  credits: number,
  amount: number,
): Promise<void> {
  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject: `Purchase Confirmed: ${credits.toLocaleString()} credits | אישור רכישה: ${credits.toLocaleString()} קרדיטים`,
      html: creditPurchaseHtml(name, credits, amount),
    });
  } catch (error) {
    console.error('[email] Failed to send credit purchase email:', error);
  }
}

export async function sendCampaignCompleteEmail(
  to: string,
  name: string,
  campaignName: string,
  stats: { sent: number; delivered: number; failed: number },
): Promise<void> {
  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject: `Campaign "${campaignName}" Complete | הקמפיין "${campaignName}" הושלם`,
      html: campaignCompleteHtml(name, campaignName, stats),
    });
  } catch (error) {
    console.error('[email] Failed to send campaign complete email:', error);
  }
}
