#!/usr/bin/env node

// Load environment variables (MAILEROO_API_KEY, DATABASE_URL, NEXT_PUBLIC_BASE_URL, etc.)
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const maileroo = require("../maileroo-client");

// ---------- Prisma setup ----------
const prisma = new PrismaClient();

// ---------- Email template ----------
function getThirtySixHourEmailTemplate(userName) {
  const safeName = userName || "Participant";
  const baseUrl = "https://vkcompetition.jyot.in";
  const forumUrl = `${baseUrl}/forum`;

  const subject = "⚠️ FINAL 72 HOURS – Last Chance to Submit & Win!";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>⚠️ FINAL 72 HOURS – Last Chance to Submit & Win!</title>
      </head>
      <body style="margin:0; padding:0; background-color:#fff7ed; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width:640px; margin:0 auto; background-color:#ffffff; box-shadow:0 14px 30px rgba(0,0,0,0.08); border-radius:12px; overflow:hidden;">
          
          <div style="background:linear-gradient(135deg,#dc2626,#991b1b); padding:28px 24px; color:#fff; position:relative;">
            <p style="margin:0; font-size:16px; letter-spacing:2px; text-transform:uppercase; opacity:0.9; font-weight:600;">⚠️ URGENT – TIME RUNNING OUT</p>
            <h1 style="margin:8px 0 0; font-size:28px; font-weight:800; text-shadow:0 2px 4px rgba(0,0,0,0.2);">Only 72 Hours Left! ⏰🔥</h1>
            <p style="margin:8px 0 0; font-size:15px; opacity:0.95; font-style:italic;">This is your FINAL call to action!</p>
          </div>

          <div style="padding:28px 24px; color:#111827;">
            <h2 style="margin:0 0 16px; font-size:22px; color:#b91c1c;">🚨 ${safeName}, It's Now or Never!</h2>
            
            <div style="background:linear-gradient(135deg,#fecaca,#fca5a5); border:3px solid #dc2626; border-radius:16px; padding:20px; margin:20px 0; text-align:center; box-shadow:0 6px 20px rgba(220,38,38,0.3);">
              <h3 style="margin:0 0 12px; font-size:18px; color:#7f1d1d;">⏰ FINAL DEADLINE ALERT</h3>
              <p style="margin:0; font-size:26px; font-weight:900; color:#7f1d1d; text-shadow:0 1px 2px rgba(0,0,0,0.1);">
                7️⃣2️⃣ Hours • Last Chance! 🚨
              </p>
              <p style="margin:8px 0 0; font-size:14px; color:#991b1b; font-weight:700;">Submissions close 30th December 11:59 PM IST!</p>
            </div>

            <p style="margin:0 0 18px; font-size:16px; line-height:1.7; font-weight:500;">
              This is it, ${safeName}! <span style="background:linear-gradient(45deg,#dc2626,#991b1b); -webkit-background-clip:text; -webkit-text-fill-color:transparent; font-weight:800;">The clock is ticking</span> and we don't want you to miss out on this incredible opportunity! ⚡💫
            </p>

            <div style="background:#fff1f2; border-left:6px solid #dc2626; border-radius:12px; padding:20px; margin:24px 0; box-shadow:0 4px 12px rgba(220,38,38,0.1);">
              <h3 style="margin:0 0 14px; font-size:18px; color:#be123c;">💫 Your Moment of Glory Awaits!</h3>
              
              <p style="margin:0 0 16px; font-size:15px; color:#7f1d1d; line-height:1.6;">
                🌟 Amazing prizes and recognition are waiting for you! This competition will showcase your talent to thousands of participants and industry experts. 
              </p>

              <p style="margin:16px 0 0; color:#7f1d1d; font-size:15px; font-weight:600; text-align:center;">
                🌟 Win incredible prizes, gain spotlight recognition, and join a community of creative minds! 🌟
              </p>
            </div>

            <div style="background:#fef2f2; border:2px solid #dc2626; border-radius:12px; padding:18px; margin:20px 0; text-align:center;">
              <p style="margin:0 0 8px; font-size:17px; color:#7f1d1d; font-weight:700;">⚡ DON'T LET THIS SLIP AWAY!</p>
              <p style="margin:0; font-size:14px; color:#991b1b; font-weight:600;">
                If you've been thinking about it, NOW is the time to act! 🎯
              </p>
            </div>

            <div style="background:#f0f9ff; border:2px dashed #0ea5e9; border-radius:12px; padding:18px; margin:20px 0; text-align:center;">
              <p style="margin:0 0 12px; font-size:16px; color:#0c4a6e; font-weight:600;">💡 Last-minute questions or need inspiration?</p>
              <p style="margin:0; font-size:14px; color:#075985;">
                Connect with thousands of participants: 
                <a href="${forumUrl}" style="color:#0284c7; text-decoration:none; font-weight:700; background:#bae6fd; padding:4px 8px; border-radius:6px;">💬 VK Forum</a>
              </p>
            </div>

            <div style="text-align:center; margin:30px 0; position:relative;">
              <div style="background:linear-gradient(135deg,#dc2626,#991b1b); padding:2px; border-radius:50px; display:inline-block; box-shadow:0 8px 25px rgba(220,38,38,0.5); animation:pulse 2s infinite;">
                <a href="${baseUrl}/main" style="display:inline-block; background:#ffffff; color:#dc2626; text-decoration:none; padding:16px 40px; border-radius:48px; font-weight:800; font-size:18px; transition:all 0.3s;">
                  🚨 SUBMIT NOW – FINAL HOURS! 🚨
                </a>
              </div>
              <p style="margin:12px 0 0; font-size:13px; color:#dc2626; font-style:italic; font-weight:700;">Don't wait another minute! ⏰</p>
            </div>

            <div style="background:linear-gradient(135deg,#7f1d1d,#991b1b); color:#ffffff; padding:20px; border-radius:12px; margin:24px 0; text-align:center; border:2px solid #dc2626;">
              <h3 style="margin:0 0 12px; font-size:17px; color:#fca5a5;">⏰ DEADLINE: 30th December 11:59 PM IST!</h3>
              <p style="margin:0 0 8px; font-size:15px; line-height:1.6;">
                This is your absolute last chance to submit your work and compete for amazing prizes!
              </p>
              <p style="margin:0; font-size:15px; font-weight:600; color:#fef08a;">
                We believe in you – show the world what you've got! 💪🎨
              </p>
            </div>

            <p style="margin:0 0 16px; font-size:17px; line-height:1.7; text-align:center; font-weight:700; color:#1f2937;">
              The finish line is <span style="color:#dc2626; text-decoration:underline;">RIGHT THERE</span>. Don't let this opportunity pass! 🏁✨
            </p>
          </div>

          <div style="padding:20px 24px; background:#f8fafc; border-top:1px solid #e5e7eb; text-align:center; color:#6b7280; font-size:13px;">
            <strong style="color:#374151;">VK Competition – Vasudhaiva Kutumbakam</strong><br/>
            <span style="font-style:italic; color:#dc2626;">\"One World, One Family, One Future\" 🌏❤️</span>
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
⚠️ FINAL 72 HOURS TO SUBMIT! ⚠️

${safeName}, It's Now or Never! 🚨

⏰ FINAL DEADLINE ALERT: 72 Hours • Last Chance! 🚨
Submissions close 30th December 11:59 PM IST!

This is it! The clock is ticking and we don't want you to miss out on this incredible opportunity! ⚡💫

💫 Your Moment of Glory Awaits!

🌟 Amazing prizes and recognition are waiting for you! This competition will showcase your talent to thousands of participants and industry experts.

🌟 Win incredible prizes, gain spotlight recognition, and join a community of creative minds! 🌟

⚡ DON'T LET THIS SLIP AWAY!
If you've been thinking about it, NOW is the time to act! 🎯

💡 Last-minute questions? Join the community: ${forumUrl}

⏰ DEADLINE: 30th December 11:59 PM IST!
This is your absolute last chance to submit your work and compete for amazing prizes!

🚨 SUBMIT NOW: ${baseUrl}/main

The finish line is RIGHT THERE. Don't let this opportunity pass! 🏁✨

VK Competition – Vasudhaiva Kutumbakam
"One World, One Family, One Future" 🌏❤️
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

  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfBase64 = pdfBuffer.toString("base64");
  const attachment = [{ name: PDF_FILENAME, content: pdfBase64 }];

  // Fetch all users from database
  // const users = await prisma.user.findMany({
  //   select: {
  //     email: true,
  //     name: true,
  //   },
  // });

  // For testing, uncomment this line:
  const users = [{ email: "dhruvsh2003@gmail.com", name: "Dhruv Shah" }];

  console.log(`Found ${users.length} users. Starting to send emails...`);

  let successCount = 0;
  let failureCount = 0;

  for (const user of users) {
    if (!user.email) continue;

    const userName = user.name || "Participant";
    const template = getThirtySixHourEmailTemplate(userName);
    
    const sendSmtpEmail = {
      sender: { email: "vk4.ki.oar@e696732678450cac.maileroo.org", name: "Vasudhaiva Kutumbakam Online Competition" },
      to: [{ email: user.email, name: userName }],
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      attachment, // Add attachment directly here
    };

    try {
      const response = await maileroo.sendTransacEmail(sendSmtpEmail);
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
    console.error("Fatal error in thirtysixhouremail script:", err);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      // ignore
    }
  });
