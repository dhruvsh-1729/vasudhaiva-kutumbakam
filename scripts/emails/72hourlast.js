#!/usr/bin/env node
/**
 * Fast-ish + safer bulk sender (Maileroo + Prisma)
 *
 * - Uses controlled concurrency (send N at a time)
 * - Adds small jitter to avoid "machine-perfect" burst patterns
 * - Optional PDF attachment
 *
 * Env:
 * - MAILEROO_API_KEY (used by ../maileroo-client)
 * - DATABASE_URL (Prisma)
 */

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const maileroo = require("../maileroo-client");

const prisma = new PrismaClient();

// ----------------------
// CONFIG (edit these)
// ----------------------
const CONFIG = {
  baseUrl: "https://vkcompetition.jyot.in",
  fromEmail: process.env.MAIL_FROM_EMAIL || "vk4.ki.oar@vk4.maileroo.app",
  fromName: process.env.MAIL_FROM_NAME || "VK Competition",
  replyToEmail: process.env.MAIL_REPLY_TO || "vk4.ki.oar@gmail.com",
  replyToName: process.env.MAIL_REPLY_TO_NAME || "Support",

  subject: "VK Competition: submission deadline (30 Dec, 11:59 PM IST)",
  deadlineText: "30 December, 11:59 PM IST",

  attachPdf: true,
  pdfFilename: "painting-competition.pdf",

  // FAST SENDING SETTINGS (tune these)
  concurrency: Number(process.env.MAIL_CONCURRENCY || 8), // 5-10 is usually a decent range
  jitterMsMin: Number(process.env.MAIL_JITTER_MIN_MS || 80),
  jitterMsMax: Number(process.env.MAIL_JITTER_MAX_MS || 250),

  // Safety: stop if things are going badly
  stopAfterFailures: Number(process.env.MAIL_STOP_AFTER_FAILURES || 50),

  // testing:
  useTestUsersOnly: false,
  testUsers: [{ email: "dhruvsh2003@gmail.com", name: "Dhruv Shah" }],
};

