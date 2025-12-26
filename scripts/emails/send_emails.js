#!/usr/bin/env node

// Load environment variables (MAILEROO_API_KEY, DATABASE_URL, NEXT_PUBLIC_BASE_URL, etc.)
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const maileroo = require("../maileroo-client");

// ---------- Prisma setup ----------
const prisma = new PrismaClient();

// ---------- Email template (inline version of your EmailService one) ----------
function getEventReminderEmailTemplate(userName) {
  const safeName = userName || "Participant";
  const baseUrl = "https://vkcompetition.jyot.in";

  const subject =
    "Last Week to Submit – AI Video & Creative Expression (Deadline: 20 November)";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VK Competition – Deadline Reminder</title>
      </head>
      <body style="margin:0; padding:0; background-color:#fef2f2; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width:600px; margin:0 auto; background-color:#ffffff; box-shadow:0 10px 25px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#dc2626,#b91c1c); padding:32px 24px; text-align:center;">
            <h1 style="color:#ffffff; margin:0; font-size:26px; font-weight:600;">
              VK Competition – Last Week to Submit
            </h1>
            <p style="color:rgba(255,255,255,0.9); margin:8px 0 0; font-size:14px;">
              Vasudhaiva Kutumbakam – The World is One Family
            </p>
          </div>

          <!-- Content -->
          <div style="padding:32px 24px;">
            <h2 style="color:#dc2626; font-size:20px; margin:0 0 16px; font-weight:600;">
              Dear ${safeName},
            </h2>

            <p style="color:#374151; font-size:15px; line-height:1.6; margin:0 0 16px;">
              This is a gentle reminder that the 
              <strong>deadline for the AI Video and Creative Expression categories</strong> 
              is on <strong>20 November</strong>. 🌟
            </p>

            <p style="color:#374151; font-size:15px; line-height:1.6; margin:0 0 16px;">
              You are now in the <strong>last week</strong> to submit your entries. 
              We encourage you to carefully go through the guidelines and 
              complete your submissions in time.
            </p>

            <div style="background:linear-gradient(135deg,#fefce8,#fffbeb); border:1px solid #facc15; border-radius:12px; padding:20px; margin:24px 0;">
              <h3 style="margin:0 0 10px; font-size:16px; color:#92400e;">
                🔔 Quick Checklist
              </h3>
              <ul style="margin:0; padding-left:18px; color:#92400e; font-size:14px; line-height:1.6;">
                <li>Review the category guidelines carefully</li>
                <li>Finalize and upload your AI Video / Creative Expression entry</li>
                <li>Ensure all required details are correctly filled</li>
              </ul>
            </div>

            <div style="text-align:center; margin:28px 0;">
              <a href="${baseUrl}/main"
                style="display:inline-block; background:linear-gradient(135deg,#dc2626,#b91c1c); color:#ffffff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:600; font-size:15px; box-shadow:0 4px 14px rgba(220,38,38,0.35);">
                Submit Your Entry
              </a>
            </div>

            <!-- Main event info -->
            <div style="border-top:1px solid #e5e7eb; padding-top:20px; margin-top:24px;">
              <h3 style="color:#111827; font-size:16px; margin:0 0 10px;">
                🌏 Explore Vasudhaiva Kutumbakam Ki Oar 4.0 – The Main Event
              </h3>
              <p style="color:#374151; font-size:14px; line-height:1.6; margin:0 0 10px;">
                <strong>Scheduled from 16th to 22nd January 2026</strong><br />
                Know more: 
                <a href="https://vkcompetition.jyot.in" style="color:#dc2626; text-decoration:none;">vkcompetition.jyot.in</a>
              </p>
              <p style="color:#374151; font-size:14px; line-height:1.6; margin:0 0 10px;">
                Join an interactive exhibition and dynamic sessions on 
                <strong>geopolitics, ethics, justice, constitutional law, and the cultural spirit of India</strong>.
              </p>
              <p style="color:#374151; font-size:14px; line-height:1.6; margin:0 0 10px;">
                Be part of this inspiring experience — stay updated by joining our WhatsApp group: 
                <a href="https://shorturl.at/wUGsc" style="color:#dc2626; text-decoration:none;">Join WhatsApp Group</a>
              </p>
            </div>

            <!-- Painting competition -->
            <div style="background:linear-gradient(135deg,#ecfdf5,#d1fae5); border:1px solid #6ee7b7; border-radius:12px; padding:20px; margin:24px 0 0;">
              <h3 style="color:#047857; font-size:16px; margin:0 0 10px;">
                🎨 New: Painting Competition
              </h3>
              <p style="color:#065f46; font-size:14px; line-height:1.6; margin:0 0 10px;">
                We have also started a <strong>Painting Competition</strong> as part of this journey.
              </p>
              <p style="color:#065f46; font-size:14px; line-height:1.6; margin:0;">
                The detailed concept note is being shared with you 
                <strong>as an attached PDF</strong>. Please review it and consider participating.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background:#f9fafb; padding:20px 24px; text-align:center; border-top:1px solid #e5e7eb;">
            <p style="color:#6b7280; font-size:12px; margin:0 0 6px;">
              VK Competition – Vasudhaiva Kutumbakam
            </p>
            <p style="color:#9ca3af; font-size:11px; margin:0; font-style:italic;">
              "The World is One Family"
            </p>
          </div>

        </div>
      </body>
    </html>
  `;

  const textContent = `
VK Competition – Deadline Reminder

Dear ${safeName},

This is a gentle reminder that the deadline for the AI Video and Creative Expression categories is on 20 November. 
You are now in the last week to submit your entries.

Please:
- Go through the guidelines carefully
- Finalize and upload your AI Video / Creative Expression entry
- Ensure all required details are correctly filled

Submit your entry here:
${baseUrl}/main

Explore Vasudhaiva Kutumbakam Ki Oar 4.0 – The Main Event
Scheduled from 16th to 22nd January 2026
Know more: https://vkcompetition.jyot.in

Join an interactive exhibition and dynamic sessions on geopolitics, ethics, justice, constitutional law, 
and the cultural spirit of India.

Stay updated by joining our WhatsApp group:
https://shorturl.at/wUGsc

We have also started a Painting Competition.
The detailed concept note is shared with you as an attached PDF – please review it and consider participating.

"The World is One Family"

VK Competition Team
  `;

  return { subject, htmlContent, textContent };
}

// ---------- Main script ----------
async function main() {
  // 1. Load PDF attachment from same dir as this script
  const PDF_FILENAME = "painting-competition.pdf"; // make sure this exact file exists next to this JS file
  const pdfPath = path.join(__dirname, PDF_FILENAME);

  if (!fs.existsSync(pdfPath)) {
    console.error(
      `❌ PDF file "${PDF_FILENAME}" not found in ${__dirname}. Place it in the same folder as this script.`
    );
    process.exit(1);
  }

  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfBase64 = pdfBuffer.toString("base64");
  const attachment = [{ name: PDF_FILENAME, content: pdfBase64 }];

  // 2. Fetch users from DB
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
    },
  });

  // For testing, you can comment the above and use:
  // const users = [{ email: "dhruvshdarshansh@gmail.com", name: "Dhruv Shah" }];

  console.log(`Found ${users.length} users. Starting to send emails...`);

  let successCount = 0;
  let failureCount = 0;

  // 3. Send emails sequentially
  for (const user of users) {
    const toEmail = user.email;
    if (!toEmail) continue;

    const userName = user.name || "Participant";
    const template = getEventReminderEmailTemplate(userName);

    const sendSmtpEmail = {
      sender: {
        email: "vk4.ki.oar@gmail.com",
        name: "VK Competition",
      },
      to: [{ email: toEmail, name: userName }],
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      attachment,
    };

    try {
      const response = await maileroo.sendTransacEmail(sendSmtpEmail);
      const msgId =
        (response && response.body && response.body.messageId) || response.messageId;
      console.log(`✅ Sent to ${toEmail} (messageId: ${msgId || "N/A"})`);
      successCount++;
      // Optional delay for rate limiting:
      // await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      console.error(`❌ Error sending to ${toEmail}:`, err?.response?.body || err);
      failureCount++;
    }
  }

  console.log("Done sending.");
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed:  ${failureCount}`);
}

main()
  .catch((err) => {
    console.error("Fatal error in send_emails script:", err);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      // ignore
    }
  });
