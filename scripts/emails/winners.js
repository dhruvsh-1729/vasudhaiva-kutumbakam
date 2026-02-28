#!/usr/bin/env node
/**
 * VK Competition — Winners Announcement (Maileroo + Prisma)
 *
 * Deliverability-focused:
 * - Simple, neutral wording (no promo language)
 * - Minimal HTML
 * - No link-bombing
 *
 * Env:
 * - MAILEROO_API_KEY (used by ../maileroo-client)
 * - DATABASE_URL (Prisma)
 * Optional:
 * - MAIL_FROM_EMAIL, MAIL_FROM_NAME, MAIL_REPLY_TO, MAIL_REPLY_TO_NAME
 * - MAIL_CONCURRENCY, MAIL_JITTER_MIN_MS, MAIL_JITTER_MAX_MS, MAIL_STOP_AFTER_FAILURES
 */

require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const maileroo = require("../maileroo-client");

const prisma = new PrismaClient();

const CONFIG = {
  fromEmail: process.env.MAIL_FROM_EMAIL || "vk4.ki.oar@vk4.maileroo.app",
  fromName: process.env.MAIL_FROM_NAME || "VK Competition",
  replyToEmail: process.env.MAIL_REPLY_TO || "vk4.ki.oar@gmail.com",
  replyToName: process.env.MAIL_REPLY_TO_NAME || "Support",

  subject: "VK Competition results — final round winners",

  concurrency: Number(process.env.MAIL_CONCURRENCY || 6),
  jitterMsMin: Number(process.env.MAIL_JITTER_MIN_MS || 120),
  jitterMsMax: Number(process.env.MAIL_JITTER_MAX_MS || 380),
  stopAfterFailures: Number(process.env.MAIL_STOP_AFTER_FAILURES || 50),

  // testing
  useTestUsersOnly: false,
  testUsers: [{ email: "dhruvsh2003@gmail.com", name: "Dhruv Shah" }],
};

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

function getWinners() {
  return {
    poetry: [
      { rank: 1, name: "Suyash Shukla", college: "Tata Institute of Social Sciences" },
      { rank: 2, name: "Maddela Devendra Yadav", college: "Jain University" },
      { rank: 3, name: "Jainil Shah", college: "Mithibai College of Arts" },
    ],
    meme: [
      { rank: 1, name: "Dhruv Shah", college: "K J Somaiya College" },
      { rank: 2, name: "Pari Kenia", college: "SVKM's Narsee Monjee College of Commerce and Economics" },
      { rank: 3, name: "Prathmesh Parab", college: "MCC College" },
    ],
    singing: [
      { rank: 1, name: "Dhruv Solanki", college: "Sardar Patel Institute of Technology" },
      { rank: 2, name: "Rahul Ratda", college: "S K Somaiya" },
      { rank: 3, name: "Priyal Gutka", college: "R A Podar College" },
    ],
    painting: [
      { rank: 1, name: "Yash Shah", college: "D J Sanghvi" },
      { rank: 2, name: "Vama Dedhia", college: "K J Somaiya" },
      { rank: 3, name: "Nikhil Patel", college: "S M Shetty" },
    ],
  };
}

function formatTextList(items) {
  return items.map((w) => `${w.rank}. ${w.name} — ${w.college}`).join("\n");
}

function formatHtmlList(items) {
  return `
<ul style="margin:6px 0 12px 18px; padding:0;">
  ${items
    .map(
      (w) =>
        `<li style="margin:3px 0;"><strong>${escapeHtml(w.name)}</strong> — ${escapeHtml(w.college)}</li>`
    )
    .join("")}
</ul>`;
}

function getTemplate(userName) {
  const safeName = userName?.trim() ? userName.trim() : "Participant";
  const winners = getWinners();

  const htmlContent = `<!doctype html>
<html>
  <body style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color:#111;">
    <p>Hi ${escapeHtml(safeName)},</p>

    <p>The final round results for VK Competition (remaining 4 categories) are below.</p>

    <p><strong>Poetry</strong></p>
    ${formatHtmlList(winners.poetry)}

    <p><strong>Meme Creations</strong></p>
    ${formatHtmlList(winners.meme)}

    <p><strong>Singing Composition</strong></p>
    ${formatHtmlList(winners.singing)}

    <p><strong>Painting</strong></p>
    ${formatHtmlList(winners.painting)}

    <p>If you have any questions, reply to this email.</p>

    <p>Regards,<br/>${escapeHtml(CONFIG.fromName)}</p>

    <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
    <p style="color:#666; font-size:12px;">
      You’re receiving this message because you registered for VK Competition.
      To stop future updates, reply with “unsubscribe”.
    </p>
  </body>
</html>`;

  const textContent = `Hi ${safeName},

The final round results for VK Competition (remaining 4 categories) are below.

Poetry
${formatTextList(winners.poetry)}

Meme Creations
${formatTextList(winners.meme)}

Singing Composition
${formatTextList(winners.singing)}

Painting
${formatTextList(winners.painting)}

If you have any questions, reply to this email.

Regards,
${CONFIG.fromName}

You’re receiving this message because you registered for VK Competition.
To stop future updates, reply with “unsubscribe”.
`;

  return { subject: CONFIG.subject, htmlContent, textContent };
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

  const payload = {
    sender: { email: CONFIG.fromEmail, name: CONFIG.fromName },
    to: [{ email, name }],
    subject: tpl.subject,
    htmlContent: tpl.htmlContent,
    textContent: tpl.textContent,
    // Optional headers (safe if your maileroo-client ignores them)
    headers: {
      "X-Entity-Ref-ID": `vk4-winners-${Date.now()}`,
    },
  };

  if (CONFIG.replyToEmail) payload.replyTo = { email: CONFIG.replyToEmail, name: CONFIG.replyToName };

  const jitter = randInt(CONFIG.jitterMsMin, CONFIG.jitterMsMax);
  if (jitter > 0) await sleep(jitter);

  const res = await maileroo.sendTransacEmail(payload);
  const msgId = (res && res.body && res.body.messageId) || res?.messageId;
  return { ok: true, email, msgId };
}

async function main() {
  const usersRaw = await fetchUsers();
  const users = usersRaw.filter((u) => u?.email && String(u.email).trim().length > 3);

  console.log(`Found ${users.length} user(s). Sending winners email with concurrency=${CONFIG.concurrency}...`);

  let ok = 0;
  let fail = 0;

  for (const batch of chunk(users, CONFIG.concurrency)) {
    const results = await Promise.allSettled(batch.map(sendToUser));
    for (const r of results) {
      if (r.status === "fulfilled" && r.value.ok) {
        ok++;
        console.log(`✅ Sent to ${r.value.email}${r.value.msgId ? ` (messageId: ${r.value.msgId})` : ""}`);
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
