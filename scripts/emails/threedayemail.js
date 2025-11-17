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
  const baseUrl = "https://vkcompetition.jyot.in";
  const forumUrl = `${baseUrl}/forum`;

  const subject = "⏰ 3 Days Left – Submit & Win in VK Competition!";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>⏰ 3 Days Left – Submit & Win in VK Competition!</title>
      </head>
      <body style="margin:0; padding:0; background-color:#fff7ed; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width:640px; margin:0 auto; background-color:#ffffff; box-shadow:0 14px 30px rgba(0,0,0,0.08); border-radius:12px; overflow:hidden;">
          
          <div style="background:linear-gradient(135deg,#f97316,#dc2626); padding:28px 24px; color:#fff; position:relative;">
            <p style="margin:0; font-size:16px; letter-spacing:2px; text-transform:uppercase; opacity:0.9; font-weight:600;">⏰ FINAL COUNTDOWN</p>
            <h1 style="margin:8px 0 0; font-size:28px; font-weight:800; text-shadow:0 2px 4px rgba(0,0,0,0.2);">3 Days Left to Win Big! 🚀</h1>
            <p style="margin:8px 0 0; font-size:15px; opacity:0.95; font-style:italic;">Your chance to showcase your AI skills is almost here!</p>
          </div>

          <div style="padding:28px 24px; color:#111827;">
            <h2 style="margin:0 0 16px; font-size:22px; color:#b91c1c;">🎉 Hey ${safeName}, Time to Shine!</h2>
            
            <div style="background:linear-gradient(135deg,#fef3c7,#fed7aa); border:2px solid #f59e0b; border-radius:16px; padding:20px; margin:20px 0; text-align:center;">
              <h3 style="margin:0 0 12px; font-size:18px; color:#92400e;">⏰ Submission Deadline Approaching</h3>
              <p style="margin:0; font-size:24px; font-weight:900; color:#92400e; text-shadow:0 1px 2px rgba(0,0,0,0.1);">
                3️⃣ Days Left • 7️⃣2️⃣ Hours • Let's Go! 🔥
              </p>
            </div>

            <p style="margin:0 0 18px; font-size:16px; line-height:1.7; font-weight:500;">
              The VK Competition is heating up! This is your chance to show the world how <span style="background:linear-gradient(45deg,#f97316,#dc2626); -webkit-background-clip:text; -webkit-text-fill-color:transparent; font-weight:800;">AI can change everything</span> while you're still in college! 🎓✨
            </p>

            <div style="background:#fff1f2; border-left:6px solid #dc2626; border-radius:12px; padding:20px; margin:24px 0; box-shadow:0 4px 12px rgba(220,38,38,0.1);">
              <h3 style="margin:0 0 14px; font-size:18px; color:#be123c;">💰 TOTAL PRIZE POOL: ₹1,50,000!</h3>
              
              <div style="margin:16px 0;">
                <h4 style="margin:0 0 8px; color:#ea580c;">🎬 AI Short Video Competition</h4>
                <div style="display:flex; gap:8px; margin-bottom:8px; flex-wrap:wrap;">
                  <span style="background:#fde68a; color:#92400e; padding:4px 12px; border-radius:20px; font-weight:600; font-size:14px;">🥇 1st: ₹25,000</span>
                  <span style="background:#e5e7eb; color:#4b5563; padding:4px 12px; border-radius:20px; font-weight:600; font-size:14px;">🥈 2nd: ₹15,000</span>
                  <span style="background:#fde68a; color:#92400e; padding:4px 12px; border-radius:20px; font-weight:600; font-size:14px;">🥉 3rd: ₹10,000</span>
                </div>
              </div>

              <div style="margin:16px 0;">
                <h4 style="margin:0 0 8px; color:#dc2626;">🎨 Creative Expression Competition</h4>
                <div style="display:flex; gap:8px; margin-bottom:8px; flex-wrap:wrap;">
                  <span style="background:#fde68a; color:#92400e; padding:4px 12px; border-radius:20px; font-weight:600; font-size:14px;">🥇 1st: ₹25,000</span>
                  <span style="background:#e5e7eb; color:#4b5563; padding:4px 12px; border-radius:20px; font-weight:600; font-size:14px;">🥈 2nd: ₹15,000</span>
                  <span style="background:#fde68a; color:#92400e; padding:4px 12px; border-radius:20px; font-weight:600; font-size:14px;">🥉 3rd: ₹10,000</span>
                </div>
              </div>

              <div style="margin:16px 0;">
                <h4 style="margin:0 0 8px; color:#f59e0b;">🖼️ Painting Competition</h4>
                <div style="display:flex; gap:8px; margin-bottom:8px; flex-wrap:wrap;">
                  <span style="background:#fde68a; color:#92400e; padding:4px 12px; border-radius:20px; font-weight:600; font-size:14px;">🥇 1st: ₹37,500</span>
                  <span style="background:#e5e7eb; color:#4b5563; padding:4px 12px; border-radius:20px; font-weight:600; font-size:14px;">🥈 2nd: ₹22,500</span>
                  <span style="background:#fde68a; color:#92400e; padding:4px 12px; border-radius:20px; font-weight:600; font-size:14px;">🥉 3rd: ₹15,000</span>
                </div>
                <p style="margin:8px 0 0; color:#7f1d1d; font-size:13px; font-style:italic;">(Check the attached PDF for painting guidelines!)</p>
              </div>

              <p style="margin:16px 0 0; color:#7f1d1d; font-size:15px; font-weight:600; text-align:center;">
                🌟 Plus main event spotlight and industry recognition for all winners! 🌟
              </p>
            </div>

            <div style="background:#f0f9ff; border:2px dashed #0ea5e9; border-radius:12px; padding:18px; margin:20px 0; text-align:center;">
              <p style="margin:0 0 12px; font-size:16px; color:#0c4a6e; font-weight:600;">💡 Need ideas or inspiration?</p>
              <p style="margin:0; font-size:14px; color:#075985;">
                Connect with thousands of participants: 
                <a href="${forumUrl}" style="color:#0284c7; text-decoration:none; font-weight:700; background:#bae6fd; padding:4px 8px; border-radius:6px;">💬 VK Forum</a>
              </p>
            </div>

            <div style="text-align:center; margin:30px 0; position:relative;">
              <div style="background:linear-gradient(135deg,#f97316,#dc2626); padding:2px; border-radius:50px; display:inline-block; box-shadow:0 8px 25px rgba(220,38,38,0.4);">
                <a href="${baseUrl}/main" style="display:inline-block; background:#ffffff; color:#dc2626; text-decoration:none; padding:16px 40px; border-radius:48px; font-weight:800; font-size:18px; transition:all 0.3s;">
                  🚀 SUBMIT YOUR ENTRY NOW! 🚀
                </a>
              </div>
              <p style="margin:12px 0 0; font-size:12px; color:#6b7280; font-style:italic;">Your amazing idea deserves to be seen! ✨</p>
            </div>

            <div style="background:linear-gradient(135deg,#1f2937,#374151); color:#ffffff; padding:20px; border-radius:12px; margin:24px 0; text-align:center;">
              <h3 style="margin:0 0 12px; font-size:17px; color:#fbbf24;">📅 Submission Closes Soon!</h3>
              <p style="margin:0 0 8px; font-size:15px; line-height:1.6;">
                The deadline is Friday – make sure to get your submissions in!
              </p>
              <p style="margin:0; font-size:15px; font-weight:600; color:#86efac;">
                We're excited to see what you create! 🎨✨
              </p>
            </div>

            <p style="margin:0 0 16px; font-size:16px; line-height:1.7; text-align:center; font-weight:600; color:#1f2937;">
              This is your time to <span style="color:#dc2626; text-decoration:underline;">make an impact</span>. Show us your creativity! 🌟⚡
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
⏰ 3 DAYS LEFT TO SUBMIT! ⏰

