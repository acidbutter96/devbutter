export type EmailTemplateId = "user-receipt" | "admin-notification" | "user-reply";

export interface EmailSampleData {
    userName: string;
    userEmail: string;
    adminName: string;
    adminEmail: string;
    submittedAt: string;
    formSource: string;
    message: string;
    phoneNumber?: string;
    company?: string;
    projectName?: string;
    replyMessage?: string;
    replySentAt?: string;
}

export interface EmailTemplate {
    id: EmailTemplateId;
    label: string;
    description: string;
    subject: string;
    preheader: string;
    previewRecipients: {
        from: string;
        to: string;
    };
    previewData: EmailSampleData;
    buildHtml: (data: EmailSampleData) => string;
}

const palette = {
    outerBg: "#0f1120",
    surface: "#141628",
    border: "rgba(255, 255, 255, 0.08)",
    accentPink: "#F64C6F",
    accentPinkStrong: "#FF007F",
    accentTeal: "#28B1BE",
    accentGreen: "#04D361",
    textPrimary: "#ffffff",
    textSecondary: "rgba(255, 255, 255, 0.78)",
    subtleText: "rgba(255, 255, 255, 0.62)",
    mutedText: "rgba(255, 255, 255, 0.52)",
};

function escapeHtml(value: string): string {
    return String(value).replace(/[&<>"']/g, char => {
        switch (char) {
            case "&":
                return "&amp;";
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case '"':
                return "&quot;";
            case "'":
                return "&#39;";
            default:
                return char;
        }
    });
}

function formatParagraphs(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
        return "";
    }
    const paragraphs = trimmed
        .split(/\n{2,}/)
        .map(part => part.trim())
        .filter(part => part.length > 0);

    if (paragraphs.length === 0) {
        return "";
    }

    return paragraphs
        .map((part, index) => {
            const margin = index === paragraphs.length - 1 ? 0 : 16;
            return `<p style="margin:0 0 ${margin}px 0; font-size:16px; line-height:1.6; color:${palette.textSecondary};">${escapeHtml(part)}</p>`;
        })
        .join("");
}

function renderInfoList(items: Array<{ label: string; value: string }>): string {
    if (items.length === 0) {
        return "";
    }

    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0;">` +
        `<tbody>` +
        items
            .map((item, index) => {
                const border = index === items.length - 1 ? "none" : `1px solid ${palette.border}`;
                return `<tr>` +
                    `<td style="padding:12px 0; border-bottom:${border};">` +
                    `<span style="display:block; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; font-weight:600; color:${palette.subtleText}; margin-bottom:4px;">${escapeHtml(item.label)}</span>` +
                    `<span style="display:block; font-size:16px; line-height:1.5; color:${palette.textSecondary};">${escapeHtml(item.value)}</span>` +
                    `</td>` +
                    `</tr>`;
            })
            .join("") +
        `</tbody>` +
        `</table>`;
}

