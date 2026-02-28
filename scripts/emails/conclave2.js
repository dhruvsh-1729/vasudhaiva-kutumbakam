#!/usr/bin/env node
/**
 * VK4 Conclave Reminder (Maileroo + Prisma)
 *
 * Deliverability-focused:
 * - Short reminder (logistics first)
 * - Minimal links
 * - Tracking disabled
 * - Attach 2 PDFs (Invitation + Student Impact Initiative)
 *
 * Env:
 * - MAILEROO_API_KEY (used by ../maileroo-client)
 * - DATABASE_URL (Prisma)
 * Optional:
 * - MAIL_FROM_EMAIL, MAIL_FROM_NAME, MAIL_REPLY_TO, MAIL_REPLY_TO_NAME
 * - MAIL_CONCURRENCY, MAIL_JITTER_MIN_MS, MAIL_JITTER_MAX_MS, MAIL_STOP_AFTER_FAILURES
 * - VK4_INVITATION_PDF_PATH, VK4_STUDENT_IMPACT_PDF_PATH
 */

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const maileroo = require("../maileroo-client");

const prisma = new PrismaClient();

const CONFIG = {
  fromEmail: process.env.MAIL_FROM_EMAIL || "vk4.ki.oar@vk4.maileroo.app",
  fromName: process.env.MAIL_FROM_NAME || "VK Competition",
  replyToEmail: process.env.MAIL_REPLY_TO || "vk4.ki.oar@gmail.com",
  replyToName: process.env.MAIL_REPLY_TO_NAME || "Support",

  // Email subject is generated dynamically (starts in X days)
  subjectBase: "Reminder: VK4 Conclave (Mumbai) — 16 to 22 January 2026",

  concurrency: Number(process.env.MAIL_CONCURRENCY || 6),
  jitterMsMin: Number(process.env.MAIL_JITTER_MIN_MS || 120),
  jitterMsMax: Number(process.env.MAIL_JITTER_MAX_MS || 380),
  stopAfterFailures: Number(process.env.MAIL_STOP_AFTER_FAILURES || 50),

  useTestUsersOnly: false,
  testUsers: [{ email: "dhruvsh2003@gmail.com", name: "Dhruv Shah" }],
};

// ---- Attachments (2 PDFs) ----
const ATTACHMENTS_CONFIG = [
  {
    envKey: "VK4_INVITATION_PDF_PATH",
    defaultPath: path.join(__dirname, "VK4_Invitation.pdf"),
    file_name: "VK4_Invitation.pdf",
    content_type: "application/pdf",
  },
  {
    envKey: "VK4_STUDENT_IMPACT_PDF_PATH",
    defaultPath: path.join(__dirname, "Student Impact Initiative.pdf"),
    file_name: "VK4_Student_Impact_Initiative.pdf",
    content_type: "application/pdf",
  },
];

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function randInt(min, max) {
  const a = Math.ceil(min);
  const b = Math.floor(max);
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function msDay() {
  return 24 * 60 * 60 * 1000;
}

function daysUntil(dateIso) {
  const now = new Date();
  const target = new Date(dateIso);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / msDay());
}

function getSubject() {
  const d = daysUntil("2026-01-16T00:00:00+05:30");
  if (d === 3) return `Only 3 days to go — ${CONFIG.subjectBase}`;
  if (d > 0 && d < 10) return `Starts in ${d} days — ${CONFIG.subjectBase}`;
  return CONFIG.subjectBase;
}

let _cachedAttachments = null;

function loadAttachmentsOnce() {
  if (_cachedAttachments) return _cachedAttachments;

  const attachments = [];

  for (const a of ATTACHMENTS_CONFIG) {
    const p = (process.env[a.envKey] || a.defaultPath || "").trim();
    if (!p) continue;

    if (!fs.existsSync(p)) {
      throw new Error(
        `Attachment missing: ${a.envKey} points to "${p}" but file not found. Set env var or place file at default path.`
      );
    }

    const buf = fs.readFileSync(p);
    const sizeMb = buf.length / (1024 * 1024);

    // Keep this conservative (many inboxes clamp at ~25MB total)
    if (sizeMb > 15) {
      throw new Error(`Attachment too large: "${p}" is ${sizeMb.toFixed(2)} MB. Try compressing it.`);
    }

    // attachments.push({
    //   file_name: a.file_name,
    //   content_type: a.content_type,
    //   content: buf.toString("base64"),
    //   inline: false,
    // });
  }

  if (attachments.length < 2) {
    console.warn(
      `⚠️ Attachments loaded: ${attachments.length}/2. (Expected 2 PDFs). Set VK4_INVITATION_PDF_PATH and VK4_STUDENT_IMPACT_PDF_PATH if needed.`
    );
  }

  _cachedAttachments = attachments;
  return attachments;
}

