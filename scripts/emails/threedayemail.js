#!/usr/bin/env node

// Load environment variables (BREVO_API_KEY, DATABASE_URL, NEXT_PUBLIC_BASE_URL, etc.)
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const brevo = require("@getbrevo/brevo");
const { PrismaClient } = require("@prisma/client");

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

// ---------- Email template ----------
function getThreeDayEmailTemplate(userName) {
  const safeName = userName || "Participant";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://vkcompetition.jyot.in";
  const forumUrl = `${baseUrl}/forum`;

  const subject = "⏰ 3 Days Left – Submit & Win in VK Competition!";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>3 Days Left – VK Competition</title>
      </head>
      <body style="margin:0; padding:0; background-color:#fff7ed; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width:640px; margin:0 auto; background-color:#ffffff; box-shadow:0 14px 30px rgba(0,0,0,0.08); border-radius:12px; overflow:hidden;">
          
          <div style="background:linear-gradient(135deg,#f97316,#dc2626); padding:28px 24px; color:#fff;">
            <p style="margin:0; font-size:14px; letter-spacing:2px; text-transform:uppercase; opacity:0.85;">Final Call</p>
            <h1 style="margin:8px 0 0; font-size:26px; font-weight:700;">Only 3 Days Left to Submit!</h1>
            <p style="margin:8px 0 0; font-size:14px; opacity:0.9;">Vasudhaiva Kutumbakam – The World is One Family</p>
          </div>

          <div style="padding:28px 24px; color:#111827;">
            <h2 style="margin:0 0 12px; font-size:20px; color:#b91c1c;">Hey ${safeName},</h2>
            <p style="margin:0 0 14px; font-size:15px; line-height:1.6;">
              This is it—just <strong>3 days</strong> left to submit your entries! Showcase how you leverage <strong>AI for good</strong> and make your mark while you’re in college.
            </p>

            <div style="background:#fff1f2; border:1px solid #fecdd3; border-radius:12px; padding:16px; margin:18px 0;">
              <h3 style="margin:0 0 10px; font-size:16px; color:#be123c;">🏆 Grand prizes across all categories</h3>
              <ul style="margin:0; padding-left:18px; color:#9f1239; font-size:14px; line-height:1.6;">
                <li><strong>AI Short Video</strong> – Big stage recognition and spotlight for top storytellers.</li>
                <li><strong>Creative Expression</strong> – Rewards for originality, craft, and impactful narratives.</li>
                <li><strong>Painting Competition</strong> – Showcase your art; concept note attached as PDF.</li>
              </ul>
              <p style="margin:10px 0 0; color:#9f1239; font-size:14px;">
                Winners will be celebrated at the main event, with exclusive exposure and prizes you don’t want to miss.
              </p>
            </div>

            <p style="margin:0 0 14px; font-size:15px; line-height:1.6;">
              Need help? Join fellow participants and ask questions in our new forum after reading the guidelines:
              <a href="${forumUrl}" style="color:#dc2626; text-decoration:none; font-weight:600;">${forumUrl}</a>
            </p>

            <div style="text-align:center; margin:22px 0;">
              <a href="${baseUrl}/main" style="display:inline-block; background:linear-gradient(135deg,#f97316,#dc2626); color:#ffffff; text-decoration:none; padding:12px 30px; border-radius:999px; font-weight:700; box-shadow:0 8px 20px rgba(220,38,38,0.3);">
                Submit Your Entry Now
              </a>
            </div>

            <p style="margin:0 0 12px; font-size:15px; line-height:1.6;">
              This is a <strong>once-in-a-lifetime campus opportunity</strong> to experiment, innovate, and show the world your best work.
            </p>
            <p style="margin:0 0 12px; font-size:15px; line-height:1.6;">
              See you at the finish line! 🚀
            </p>
          </div>

          <div style="padding:18px 24px; background:#f8fafc; border-top:1px solid #e5e7eb; text-align:center; color:#6b7280; font-size:12px;">
            VK Competition – Vasudhaiva Kutumbakam<br/>
            <span style="font-style:italic;">\"The World is One Family\"</span>
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
⏰ 3 Days Left to Submit – VK Competition

Hey ${safeName},

Only 3 days left to submit! Leverage AI for good and make your mark while you’re in college.

Grand prizes across:
- AI Short Video: spotlight for top storytellers
- Creative Expression: rewards for originality and impact
- Painting Competition: concept note attached (PDF)

Ask questions in our new forum: ${forumUrl}
Submit now: ${baseUrl}/main

Once-in-a-lifetime campus opportunity. See you at the finish line!

VK Competition – Vasudhaiva Kutumbakam
\"The World is One Family\"
  `;

  return { subject, htmlContent, textContent };
}

// ---------- Main script ----------
async function main() {
  const PDF_FILENAME = "painting-competition.pdf";
  const pdfPath = path.join(__dirname, PDF_FILENAME);
  if (!fs.existsSync(pdfPath)) {
    console.error(`❌ PDF file "${PDF_FILENAME}" not found in ${__dirname}. Place it in the same folder as this script.`);
    process.exit(1);
  }
  const pdfBase64 = fs.readFileSync(pdfPath).toString("base64");
  const attachment = [{ name: PDF_FILENAME, content: pdfBase64 }];

  // Test recipients plus all users
  const testRecipients = [{ email: "test@example.com", name: "Test User" }];
  const dbUsers = await prisma.user.findMany({ select: { email: true, name: true } });

  const seen = new Set();
  const recipients = [...testRecipients, ...dbUsers].filter((u) => {
    if (!u.email) return false;
    const key = u.email.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`Preparing to send to ${recipients.length} recipients...`);

  let successCount = 0;
  let failureCount = 0;

  for (const user of recipients) {
    const userName = user.name || "Participant";
    const template = getThreeDayEmailTemplate(userName);
    const sendSmtpEmail = {
      sender: { email: "vk4.ki.oar@gmail.com", name: "VK Competition" },
      to: [{ email: user.email, name: userName }],
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      attachment,
    };

    try {
      const response = await transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
      const msgId = (response && response.body && response.body.messageId) || response.messageId;
      console.log(`✅ Sent to ${user.email} (messageId: ${msgId || "N/A"})`);
      successCount++;
    } catch (err) {
      console.error(`❌ Error sending to ${user.email}:`, err?.response?.body || err);
      failureCount++;
    }
  }

  console.log("Done sending.");
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed:  ${failureCount}`);
}

main()
  .catch((err) => {
    console.error("Fatal error in threedayemail script:", err);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      // ignore
    }
  });