// ----------------------
// Helpers
// ----------------------
function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randInt(min, max) {
  const a = Math.ceil(min);
  const b = Math.floor(max);
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

// Plain-ish template (less promo-y) — but you added prizes, which is more promo.
// If inboxing matters, consider removing the "win cash prizes" line.
function getInboxFriendlyTemplate(userName) {
  const safeName = userName?.trim() ? userName.trim() : "Participant";
  const baseUrl = CONFIG.baseUrl.replace(/\/+$/, "");
  const submitUrl = `${baseUrl}/main`;
  const forumUrl = `${baseUrl}/forum`;

  const subject = CONFIG.subject;

  const htmlContent = `<!doctype html>
<html>
  <body style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111;">
    <p>Hi ${escapeHtml(safeName)},</p>

    <p>This is a quick reminder that VK Competition submissions close on <strong>${escapeHtml(
      CONFIG.deadlineText
    )}</strong>.</p>

    <p>
      You can submit here for the open categories and get a chance to win cash prizes worth more than 1.5 lakh rupees.<br/>
      <a href="${submitUrl}">${submitUrl}</a>
    </p>

    <p>
      If you have questions, the forum is here or you can reply to this email at ${escapeHtml(
        CONFIG.replyToEmail
      )}:<br/>
      <a href="${forumUrl}">${forumUrl}</a>
    </p>

    <p>Thanks,<br/>
    ${escapeHtml(CONFIG.fromName)}</p>

    <hr style="border:none;border-top:1px solid #eee;margin:18px 0;" />

    <p style="color:#666; font-size:12px;">
      You’re receiving this because you registered for VK Competition.
      If you don’t want updates, reply with “unsubscribe”.
    </p>
  </body>
</html>`;

  const textContent = `Hi ${safeName},

This is a quick reminder that VK Competition submissions close on ${CONFIG.deadlineText}.

You can submit here for the open categories and get a chance to win cash prizes worth more than 1.5 lakh rupees:
${submitUrl}

Forum: ${forumUrl}
Or reply to this email: ${CONFIG.replyToEmail}

Thanks,
${CONFIG.fromName}

You’re receiving this because you registered for VK Competition.
To stop updates, reply with “unsubscribe”.
`;

  return { subject, htmlContent, textContent };
}

function loadOptionalPdfAttachment() {
  if (!CONFIG.attachPdf) return null;

  const pdfPath = path.join(__dirname, CONFIG.pdfFilename);
  if (!fs.existsSync(pdfPath)) {
    console.warn(`⚠️ PDF "${CONFIG.pdfFilename}" not found in ${__dirname}. Sending WITHOUT attachment.`);
    return null;
  }

  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfBase64 = pdfBuffer.toString("base64");
  return [{ name: CONFIG.pdfFilename, content: pdfBase64 }];
}

async function fetchUsers() {
  if (CONFIG.useTestUsersOnly) return CONFIG.testUsers;

  return prisma.user.findMany({
    select: { email: true, name: true },
  });
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function sendToUser(user, attachment) {
  const email = user?.email?.trim();
  if (!email) return { ok: false, email: null, reason: "missing_email" };

  const name = user?.name || "Participant";
  const template = getInboxFriendlyTemplate(name);

  const payload = {
    sender: { email: CONFIG.fromEmail, name: CONFIG.fromName },
    to: [{ email, name }],
    subject: template.subject,
    htmlContent: template.htmlContent,
    textContent: template.textContent,
    ...(attachment ? { attachment } : {}),
  };

  if (CONFIG.replyToEmail) {
    payload.replyTo = { email: CONFIG.replyToEmail, name: CONFIG.replyToName };
  }

  // jitter to avoid a perfect burst pattern
  const jitter = randInt(CONFIG.jitterMsMin, CONFIG.jitterMsMax);
  if (jitter > 0) await sleep(jitter);

  const response = await maileroo.sendTransacEmail(payload);
  const msgId = (response && response.body && response.body.messageId) || response?.messageId;

  return { ok: true, email, msgId };
}

// ----------------------
// Main
// ----------------------
async function main() {
  const attachment = loadOptionalPdfAttachment();
  const usersRaw = await fetchUsers();

  // keep only users with emails
  const users = usersRaw.filter((u) => u?.email && String(u.email).trim().length > 3);

  console.log(`Found ${users.length} user(s). Sending with concurrency=${CONFIG.concurrency}...`);
  if (CONFIG.attachPdf && !attachment) console.log("Attachment disabled automatically (missing file).");

  let successCount = 0;
  let failureCount = 0;

  const batches = chunk(users, CONFIG.concurrency);

  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b];

    const results = await Promise.allSettled(batch.map((u) => sendToUser(u, attachment)));

    for (const r of results) {
      if (r.status === "fulfilled") {
        const out = r.value;
        if (out.ok) {
          successCount++;
          console.log(`✅ Sent to ${out.email}${out.msgId ? ` (messageId: ${out.msgId})` : ""}`);
        } else {
          failureCount++;
          console.log(`⚠️ Skipped user: ${out.reason || "unknown"}`);
        }
      } else {
        failureCount++;
        console.error(`❌ Send failed:`, r.reason?.response?.body || r.reason);
      }
    }

    // Stop early if failing too much (prevents reputation burn)
    if (failureCount >= CONFIG.stopAfterFailures) {
      console.error(`🛑 Stopping early: failureCount (${failureCount}) >= stopAfterFailures (${CONFIG.stopAfterFailures}).`);
      break;
    }
  }

  console.log("Done sending.");
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed:  ${failureCount}`);
}

main()
  .catch((err) => {
    console.error("Fatal error in deadline reminder script:", err);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      // ignore
    }
  });
