/**
 * VK Competition - Email Sender (Primary-max while keeping competition details + PDF)
 *
 * IMPORTANT TRUTH:
 * You can’t guarantee Gmail Primary tab. But this version reduces the biggest
 * Promotions triggers while still including competition details and attaching a PDF.
 */

const brevo = require("@getbrevo/brevo");
const { PrismaClient } = require("@prisma/client");
const readline = require("readline");
const path = require("path");
const fs = require("fs");

// Load env
require("dotenv").config();

// ---------- Brevo setup ----------
const transactionalEmailsApi = new brevo.TransactionalEmailsApi();
if (!process.env.BREVO_API_KEY) {
  console.error("❌ BREVO_API_KEY is not set in environment variables.");
  process.exit(1);
}
transactionalEmailsApi.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

// ---------- Prisma setup ----------
const prisma = new PrismaClient();

// ---------- Helpers ----------
function askConfirmation(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y" || answer.trim().toLowerCase() === "yes");
    });
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function truncate(str, max = 180) {
  if (!str) return "";
  const s = String(str).trim().replace(/\s+/g, " ");
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function formatPrize(amount) {
  if (!amount) return "TBA";
  const num = typeof amount === "string" ? parseInt(amount.replace(/[^\d]/g, ""), 10) : amount;
  if (Number.isNaN(num)) return String(amount);
  return `₹${num.toLocaleString("en-IN")}`;
}

function formatDeadline(deadline) {
  if (!deadline) return "Ongoing";
  try {
    return new Date(deadline).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "Ongoing";
  }
}

/**
 * KEY CHANGE:
 * Don’t render competitions as repeated “styled sections” (digest fingerprint).
 * Render as plain text-like lines (minimal HTML, no borders, no “cards”).
 *
 * Also: reduce Promotions triggers by limiting count (TOP_N).
 */
function renderCompetitionsPlainLines(competitions, { includePrizes = true, maxItems = 4 } = {}) {
  const items = competitions.slice(0, maxItems);

  // HTML version: just paragraphs, no fancy container, no repeated styled block.
  const htmlLines = items
    .map((c) => {
      const title = escapeHtml(c.title || "Untitled competition");
      const desc = escapeHtml(truncate(c.description || "", 200));
      const deadline = escapeHtml(formatDeadline(c.deadline));

      const prizes = c.prizes || {};
      const first = prizes.first || prizes["1st"] || null;
      const second = prizes.second || prizes["2nd"] || null;
      const third = prizes.third || prizes["3rd"] || null;

      // Keep prizes but in a single plain line; avoid “marketing separators” like big pipes/badges
      const prizeLine =
        includePrizes && (first || second || third)
          ? `Prizes: ${[
              first ? `1st ${escapeHtml(formatPrize(first))}` : null,
              second ? `2nd ${escapeHtml(formatPrize(second))}` : null,
              third ? `3rd ${escapeHtml(formatPrize(third))}` : null,
            ]
              .filter(Boolean)
              .join(", ")}`
          : "";

      // Minimal & text-like
      return [
        `<p style="margin: 0 0 8px 0;"><strong>${title}</strong></p>`,
        desc ? `<p style="margin: 0 0 6px 0; color:#333;">${desc}</p>` : "",
        prizeLine ? `<p style="margin: 0 0 6px 0; color:#333;">${prizeLine}</p>` : "",
        `<p style="margin: 0 0 14px 0; color:#555;">Deadline: ${deadline}</p>`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  // Text version
  const textLines = items
    .map((c) => {
      const title = (c.title || "Untitled competition").trim();
      const desc = truncate(c.description || "", 220);
      const deadline = formatDeadline(c.deadline);

      const prizes = c.prizes || {};
      const first = prizes.first || prizes["1st"] || null;
      const second = prizes.second || prizes["2nd"] || null;
      const third = prizes.third || prizes["3rd"] || null;

      const prizeLine =
        includePrizes && (first || second || third)
          ? `Prizes: ${[
              first ? `1st ${formatPrize(first)}` : null,
              second ? `2nd ${formatPrize(second)}` : null,
              third ? `3rd ${formatPrize(third)}` : null,
            ]
              .filter(Boolean)
              .join(", ")}`
          : "";

      return [
        title,
        desc ? desc : "",
        prizeLine ? prizeLine : "",
        `Deadline: ${deadline}`,
        "", // spacing
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return { htmlLines, textLines };
}

/**
 * BEST “keep-details” template:
 * - Subject less promotional (avoid “winners”, “new categories open”, “update”)
 * - One plain URL total (not an anchor tag)
 * - Competitions rendered as plain lines, not “digest cards”
 * - Mentions PDF attachment (single-purpose feel)
 * - Small per-recipient uniqueness line to reduce “bulk identical” fingerprint
 */
function getEmailTemplate(userName, competitions) {
  const safeName = userName || "there";
  const baseUrl = "https://vkcompetition.jyot.in";
  const submitUrl = `${baseUrl}/main`;

  // Avoid promo words; keep neutral, personal
  const subject = "Vasudhaiva Kutumbakam Competition — updates (details inside)";

  // Limit competition items included in email body to reduce digest fingerprint
  const TOP_N = 4;
  const { htmlLines, textLines } = renderCompetitionsPlainLines(competitions, {
    includePrizes: true,
    maxItems: TOP_N,
  });

  // This tiny uniqueness helps reduce “bulk campaign” patterns
  const uniqueMarker = `Ref: ${Math.random().toString(16).slice(2, 10).toUpperCase()}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto; padding: 18px;">
  <p style="margin:0 0 12px 0;">Hi ${escapeHtml(safeName)},</p>

  <p style="margin:0 0 12px 0;">
    I’m sharing the current VK Online Competition updates below.
  </p>

  <p style="margin:0 0 10px 0;"><strong>Currently available competitions:</strong></p>

  ${htmlLines}

  <b>and 4 more categories namely Blog Writing, Street play creative expression, Lextoons and AI Short video.</b>

  <p style="margin:0 0 10px 0;">
    If you’d like to submit, use this page:
  </p>
  <p style="margin:0 0 14px 0; color:#222;">
    ${submitUrl}
  </p>

  <p style="margin:0 0 14px 0;">
    If you have any questions, just reply to this email.
  </p>

  <p style="margin:0 0 6px 0;">Thanks,<br/>Dhruv</p>
  <p style="margin:0; font-size: 12px; color:#777;">${uniqueMarker}</p>
</body>
</html>
  `.trim();

  const textContent = `
Hi ${safeName},

I’m sharing the current VK Competition details below, and I’ve also attached a PDF for easy reference.

Currently available competitions:

${textLines}

Submit here:
${submitUrl}

If you have any questions, just reply to this email.

Thanks,
Dhruv
${uniqueMarker}
  `.trim();

  return { subject, htmlContent, textContent };
}

// ---------- Send email ----------
async function sendEmail({ user, competitions, attachment, senderEmail }) {
  const userFirstName = (user.name || "").split(" ")[0] || "there";
  const template = getEmailTemplate(userFirstName, competitions);

  // Use SendSmtpEmail (like your script that lands in Primary)
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  // IMPORTANT: Human sender name generally performs better than brand sender name
  sendSmtpEmail.sender = {
    email: senderEmail || "vk4.ki.oar@gmail.com",
    name: "Dhruv",
  };

  sendSmtpEmail.to = [{ email: user.email, name: user.name || "Participant" }];

  // Reply-to as a real person
  sendSmtpEmail.replyTo = {
    email: senderEmail || "vk4.ki.oar@gmail.com",
    name: "Dhruv",
  };

  sendSmtpEmail.subject = template.subject;
  sendSmtpEmail.htmlContent = template.htmlContent;
  sendSmtpEmail.textContent = template.textContent;

  // Keep attachment
  sendSmtpEmail.attachment = attachment || [];

  // Reduce “bulk” fingerprint a little
  sendSmtpEmail.headers = {
    "X-Priority": "3",
    "Precedence": "personal",
    "X-Entity-Ref-ID": `vk-${Buffer.from(user.email).toString("base64")}-${Date.now()}`,
  };

  // If you suspect tags correlate with Promotions in your account, remove this.
  sendSmtpEmail.tags = ["vk-details-with-pdf"];

  return transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
}

// ---------- Main ----------
async function main() {
  console.log("=".repeat(60));
  console.log("📧 VK Competition - Email Sender (Keep details + PDF, Primary-max)");
  console.log("=".repeat(60));

  console.log("\n📚 Fetching published competitions from database...");
  const competitions = await prisma.competition.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  if (!competitions.length) {
    console.log("⚠️ No published competitions found.");
    process.exit(0);
  }

  console.log(`✅ Found ${competitions.length} published competitions.`);
  competitions.slice(0, 8).forEach((c) => {
    console.log(
      `   • ${c.title} (deadline: ${c.deadline ? new Date(c.deadline).toLocaleDateString() : "Ongoing"})`
    );
  });
  if (competitions.length > 8) console.log(`   …and ${competitions.length - 8} more`);

  // Attachment
  const PDF_FILENAME = "painting-competition.pdf";
  const pdfPath = path.join(__dirname, PDF_FILENAME);

  if (!fs.existsSync(pdfPath)) {
    console.error(`❌ PDF file "${PDF_FILENAME}" not found in ${__dirname}. Place it in the same folder as this script.`);
    process.exit(1);
  }

  const pdfBase64 = fs.readFileSync(pdfPath).toString("base64");
  const attachment = [{ name: PDF_FILENAME, content: pdfBase64 }];

  // Users (testing)
  // const users = [{ name: "Dhruv Shah", email: "dhruvsh2003@gmail.com" }];

  // Or DB:
  const users = await prisma.user.findMany({
    where: { isActive: true, isEmailVerified: true },
    select: { email: true, name: true },
  });

  console.log(`\n👥 Found ${users.length} users.`);

  console.log("\n" + "-".repeat(60));
  console.log("This will send: short personal email + competition details + PDF attachment.");
  console.log("-".repeat(60));

  const confirmed = await askConfirmation(`\nSend emails to ${users.length} users? (y/N): `);
  if (!confirmed) {
    console.log("\n❌ Cancelled. No emails sent.");
    process.exit(0);
  }

  console.log("\n🚀 Starting...\n");

  let successCount = 0;
  let failureCount = 0;
  const startTime = Date.now();

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    if (!user.email) continue;

    try {
      // A bit slower helps reduce bulk/campaign signature
      if (i > 0) await new Promise((resolve) => setTimeout(resolve, 3500)); // 3.5s

      const res = await sendEmail({
        user,
        competitions,
        attachment,
        senderEmail: "vk4.ki.oar@gmail.com",
      });

      const msgId = res?.body?.messageId || res?.messageId || "OK";
      console.log(`   [${i + 1}/${users.length}] ✓ ${user.email} (messageId: ${msgId})`);
      successCount++;
    } catch (err) {
      console.error(
        `   [${i + 1}/${users.length}] ✗ ${user.email}: ${
          err?.response?.body?.message || err.message || "Unknown error"
        }`
      );
      failureCount++;
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("\n" + "=".repeat(60));
  console.log("Done!");
  console.log(`   Sent: ${successCount} | Failed: ${failureCount} | Time: ${duration}s`);
  console.log("=".repeat(60));

  console.log("\nReality check:");
  console.log("- PDF attachments + multi-item content increases Promotions probability.");
  console.log("- This script keeps details but removes the strongest newsletter/digest fingerprints.");
  console.log("- For the biggest improvement: send from an authenticated custom domain (SPF/DKIM/DMARC) in Brevo.");
}

main()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      // ignore
    }
  });