function getTemplate(userName) {
  const safeName = userName?.trim() ? userName.trim() : "Participant";

  const dates = "16 January 2026 to 22 January 2026";
  const venue = "August Kranti Maidan, Gowalia Tank, Tardeo, Mumbai - 400026";

  // Use ONE map link + ONE registration link (keep it light)
  const mapsUrl = "https://maps.app.goo.gl/rnKiMYu5hmQTmLAZA";
  const registerUrl = "https://vk.jyot.in/vk4-registration";

  // Copy/paste only (no href) to reduce link-heavy signals
  const exploreVk = "https://vk.jyot.in";
  const exploreJyot = "https://jyot.in";

  const d = daysUntil("2026-01-16T00:00:00+05:30");
  const countdownLine = d === 3 ? "Only 3 days to go." : d > 0 ? `Starts in ${d} days.` : "Now live / ongoing.";

  const theme =
    "“Sankraman Kaal (Transition Period) – Reviving Ancient Wisdom for a Just and Unified World.”";

  const htmlContent = `<!doctype html>
<html>
  <body style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.55; color:#111;">
    <p>Hi ${escapeHtml(safeName)},</p>

    <p><strong>Reminder: VK4 Conclave starts soon.</strong><br/>
    ${escapeHtml(countdownLine)} We’d love to have you visit VK 4.0 (Vasudhaiva Kutumbakam Ki Oar) in Mumbai.</p>

    <p><strong>VK4 Conclave</strong><br/>
      Dates: ${escapeHtml(dates)}<br/>
      Venue: ${escapeHtml(venue)}<br/>
      Map: <a href="${mapsUrl}">Google Maps</a>
    </p>

    <p>
      Registration: <a href="${registerUrl}">${registerUrl}</a><br/>
    </p>

    <p style="margin-top: 10px;">
      Officially supported by the Ministry of External Affairs (MEA), Government of India.<br/>
      Theme: ${escapeHtml(theme)}
    </p>

    <p style="margin-top: 10px; margin-bottom: 0;"><strong>Student engagement opportunities</strong></p>
    <ul style="margin-top: 6px;">
      <li>Supreme Court of Nyay (Moot Court)</li>
      <li>Nalanda Vaad (National Debate)</li>
      <li>Model United Nations (MUN)</li>
      <li>Street Plays (Social Awareness)</li>
    </ul>

    <p style="margin-top: 10px;">
      If your institution wants to organize a group visit as an academic field trip, reply to this email and we’ll coordinate.
    </p>

    <p style="margin-top: 10px;">
      Inquiries (WhatsApp/Call):<br/>
      Prasham Sheth: +91 9769279552<br/>
      Jainil Shah: +91 8097585108<br/>
      Dhruv Shah: +91 9137828829
    </p>

    <p style="margin-top: 10px;">
      More info (copy/paste):<br/>
      ${escapeHtml(exploreVk)}<br/>
      ${escapeHtml(exploreJyot)}
    </p>

    <p>If you have any questions, just reply to this email.</p>

    <p>Regards,<br/>${escapeHtml(CONFIG.fromName)}<br/>Jyot Foundation</p>

    <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
    <p style="color:#666; font-size:12px;">
      You’re receiving this message because you registered for VK Competition.
      To stop future updates, reply with “unsubscribe”.
    </p>
  </body>
</html>`;

  const textContent = `Hi ${safeName},

Reminder: VK4 Conclave starts soon.
${countdownLine} We’d love to have you visit VK 4.0 (Vasudhaiva Kutumbakam Ki Oar) in Mumbai.

VK4 Conclave
Dates: ${dates}
Venue: ${venue}
Map: ${mapsUrl}

Registration: ${registerUrl}

Officially supported by the Ministry of External Affairs (MEA), Government of India.
Theme: ${theme}

Student engagement opportunities:
- Supreme Court of Nyay (Moot Court)
- Nalanda Vaad (National Debate)
- Model United Nations (MUN)
- Street Plays (Social Awareness)

If your institution wants to organize a group visit as an academic field trip, reply to this email and we’ll coordinate.

Inquiries (WhatsApp/Call):
Prasham Sheth: +91 9769279552
Jainil Shah: +91 8097585108
Dhruv Shah: +91 9137828829

More info (copy/paste):
${exploreVk}
${exploreJyot}

If you have any questions, just reply to this email.

Regards,
${CONFIG.fromName}
Jyot Foundation

You’re receiving this message because you registered for VK Competition.
To stop future updates, reply with “unsubscribe”.
`;

  return { subject: getSubject(), htmlContent, textContent };
}

