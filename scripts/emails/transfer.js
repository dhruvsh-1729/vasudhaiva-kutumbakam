#!/usr/bin/env node
/**
 * Online competitions ended + encourage physical-mode participation (Maileroo + Prisma)
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
  baseUrl: "https://vk.jyot.in",
  fromEmail: process.env.MAIL_FROM_EMAIL || "vk4.ki.oar@vk4.maileroo.app",
  fromName: process.env.MAIL_FROM_NAME || "Vasudhaiva Kutumbakam 4.0",
  replyToEmail: process.env.MAIL_REPLY_TO || "vk4.ki.oar@gmail.com",
  replyToName: process.env.MAIL_REPLY_TO_NAME || "Support",

  subject: "VK: Online competitions ended — results coming soon + Physical competitions (16–22 Jan, Mumbai)",
  resultsText: "The online competitions have ended. Results will be announced very soon on the website landing page.",
  physicalDatesText: "16 Jan to 22 Jan",
  physicalCityText: "Mumbai",
  websiteDetailsText: "vk.jyot.in",
  registrationUrl: "https://vk.jyot.in/vk4-registration",

  attachPdf: false, // set true if you want to attach something
  pdfFilename: "vk4-physical-competitions-details.pdf",

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

function getOnlineEndedTemplate(userName) {
  const safeName = userName?.trim() ? userName.trim() : "Participant";

  const baseUrl = CONFIG.baseUrl.replace(/\/+$/, "");
  const detailsUrl = baseUrl; // vk.jyot.in landing
  const registrationUrl = CONFIG.registrationUrl;

  const subject = CONFIG.subject;

  const htmlContent = `<!doctype html>
<html>
  <body style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111;">
    <p>Hi ${escapeHtml(safeName)},</p>

    <p>${escapeHtml(CONFIG.resultsText)}</p>

    <p>
      Meanwhile, we encourage you to participate wholeheartedly in the <strong>main physical-mode competitions</strong>
      from <strong>${escapeHtml(CONFIG.physicalDatesText)}</strong> in <strong>${escapeHtml(CONFIG.physicalCityText)}</strong>
      as part of <strong>Vasudhaiva Kutumbakam 4.0</strong>.
    </p>

    <p>
      Details are available here:<br/>
      <a href="${detailsUrl}">${escapeHtml(CONFIG.websiteDetailsText)}</a>
    </p>

    <p>
      To register for the competitions, please use this link (and get a chance to meet renowned personalities and win even better prizes):<br/>
      <a href="${registrationUrl}">${registrationUrl}</a>
    </p>

    <p>
      If you have any questions, you can reply to this email at ${escapeHtml(CONFIG.replyToEmail)}.
    </p>

    <p>Thanks,<br/>
    ${escapeHtml(CONFIG.fromName)}</p>

    <hr style="border:none;border-top:1px solid #eee;margin:18px 0;" />

    <p style="color:#666; font-size:12px;">
      You’re receiving this because you registered for VK competitions.
      If you don’t want updates, reply with “unsubscribe”.
    </p>
  </body>
</html>`;

  const textContent = `Hi ${safeName},

${CONFIG.resultsText}

Meanwhile, we encourage you to participate wholeheartedly in the main physical-mode competitions from ${CONFIG.physicalDatesText} in ${CONFIG.physicalCityText} as part of Vasudhaiva Kutumbakam 4.0.

Details: ${detailsUrl}

To register (and get a chance to meet renowned personalities and win even better prizes):
${registrationUrl}

Questions? Reply to this email: ${CONFIG.replyToEmail}

Thanks,
${CONFIG.fromName}

You’re receiving this because you registered for VK competitions.
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
  const template = getOnlineEndedTemplate(name);

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
      console.error(
        `🛑 Stopping early: failureCount (${failureCount}) >= stopAfterFailures (${CONFIG.stopAfterFailures}).`
      );
      break;
    }
  }

  console.log("Done sending.");
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed:  ${failureCount}`);
}

main()
  .catch((err) => {
    console.error("Fatal error in online-ended announcement script:", err);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      // ignore
    }
  });
