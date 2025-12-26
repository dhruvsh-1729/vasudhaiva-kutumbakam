const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const maileroo = require("../maileroo-client");

// Load environment variables (MAILEROO_API_KEY, DATABASE_URL, NEXT_PUBLIC_BASE_URL, etc.)
require("dotenv").config();

// ---------- Prisma setup ----------
const prisma = new PrismaClient();

// ---------- Email template ----------
function getEightHourEmailTemplate(userName) {
  const safeName = userName || "Participant";
  const baseUrl = "https://vkcompetition.jyot.in";
  const forumUrl = `${baseUrl}/forum`;

  const subject = "🚨 CRITICAL: ONLY 8 HOURS LEFT! Final Submission Alert ⏰";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🚨 CRITICAL: ONLY 8 HOURS LEFT! Final Submission Alert ⏰</title>
      </head>
      <body style="margin:0; padding:0; background-color:#fef2f2; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width:640px; margin:0 auto; background-color:#ffffff; box-shadow:0 20px 40px rgba(220,38,38,0.15); border-radius:16px; overflow:hidden; border:3px solid #dc2626;">
          
          <div style="background:linear-gradient(135deg,#7f1d1d,#450a0a); padding:32px 24px; color:#fff; position:relative; text-align:center;">
            <div style="background:rgba(255,255,255,0.1); border:2px solid rgba(255,255,255,0.3); border-radius:50px; padding:8px 20px; display:inline-block; margin-bottom:16px;">
              <p style="margin:0; font-size:14px; letter-spacing:3px; text-transform:uppercase; font-weight:700;">🚨 CRITICAL ALERT 🚨</p>
            </div>
            <h1 style="margin:0; font-size:32px; font-weight:900; text-shadow:0 2px 8px rgba(0,0,0,0.4); animation:pulse 2s infinite;">ONLY 8 HOURS LEFT! ⏰</h1>
            <p style="margin:12px 0 0; font-size:16px; opacity:0.95; font-weight:600;">THIS IS YOUR ABSOLUTE FINAL WARNING!</p>
          </div>

          <div style="padding:32px 24px; color:#111827;">
            <div style="background:linear-gradient(135deg,#7f1d1d,#450a0a); color:#fff; border-radius:20px; padding:24px; margin:0 0 24px; text-align:center; border:4px solid #dc2626; box-shadow:0 8px 30px rgba(127,29,29,0.4);">
              <h2 style="margin:0 0 16px; font-size:24px; color:#fef2f2;">🔥 ${safeName}, Time is RUNNING OUT! 🔥</h2>
              <div style="background:rgba(255,255,255,0.1); border-radius:16px; padding:20px; margin:16px 0;">
                <p style="margin:0; font-size:36px; font-weight:900; color:#fecaca; text-shadow:0 2px 4px rgba(0,0,0,0.3);">
                  0️⃣8️⃣ HOURS ⏰
                </p>
                <p style="margin:8px 0 0; font-size:18px; color:#fef2f2; font-weight:700;">DEADLINE APPROACHING FAST!</p>
              </div>
            </div>

            <div style="background:#fef2f2; border:4px solid #dc2626; border-radius:16px; padding:24px; margin:24px 0; text-align:center; position:relative;">
              <div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#dc2626; color:#fff; padding:6px 16px; border-radius:20px; font-size:12px; font-weight:800;">URGENT</div>
              <h3 style="margin:0 0 16px; font-size:20px; color:#7f1d1d;">🚨 THIS IS IT – NO MORE TIME! 🚨</h3>
              <p style="margin:0; font-size:16px; line-height:1.6; color:#991b1b; font-weight:600;">
                If you haven't submitted yet, you have <span style="background:#dc2626; color:#fff; padding:2px 8px; border-radius:6px; font-weight:800;">LESS THAN 8 HOURS</span> before the competition closes FOREVER! ⚡
              </p>
            </div>

            <div style="background:#fff7ed; border-left:8px solid #ea580c; border-radius:12px; padding:24px; margin:24px 0; box-shadow:0 6px 20px rgba(234,88,12,0.15);">
              <h3 style="margin:0 0 16px; font-size:20px; color:#c2410c;">💰 DON'T MISS OUT ON ₹1,50,000!</h3>
              
              <div style="margin:16px 0;">
                <h4 style="margin:0 0 8px; color:#ea580c;">🎬 AI Short Video Competition</h4>
                <div style="display:flex; gap:8px; margin-bottom:8px; flex-wrap:wrap;">
                  <span style="background:#fed7aa; color:#9a3412; padding:6px 14px; border-radius:25px; font-weight:700; font-size:14px;">🥇 ₹25,000</span>
                  <span style="background:#f3f4f6; color:#4b5563; padding:6px 14px; border-radius:25px; font-weight:700; font-size:14px;">🥈 ₹15,000</span>
                  <span style="background:#fed7aa; color:#9a3412; padding:6px 14px; border-radius:25px; font-weight:700; font-size:14px;">🥉 ₹10,000</span>
                </div>
              </div>

              <div style="margin:16px 0;">
                <h4 style="margin:0 0 8px; color:#dc2626;">🎨 Creative Expression Competition</h4>
                <div style="display:flex; gap:8px; margin-bottom:8px; flex-wrap:wrap;">
                  <span style="background:#fed7aa; color:#9a3412; padding:6px 14px; border-radius:25px; font-weight:700; font-size:14px;">🥇 ₹25,000</span>
                  <span style="background:#f3f4f6; color:#4b5563; padding:6px 14px; border-radius:25px; font-weight:700; font-size:14px;">🥈 ₹15,000</span>
                  <span style="background:#fed7aa; color:#9a3412; padding:6px 14px; border-radius:25px; font-weight:700; font-size:14px;">🥉 ₹10,000</span>
                </div>
              </div>

              <div style="margin:16px 0;">
                <h4 style="margin:0 0 8px; color:#f59e0b;">🖼️ Painting Competition</h4>
                <div style="display:flex; gap:8px; margin-bottom:8px; flex-wrap:wrap;">
                  <span style="background:#fed7aa; color:#9a3412; padding:6px 14px; border-radius:25px; font-weight:700; font-size:14px;">🥇 ₹37,500</span>
                  <span style="background:#f3f4f6; color:#4b5563; padding:6px 14px; border-radius:25px; font-weight:700; font-size:14px;">🥈 ₹22,500</span>
                  <span style="background:#fed7aa; color:#9a3412; padding:6px 14px; border-radius:25px; font-weight:700; font-size:14px;">🥉 ₹15,000</span>
                </div>
                <p style="margin:8px 0 0; color:#c2410c; font-size:13px; font-style:italic;">(Check the attached PDF for painting guidelines!)</p>
              </div>

              <div style="background:#7f1d1d; color:#fff; padding:16px; border-radius:12px; margin:16px 0; text-align:center;">
                <p style="margin:0; font-size:17px; font-weight:800; color:#fecaca;">
                  🌟 PLUS: Main event spotlight & industry recognition! 🌟
                </p>
              </div>
            </div>

            <div style="background:linear-gradient(135deg,#7f1d1d,#450a0a); color:#fff; border-radius:16px; padding:24px; margin:24px 0; text-align:center; border:3px solid #dc2626;">
              <h3 style="margin:0 0 16px; font-size:22px; color:#fecaca;">⚡ RIGHT NOW IS YOUR MOMENT! ⚡</h3>
              <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#fef2f2;">
                Don't spend the rest of your life wondering "what if?" – <strong>SUBMIT NOW</strong> and be part of something amazing! 🚀
              </p>
              <div style="background:rgba(255,255,255,0.1); border-radius:12px; padding:16px; margin:16px 0;">
                <p style="margin:0; font-size:18px; font-weight:800; color:#fbbf24;">
                  ⏰ EVERY MINUTE COUNTS NOW! ⏰
                </p>
              </div>
            </div>

            <div style="background:#ecfdf5; border:2px dashed #10b981; border-radius:12px; padding:20px; margin:20px 0; text-align:center;">
              <p style="margin:0 0 12px; font-size:16px; color:#047857; font-weight:600;">🤝 Need last-minute help or motivation?</p>
              <p style="margin:0; font-size:14px; color:#059669;">
                Join our community: 
                <a href="${forumUrl}" style="color:#0d9488; text-decoration:none; font-weight:700; background:#a7f3d0; padding:6px 12px; border-radius:8px;">💬 VK Forum – Get Support!</a>
              </p>
            </div>

            <div style="text-align:center; margin:32px 0; position:relative;">
              <div style="background:linear-gradient(135deg,#7f1d1d,#450a0a); padding:3px; border-radius:60px; display:inline-block; box-shadow:0 12px 40px rgba(127,29,29,0.6); animation:pulse 1.5s infinite;">
                <a href="${baseUrl}/main" style="display:inline-block; background:#ffffff; color:#7f1d1d; text-decoration:none; padding:20px 48px; border-radius:57px; font-weight:900; font-size:20px; transition:all 0.3s; border:2px solid #dc2626;">
                  🚨 SUBMIT RIGHT NOW! 🚨
                </a>
              </div>
              <p style="margin:16px 0 0; font-size:14px; color:#7f1d1d; font-style:italic; font-weight:800;">Every second matters! Don't delay! ⚡</p>
            </div>

            <div style="background:linear-gradient(135deg,#450a0a,#7f1d1d); color:#ffffff; padding:24px; border-radius:16px; margin:24px 0; text-align:center; border:3px solid #dc2626; box-shadow:0 8px 30px rgba(69,10,10,0.4);">
              <h3 style="margin:0 0 16px; font-size:20px; color:#fecaca;">⏰ FINAL COUNTDOWN: 8 HOURS!</h3>
              <p style="margin:0 0 12px; font-size:16px; line-height:1.6;">
                This is your absolute last chance. After 8 hours, the doors close.
              </p>
              <p style="margin:0; font-size:17px; font-weight:800; color:#fbbf24;">
                We're rooting for you – GO FOR IT! 💪🎯
              </p>
            </div>

            <div style="text-align:center; margin:24px 0; padding:20px; background:#fef2f2; border-radius:12px; border:2px dashed #dc2626;">
              <p style="margin:0; font-size:18px; line-height:1.6; font-weight:800; color:#7f1d1d;">
                The clock is ticking. Your opportunity is <span style="color:#dc2626; text-decoration:underline;">RIGHT HERE, RIGHT NOW</span>! ⏰✨
              </p>
            </div>
          </div>

          <div style="padding:24px; background:#f8fafc; border-top:2px solid #dc2626; text-align:center; color:#6b7280; font-size:14px;">
            <strong style="color:#374151; font-size:16px;">VK Competition – Vasudhaiva Kutumbakam</strong><br/>
            <span style="font-style:italic; color:#dc2626; font-weight:600;">\"One World, One Family, One Future\" 🌏❤️</span>
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
🚨 CRITICAL: ONLY 8 HOURS LEFT! Final Submission Alert ⏰

${safeName}, Time is RUNNING OUT! 🔥

⏰ FINAL COUNTDOWN: 8 HOURS!
DEADLINE APPROACHING FAST!

🚨 THIS IS IT – NO MORE TIME! 🚨
If you haven't submitted yet, you have LESS THAN 8 HOURS before the competition closes FOREVER! ⚡

💰 DON'T MISS OUT ON ₹1,50,000!

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

🌟 PLUS: Main event spotlight & industry recognition!

⚡ RIGHT NOW IS YOUR MOMENT! ⚡
Don't spend the rest of your life wondering "what if?" – SUBMIT NOW and be part of something amazing! 🚀

⏰ EVERY MINUTE COUNTS NOW! ⏰

🤝 Need help? Join our community: ${forumUrl}

⏰ FINAL COUNTDOWN: 8 HOURS!
This is your absolute last chance. After 8 hours, the doors close forever.

🚨 SUBMIT RIGHT NOW: ${baseUrl}/main

The clock is ticking. Your opportunity is RIGHT HERE, RIGHT NOW! ⏰✨

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

  console.log(`Found ${users.length} users. Starting to send 8-hour warning emails...`);

  let successCount = 0;
  let failureCount = 0;

  for (const user of users) {
    if (!user.email) continue;

    const userName = user.name || "Participant";
    const template = getEightHourEmailTemplate(userName);
    
    const sendSmtpEmail = {
      sender: { email: "vk4.ki.oar@gmail.com", name: "VK Competition" },
      to: [{ email: user.email, name: userName }],
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      attachment,
    };

    try {
      const response = await maileroo.sendTransacEmail(sendSmtpEmail);
      const msgId = (response && response.body && response.body.messageId) || response.messageId;
      console.log(`✅ Sent 8-hour warning to ${user.email} (messageId: ${msgId || "N/A"})`);
      successCount++;
    } catch (err) {
      console.error(`❌ Error sending to ${user.email}:`, err?.response?.body || err);
      failureCount++;
    }
  }

  console.log("Done sending 8-hour warning emails.");
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed:  ${failureCount}`);
}

main()
  .catch((err) => {
    console.error("Fatal error in lastchance script:", err);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      // ignore
    }
  });