async function fetchUsers() {
  if (CONFIG.useTestUsersOnly) return CONFIG.testUsers;
  return prisma.user.findMany({ select: { email: true, name: true } });
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function sendToUser(user) {
  const email = user?.email?.trim();
  if (!email) return { ok: false, email: null, reason: "missing_email" };

  const name = user?.name || "Participant";
  const tpl = getTemplate(name);

  const attachments = loadAttachmentsOnce();

  // Keep your existing payload shape (since you're using ../maileroo-client),
  // but include Maileroo's native "attachments" objects too.
  const payload = {
    sender: { email: CONFIG.fromEmail, name: CONFIG.fromName },
    to: [{ email, name }],
    subject: tpl.subject,
    htmlContent: tpl.htmlContent,
    textContent: tpl.textContent,

    // Deliverability: disable tracking if your client passes it through
    tracking: false,

    // Attachments: Maileroo expects {file_name, content_type, content(base64)} :contentReference[oaicite:1]{index=1}
    attachments,

    // Slightly “important” headers (not a guarantee)
    headers: {
      "X-Entity-Ref-ID": `vk4-reminder-${Date.now()}`,
      "Importance": "high",
      "X-Priority": "1",
      "Priority": "urgent",
    },
  };

  if (CONFIG.replyToEmail) payload.replyTo = { email: CONFIG.replyToEmail, name: CONFIG.replyToName };

  const jitter = randInt(CONFIG.jitterMsMin, CONFIG.jitterMsMax);
  if (jitter > 0) await sleep(jitter);

  const res = await maileroo.sendTransacEmail(payload);
  const msgId = (res && res.body && res.body.messageId) || res?.messageId || res?.data?.reference_id;
  return { ok: true, email, msgId };
}

async function main() {
  const usersRaw = await fetchUsers();
  const users = usersRaw.filter((u) => u?.email && String(u.email).trim().length > 3);

  console.log(`Found ${users.length} user(s). Sending VK4 reminder with concurrency=${CONFIG.concurrency}...`);

  // Preload attachments once (fail fast if missing)
  loadAttachmentsOnce();

  let ok = 0;
  let fail = 0;

  for (const batch of chunk(users, CONFIG.concurrency)) {
    const results = await Promise.allSettled(batch.map(sendToUser));
    for (const r of results) {
      if (r.status === "fulfilled" && r.value.ok) {
        ok++;
        console.log(`✅ Sent to ${r.value.email}${r.value.msgId ? ` (id: ${r.value.msgId})` : ""}`);
      } else {
        fail++;
        console.error(`❌ Send failed:`, r.status === "rejected" ? (r.reason?.response?.body || r.reason) : r.value);
      }
    }

    if (fail >= CONFIG.stopAfterFailures) {
      console.error(`🛑 Stopping early: failures (${fail}) >= stopAfterFailures (${CONFIG.stopAfterFailures})`);
      break;
    }
  }

  console.log("Done.");
  console.log(`✅ Success: ${ok}`);
  console.log(`❌ Failed:  ${fail}`);
}

main()
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch {}
  });