function renderEmailShell(preheader: string, inner: string): string {
    const year = new Date().getFullYear();
    const safePreheader = escapeHtml(preheader);

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="dark light" />
<title>DevButter</title>
</head>
<body style="margin:0; padding:0; background-color:${palette.outerBg}; color:${palette.textPrimary}; font-family:'Roboto','Helvetica Neue',Arial,sans-serif;">
  <div style="display:none; visibility:hidden; opacity:0; height:0; width:0; overflow:hidden; color:${palette.textSecondary};">${safePreheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${palette.outerBg}; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:${palette.surface}; border-radius:18px; overflow:hidden; border:1px solid ${palette.border}; box-shadow:0 24px 60px rgba(8, 11, 26, 0.45);">
          <tr>
            <td style="padding:28px 32px 12px;">
              <span style="display:inline-block; padding:8px 18px; border-radius:999px; background:rgba(255, 255, 255, 0.05); color:${palette.subtleText}; font-size:12px; letter-spacing:0.08em; font-weight:700; text-transform:uppercase;">DevButter</span>
            </td>
          </tr>
          ${inner}
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin-top:16px;">
          <tr>
            <td style="text-align:center; font-size:12px; color:${palette.mutedText}; padding:12px 24px; line-height:1.5;">
              <p style="margin:0 0 4px 0;">© ${year} DevButter. All rights reserved.</p>
              <p style="margin:0;"><a href="https://devbutter.com" style="color:${palette.accentTeal}; text-decoration:none;">devbutter.com</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const emailTemplates: EmailTemplate[] = [
    {
        id: "user-receipt",
        label: "User confirmation",
        description: "Automatic message confirming the form submission and reinforcing the next step.",
        subject: "We received your message!",
        preheader: "Thanks for reaching out. I am reviewing your message and will get back soon with next steps.",
    previewRecipients: {
      from: "DevButter <oi@devbutter.com>",
      to: "Luna Costa <luna.costa@example.com>",
    },
        previewData: {
            userName: "Luna Costa",
            userEmail: "luna.costa@example.com",
            adminName: "Admin",
      adminEmail: "oi@devbutter.com",
            submittedAt: "November 3, 2025 at 10:42 AM (BRT)",
            formSource: "Form - Get In Touch section",
            message: "Hi Admin! I am building a live course platform and would love to chat about partnering on the branding and the site.\n\nI have a few references and would like to know about your availability over the next few weeks.",
        },
        buildHtml: data => {
            const firstName = data.userName.split(" ")[0] || data.userName;
            const messageHtml = formatParagraphs(data.message);
            const adminMailHref = `mailto:${encodeURIComponent(data.adminEmail)}`;

            const summaryMessage = messageHtml || `<p style="margin:0; font-size:16px; line-height:1.6; color:${palette.textSecondary};">Message received without additional content.</p>`;

            const inner = `
<tr>
  <td style="height:4px; background:linear-gradient(90deg, ${palette.accentPinkStrong} 0%, ${palette.accentTeal} 100%);"></td>
</tr>
<tr>
  <td style="padding:24px 32px 8px;">
    <h1 style="margin:0 0 16px 0; font-size:26px; line-height:1.35; color:${palette.textPrimary};">I received your message, ${escapeHtml(firstName)}!</h1>
    <p style="margin:0; font-size:16px; line-height:1.6; color:${palette.textSecondary};">Thanks for sharing your project. I am already reviewing what you sent and will follow up shortly with the next steps.</p>
  </td>
</tr>
<tr>
  <td style="padding:16px 32px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0;">
      <tr>
        <td style="background:rgba(40, 177, 190, 0.14); border:1px solid rgba(40, 177, 190, 0.32); border-radius:16px; padding:20px;">
          <p style="margin:0 0 12px 0; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; font-weight:600; color:${palette.subtleText};">Message details</p>
          <p style="margin:0 0 12px 0; font-size:14px; line-height:1.5; color:${palette.textSecondary};">Sent on ${escapeHtml(data.submittedAt)}</p>
          ${summaryMessage}
          <p style="margin:16px 0 0 0; font-size:14px; color:${palette.subtleText};">Form: ${escapeHtml(data.formSource)}</p>
        </td>
      </tr>
    </table>
  </td>
</tr>
<tr>
  <td style="padding:24px 32px 0;">
    <p style="margin:0 0 20px 0; font-size:16px; line-height:1.6; color:${palette.textSecondary};">Meanwhile, feel free to browse the portfolio and see other projects that came to life with DevButter.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0;">
      <tr>
        <td>
          <a href="https://devbutter.com" style="display:inline-block; padding:14px 26px; border-radius:999px; background:linear-gradient(120deg, ${palette.accentPinkStrong}, ${palette.accentPink}); color:${palette.textPrimary}; font-weight:600; text-decoration:none;">Browse portfolio</a>
        </td>
      </tr>
    </table>
  </td>
</tr>
<tr>
  <td style="padding:24px 32px 32px;">
    <p style="margin:0 0 16px 0; font-size:16px; line-height:1.6; color:${palette.textSecondary};">If you would like to add anything else, just reply to this email. I would love to keep the conversation going.</p>
    <p style="margin:0 0 8px 0; font-size:16px; line-height:1.6; color:${palette.textSecondary};">Cheers,<br/><strong style="color:${palette.textPrimary};">${escapeHtml(data.adminName)}</strong><br/>DevButter</p>
    <p style="margin:0; font-size:14px; line-height:1.6; color:${palette.subtleText};">Direct contact: <a href="${adminMailHref}" style="color:${palette.accentTeal}; text-decoration:none;">${escapeHtml(data.adminEmail)}</a></p>
  </td>
</tr>`;

            return renderEmailShell("Thanks for reaching out. I am reviewing your message and will get back soon with next steps.", inner);
        },
    },
    {
        id: "admin-notification",
        label: "Internal notification",
        description: "Alert sent to you letting you know a new message just arrived in the form.",
        subject: "New message on DevButter",
        preheader: "Someone new just submitted the form. Review the details to reply quickly.",
    previewRecipients: {
      from: "DevButter Forms <no-reply@devbutter.com>",
      to: "Admin <oi@devbutter.com>",
    },
        previewData: {
            userName: "Luna Costa",
            userEmail: "luna.costa@example.com",
            adminName: "Admin",
      adminEmail: "oi@devbutter.com",
            submittedAt: "November 3, 2025 at 10:42 AM (BRT)",
            formSource: "Form - Get In Touch section",
            message: "Hi Admin! I am building a live course platform and would love to chat about partnering on the branding and the site.\n\nI have a few references and would like to know about your availability over the next few weeks.",
            phoneNumber: "+55 (11) 99888-7766",
            company: "Nebula Labs",
            projectName: "Immersive courses platform",
        },
        buildHtml: data => {
            const infoItems = [
                { label: "Name", value: data.userName },
                { label: "Email", value: data.userEmail },
                { label: "Phone", value: data.phoneNumber ?? "" },
                { label: "Company", value: data.company ?? "" },
                { label: "Project", value: data.projectName ?? "" },
                { label: "Received at", value: data.submittedAt },
                { label: "Source", value: data.formSource },
            ].filter(item => item.value.trim().length > 0);

            const infoHtml = renderInfoList(infoItems);
            const messageHtml = formatParagraphs(data.message) || `<p style="margin:0; font-size:16px; line-height:1.6; color:${palette.textSecondary};">No additional message was provided.</p>`;

            const adminPanelUrl = "https://devbutter.com/admin";

            const inner = `
<tr>
  <td style="height:4px; background:linear-gradient(90deg, ${palette.accentGreen} 0%, ${palette.accentTeal} 100%);"></td>
</tr>
<tr>
  <td style="padding:24px 32px 8px;">
    <h1 style="margin:0 0 12px 0; font-size:26px; line-height:1.35; color:${palette.textPrimary};">New form submission</h1>
    <p style="margin:0; font-size:16px; line-height:1.6; color:${palette.textSecondary};">${escapeHtml(data.userName)} just submitted the form. Review the details below to respond while the momentum is high.</p>
  </td>
</tr>
<tr>
  <td style="padding:20px 32px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0;">
      <tr>
        <td style="background:rgba(255, 255, 255, 0.04); border:1px solid ${palette.border}; border-radius:16px; padding:20px;">
          ${infoHtml}
        </td>
      </tr>
    </table>
  </td>
</tr>
<tr>
  <td style="padding:20px 32px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0;">
      <tr>
        <td style="background:rgba(246, 76, 111, 0.14); border:1px solid rgba(246, 76, 111, 0.35); border-radius:16px; padding:20px;">
          <p style="margin:0 0 12px 0; font-size:12px; letter-spacing:0.08em; font-weight:600; text-transform:uppercase; color:${palette.subtleText};">Message</p>
          ${messageHtml}
        </td>
      </tr>
    </table>
  </td>
</tr>
<tr>
  <td style="padding:24px 32px 0;">
    <p style="margin:0 0 16px 0; font-size:16px; line-height:1.6; color:${palette.textSecondary};">Reply within the next 24 hours to keep the ideal response time.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0;">
      <tr>
        <td>
          <a href="${adminPanelUrl}" style="display:inline-block; padding:14px 26px; border-radius:999px; background:linear-gradient(120deg, ${palette.accentPinkStrong}, ${palette.accentPink}); color:${palette.textPrimary}; font-weight:600; text-decoration:none;">Open admin panel</a>
        </td>
      </tr>
    </table>
  </td>
</tr>
<tr>
  <td style="padding:24px 32px 32px;">
    <p style="margin:0; font-size:14px; line-height:1.6; color:${palette.subtleText};">Quick tip: mark the message as answered as soon as you finish the follow-up to keep the history tidy.</p>
  </td>
</tr>`;

            return renderEmailShell("A new message just landed in the form. See who it is and what they need.", inner);
        },
    },
    {
        id: "user-reply",
        label: "Personalized reply",
        description: "Base template to reply to incoming leads with an initial response and next steps.",
        subject: "About your project — next steps",
        preheader: "Thanks again for the interest! Here are a few starting ideas and what happens next.",
    previewRecipients: {
      from: "Admin | DevButter <oi@devbutter.com>",
      to: "Luna Costa <luna.costa@example.com>",
    },
        previewData: {
            userName: "Luna Costa",
            userEmail: "luna.costa@example.com",
            adminName: "Admin",
      adminEmail: "oi@devbutter.com",
            submittedAt: "November 3, 2025 at 10:42 AM (BRT)",
            formSource: "Form - Get In Touch section",
            message: "Hi Admin! I am building a live course platform and would love to chat about partnering on the branding and the site.\n\nI have a few references and would like to know about your availability over the next few weeks.",
            replyMessage: "Thanks for sharing more about the platform, Luna! The project is exactly the kind of digital experience I love to build.\n\nHere are the next steps so we can start working together:\n\n1. Quick 30-minute call to align expectations and priorities.\n2. Send a tailored proposal with timeline and investment.\n3. Kick-off within 7 days after the proposal is approved.",
            replySentAt: "November 3, 2025 at 6:05 PM (BRT)",
        },
        buildHtml: data => {
            const replyHtml = formatParagraphs(data.replyMessage ?? "");
            const originalHtml = formatParagraphs(data.message) || `<p style="margin:0; font-size:16px; line-height:1.6; color:${palette.textSecondary};">Original message without additional content.</p>`;
            const adminMailHref = `mailto:${encodeURIComponent(data.adminEmail)}`;

            const inner = `
<tr>
  <td style="height:4px; background:linear-gradient(90deg, ${palette.accentPinkStrong} 0%, ${palette.accentGreen} 100%);"></td>
</tr>
<tr>
  <td style="padding:24px 32px 8px;">
    <h1 style="margin:0 0 16px 0; font-size:26px; line-height:1.35; color:${palette.textPrimary};">Ready for the next steps?</h1>
    <p style="margin:0; font-size:16px; line-height:1.6; color:${palette.textSecondary};">${escapeHtml(data.userName)}, it was great to learn more about your project. Here are a few key points to move us forward.</p>
  </td>
</tr>
<tr>
  <td style="padding:16px 32px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0;">
      <tr>
        <td style="background:rgba(246, 76, 111, 0.14); border:1px solid rgba(246, 76, 111, 0.35); border-radius:16px; padding:20px;">
          <p style="margin:0 0 12px 0; font-size:12px; letter-spacing:0.08em; font-weight:600; text-transform:uppercase; color:${palette.subtleText};">Reply sent on ${escapeHtml(data.replySentAt ?? data.submittedAt)}</p>
          ${replyHtml}
        </td>
      </tr>
    </table>
  </td>
</tr>
<tr>
  <td style="padding:20px 32px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0;">
      <tr>
        <td style="background:rgba(255, 255, 255, 0.04); border:1px solid ${palette.border}; border-radius:16px; padding:20px;">
          <p style="margin:0 0 12px 0; font-size:12px; letter-spacing:0.08em; font-weight:600; text-transform:uppercase; color:${palette.subtleText};">Summary of the original message</p>
          ${originalHtml}
          <p style="margin:16px 0 0 0; font-size:14px; color:${palette.subtleText};">Received on ${escapeHtml(data.submittedAt)} via ${escapeHtml(data.formSource)}</p>
        </td>
      </tr>
    </table>
  </td>
</tr>
<tr>
  <td style="padding:24px 32px 0;">
    <p style="margin:0 0 16px 0; font-size:16px; line-height:1.6; color:${palette.textSecondary};">What do you think about scheduling a quick call to align expectations and timelines?</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0;">
      <tr>
        <td>
          <a href="${adminMailHref}" style="display:inline-block; padding:14px 26px; border-radius:999px; background:linear-gradient(120deg, ${palette.accentTeal}, ${palette.accentGreen}); color:${palette.textPrimary}; font-weight:600; text-decoration:none;">Reply and schedule</a>
        </td>
      </tr>
    </table>
  </td>
</tr>
<tr>
  <td style="padding:24px 32px 32px;">
    <p style="margin:0; font-size:16px; line-height:1.6; color:${palette.textSecondary};">Thanks for the trust! I am excited to turn this idea into something remarkable.</p>
    <p style="margin:16px 0 0 0; font-size:16px; line-height:1.6; color:${palette.textSecondary};">Cheers,<br/><strong style="color:${palette.textPrimary};">${escapeHtml(data.adminName)}</strong><br/>DevButter</p>
  </td>
</tr>`;

            return renderEmailShell("Thanks again for the interest! Here are a few starting ideas and what happens next.", inner);
        },
    },
];
