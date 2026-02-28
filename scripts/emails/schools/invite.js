#!/usr/bin/env node
/**
 * VK 4.0 — National Conclave Invitation Mailer
 * --------------------------------------------
 * Sends personalized invitation emails (with 2 attachments)
 * using Maileroo and a CSV file of colleges.
 *
 * Env Vars:
 * - MAILEROO_API_KEY
 * - MAIL_FROM_EMAIL, MAIL_FROM_NAME (optional)
 * - MAIL_REPLY_TO, MAIL_REPLY_TO_NAME (optional)
 *
 * Run:
 *   npm install csv-parser @prisma/client maileroo-client dotenv
 *   node invite-colleges.js
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const maileroo = require("../../maileroo-client");

const CONFIG = {
  csvFile: path.resolve(__dirname, "email3.csv"),
  attachments: [
    path.resolve(__dirname, "VK4_Invitation.pdf"),
    path.resolve(__dirname, "Student Impact Initiative.pdf"),
  ],

  fromEmail: process.env.MAIL_FROM_EMAIL || "vk4.ki.oar@vk4.maileroo.app",
  fromName: process.env.MAIL_FROM_NAME || "Jyot Foundation",
  replyToEmail: process.env.MAIL_REPLY_TO || "vk4.ki.oar@gmail.com",
  replyToName: process.env.MAIL_REPLY_TO_NAME || "Support Team",
  subject:
    "Invitation: National Conclave VK 4.0 | Supported by Ministry of External Affairs | Jan 16–22, 2026",

  concurrency: 5,
  jitterMsMin: 150,
  jitterMsMax: 400,
  testMode: false, // ✅ set to false for production
  testRecipient: { email: "dhruvsh2003@gmail.com", name: "Dhruv Shah" },
};

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
function randInt(min, max) {
  const a = Math.ceil(min);
  const b = Math.floor(max);
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

// ------------------------------------------------------------------
// Email Template
// ------------------------------------------------------------------
function getTemplate() {
  const MAPS_URL = "https://maps.app.goo.gl/rnKiMYu5hmQTmLAZA";

  const html = `
  <html>
  <body style="font-family:Arial, sans-serif; line-height:1.6; color:#111;">
    <p>Dear Sir/Madam,</p>
    <p>Warm Greetings from <strong>Jyot Foundation</strong>.</p>

    <p>
      It is our privilege to invite your esteemed institution to the 4th edition of our flagship national conclave,
      <strong>Vasudhaiva Kutumbakam Ki Oar (VK 4.0)</strong>, scheduled from <strong>16th to 22nd January 2026</strong>
      at the historic <strong>August Kranti Maidan, Mumbai</strong>.
      <br/>
      <strong>Venue (Google Maps):</strong> <a href="${MAPS_URL}">${MAPS_URL}</a>
    </p>

    <p>
      Officially supported by the <strong>Ministry of External Affairs (MEA), Government of India</strong>, the conclave is themed:<br/>
      <em>“Sankraman Kaal (Transition Period) – Reviving Ancient Wisdom for a Just and Unified World.”</em>
    </p>

    <p><strong>Student Engagement Opportunities</strong><br/>
      • Supreme Court of Nyay (Moot Court)<br/>
      • Nalanda Vaad (National Debate)<br/>
      • Model United Nations (MUN)<br/>
      • Street Plays (Social Awareness)
    </p>

    <p><strong>Academic Significance & Field Exposure</strong><br/>
      The conclave provides an excellent opportunity for field exposure aligned with NEP 2020 objectives.
      Exhibitions include:
      <ul>
        <li><strong>75 Years of the Indian Constitution:</strong> A journey through India's democratic evolution.</li>
        <li><strong>Geopolitical Ethics:</strong> Applying Indian Joint Family values to global challenges.</li>
      </ul>
    </p>

    <p><strong>Institutional Coordination</strong><br/>
      We invite your institution to organize a group visit as an academic field trip. Jyot Foundation can assist with transportation fares.
    </p>

    <p>
      <strong>Registration Portal:</strong> <a href="https://vk.jyot.in/vk4-registration">https://vk.jyot.in/vk4-registration</a><br/>
      <strong>Venue (Google Maps):</strong> <a href="${MAPS_URL}">${MAPS_URL}</a><br/>
      <strong>Inquiries:</strong> Prasham Sheth (+91 9769279552)
    </p>

    <p>
      The formal <strong>Invitation</strong> and <strong>Student Impact Initiative</strong> PDFs are attached.
      We look forward to the presence of your faculty and students at this significant national gathering.
    </p>

    <p>
      With warm regards,<br/>
      <strong>Jainil Shah – 8097585108</strong><br/>
      <strong>Dhruv Shah – 9137828829</strong><br/>
      Team Member, Jyot Foundation
    </p>
  </body>
  </html>
  `;

  const text = `
Dear Sir/Madam,

Warm Greetings from Jyot Foundation.

It is our privilege to invite your esteemed institution to the 4th edition of our flagship national conclave,
Vasudhaiva Kutumbakam Ki Oar (VK 4.0), scheduled from 16th to 22nd January 2026 at the historic August Kranti Maidan, Mumbai.
Venue (Google Maps): ${MAPS_URL}

Officially supported by the Ministry of External Affairs (MEA), Government of India, the conclave is themed:
"Sankraman Kaal (Transition Period) – Reviving Ancient Wisdom for a Just and Unified World."

Student Engagement Opportunities:
- Supreme Court of Nyay (Moot Court)
- Nalanda Vaad (National Debate)
- Model United Nations (MUN)
- Street Plays (Social Awareness)

Academic Significance & Field Exposure:
The conclave provides excellent NEP 2020-aligned field exposure.
Highlights:
- 75 Years of the Indian Constitution
- Geopolitical Ethics

Institutional Coordination:
We invite your institution to organize a group visit as an academic field trip.
Jyot Foundation can assist with transportation fares.

Registration Portal: https://vk.jyot.in/vk4-registration
Venue (Google Maps): ${MAPS_URL}
Inquiries: Prasham Sheth - +91 9769279552

The formal Invitation and Student Impact Initiative PDFs are attached.

With warm regards,
Jainil Shah - 8097585108
Dhruv Shah - 9137828829
Team Member, Jyot Foundation
`;

  return { html, text };
}

// ------------------------------------------------------------------
// CSV Reader
// ------------------------------------------------------------------
function readCsv() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(CONFIG.csvFile)
      .pipe(csv())
      .on("data", (row) => {
        const email = row["Email ID"]?.trim();
        const name = row["College Name"]?.trim();
        if (email) results.push({ email, name });
      })
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

// ------------------------------------------------------------------
// Mailer
// ------------------------------------------------------------------
async function sendEmail(to) {
  const { html, text } = getTemplate();
  const payload = {
    sender: { email: CONFIG.fromEmail, name: CONFIG.fromName },
    to: [{ email: to.email, name: to.name }],
    subject: CONFIG.subject,
    htmlContent: html,
    textContent: text,
    headers: {
      "X-Priority": "1 (Highest)",
      "X-MSMail-Priority": "High",
      Importance: "High",
    },
    attachments: CONFIG.attachments.map((f) => ({
      name: path.basename(f),
      content: fs.readFileSync(f).toString("base64"),
    })),
  };
  if (CONFIG.replyToEmail)
    payload.replyTo = { email: CONFIG.replyToEmail, name: CONFIG.replyToName };

  const jitter = randInt(CONFIG.jitterMsMin, CONFIG.jitterMsMax);
  await sleep(jitter);
  const res = await maileroo.sendTransacEmail(payload);
  return res;
}

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------
(async () => {
  const allRecipients = CONFIG.testMode
    ? [CONFIG.testRecipient]
    : await readCsv();

  console.log(
    `Sending VK4 invitation to ${allRecipients.length} recipient(s)...`
  );

  let sent = 0,
    failed = 0;
  for (const r of allRecipients) {
    try {
      await sendEmail(r);
      console.log(`✅ Sent to ${r.email}`);
      sent++;
    } catch (err) {
      failed++;
      console.error(`❌ Failed to ${r.email}:`, err.response?.body || err);
    }
  }

  console.log(`\nDone. ✅ ${sent} sent, ❌ ${failed} failed.`);
})();