Hey ${safeName}, Time to Shine! 🎉

📅 Submission Deadline Approaching: 3 Days • 72 Hours • Let's Go! 🔥

The VK Competition is heating up! This is your chance to show how AI can change everything while you're still in college! 🎓✨

💰 TOTAL PRIZE POOL: ₹1,50,000!

🎬 AI Short Video Competition:
🥇 1st Place: ₹25,000
🥈 2nd Place: ₹15,000  
🥉 3rd Place: ₹10,000

🎨 Creative Expression Competition:
🥇 1st Place: ₹25,000
🥈 2nd Place: ₹15,000
🥉 3rd Place: ₹10,000

🖼️ Painting Competition:
🥇 1st Place: ₹37,500
🥈 2nd Place: ₹22,500
🥉 3rd Place: ₹15,000
(PDF guide attached!)

🌟 Plus main event spotlight and industry recognition for all winners!

💡 Need ideas? Join the community: ${forumUrl}

📅 Submission closes Friday - get your entries in!

🚀 SUBMIT NOW: ${baseUrl}/main

This is your time to make an impact. Show us your creativity! 🌟⚡

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
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
    },
  });

  // For testing, uncomment this line:
  // const users = [{ email: "dhruvshdarshansh@gmail.com", name: "Dhruv Shah" }];

  console.log(`Found ${users.length} users. Starting to send emails...`);

  let successCount = 0;
  let failureCount = 0;

  for (const user of users) {
    if (!user.email) continue;

    const userName = user.name || "Participant";
    const template = getThreeDayEmailTemplate(userName);
    
    const sendSmtpEmail = {
      sender: { email: "vk4.ki.oar@gmail.com", name: "VK Competition" },
      to: [{ email: user.email, name: userName }],
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      attachment, // Add attachment directly here
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