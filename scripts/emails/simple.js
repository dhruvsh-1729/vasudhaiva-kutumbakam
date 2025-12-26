const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const maileroo = require("../maileroo-client");

// Load environment variables
require("dotenv").config();

// ---------- Prisma setup ----------
const prisma = new PrismaClient();

// ---------- Simple email template ----------
function getSimpleEmailTemplate(userName) {
  const safeName = userName || "Participant";
  const baseUrl = "https://vkcompetition.jyot.in";
  const forumUrl = "https://vkcompetition.jyot.in/forum";

  const subject = "Gentle Reminder: Phase 1 Submissions Close Tonight at Midnight";

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <h2 style="color: #333;">Hello ${safeName},</h2>
        
        <p>Just a friendly heads-up that Phase 1 submissions for the VK Competition close at midnight tonight!</p>
        
        <p>If you've been working on your entry, now's a great time to submit. We have three exciting categories currently open:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #d9534f; margin: 0 0 15px 0;">💰 DON'T MISS OUT ON ₹1,50,000!</h3>
          
          <div style="margin-bottom: 15px;">
            <h4 style="color: #333; margin: 0 0 5px 0;">🎬 AI Short Video Competition:</h4>
            <ul style="margin: 5px 0 0 20px;">
              <li>🥇 1st Place: ₹25,000</li>
              <li>🥈 2nd Place: ₹15,000</li>
              <li>🥉 3rd Place: ₹10,000</li>
            </ul>
          </div>
          
          <div style="margin-bottom: 15px;">
            <h4 style="color: #333; margin: 0 0 5px 0;">🎨 Creative Expression Competition:</h4>
            <ul style="margin: 5px 0 0 20px;">
              <li>🥇 1st Place: ₹25,000</li>
              <li>🥈 2nd Place: ₹15,000</li>
              <li>🥉 3rd Place: ₹10,000</li>
            </ul>
          </div>
          
          <div>
            <h4 style="color: #333; margin: 0 0 5px 0;">🖼️ Painting Competition:</h4>
            <ul style="margin: 5px 0 0 20px;">
              <li>🥇 1st Place: ₹37,500</li>
              <li>🥈 2nd Place: ₹22,500</li>
              <li>🥉 3rd Place: ₹15,000</li>
            </ul>
            <p style="font-style: italic; margin: 5px 0 0 0; color: #666;">
              📎 <strong>Detailed PDF guide attached!</strong> The painting competition has an extended deadline (December 30, 2025), 
              so you have plenty of time to create your masterpiece! Check the PDF for complete guidelines.
            </p>
          </div>
        </div>
        
        <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196F3;">
          <p style="margin: 0; color: #1976D2; font-weight: bold;">
            🎨 Special Note: Painting Competition Extended Timeline
          </p>
          <p style="margin: 10px 0 0 0; color: #555;">
            Unlike the other competitions closing tonight for the current submission interval, the <strong>Painting Competition runs until December 30, 2025</strong>, 
            giving you more time to work on your artistic creation. Please refer to the attached PDF for detailed submission guidelines, 
            theme requirements, and judging criteria.
          </p>
        </div>
        
        <p><strong>Good news:</strong> More exciting categories will be opening up from tomorrow, so stay tuned!</p>
        
        <p style="margin-top: 25px;">
          <a href="${baseUrl}/main" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Submit Your Entry</a>
        </p>
        
        <p style="margin-top: 25px;"><strong>Need help?</strong></p>
        <ul style="margin: 10px 0;">
          <li>Visit our <a href="${forumUrl}" style="color: #007bff;">forum</a></li>
          <li>Email us at <a href="mailto:vk4.ki.oar@gmail.com" style="color: #007bff;">vk4.ki.oar@gmail.com</a></li>
        </ul>
        
        <p style="margin-top: 30px;">Best regards,<br>
        Dhruv Shah<br>
        VK Competition Team</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <small style="color: #666;">
          VK Competition Team | Contact: vk4.ki.oar@gmail.com<br>
          This is a reminder email regarding your competition participation.
        </small>
      </body>
    </html>
  `;

  const textContent = `
Hello ${safeName},

Just a friendly heads-up that Phase 1 submissions for the VK Competition close at midnight tonight!

If you've been working on your entry, now's a great time to submit. We have three exciting categories currently open:

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
📎 Detailed PDF guide attached!

🎨 SPECIAL NOTE: Painting Competition Extended Timeline
Unlike the other competitions closing tonight, the Painting Competition runs until December 30, 2025, 
giving you more time to work on your artistic creation. Please refer to the attached PDF for detailed 
submission guidelines, theme requirements, and judging criteria.

Good news: More exciting categories will be opening up from tomorrow, so stay tuned!

Submit your entry: ${baseUrl}/main

Need help?
- Visit our forum: ${forumUrl}
- Email us at: vk4.ki.oar@gmail.com

Best regards,
Dhruv Shah
VK Competition Team

---
VK Competition Team | Contact: vk4.ki.oar@gmail.com
This is a reminder email regarding your competition participation.
  `;

  return { subject, htmlContent, textContent };
}

// ---------- Main script ----------
async function main() {
  // Read and encode the PDF file
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
  // const users = [{name:"Dhruv Shah", email:"dhruvsh2003@gmail.com"}]

  console.log(`Found ${users.length} users. Starting to send emails...`);

  let successCount = 0;
  let failureCount = 0;

  for (const user of users) {
    if (!user.email) continue;

    const userName = user.name || "Participant";
    const template = getSimpleEmailTemplate(userName);
    
    const sendSmtpEmail = {
      sender: { email: "vk4.ki.oar@gmail.com", name: "VK Competition" },
      to: [{ email: user.email, name: userName }],
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      attachment, // Add the PDF attachment
      headers: {
        "X-Mailer": "VK Competition System",
        "X-Priority": "3",
        "Precedence": "bulk",
        "Auto-Submitted": "auto-generated"
      },
      tags: ["transactional", "competition-reminder"]
    };

    try {
      // Add small delay between emails to avoid rate limiting
      if (successCount > 0 && successCount % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const response = await maileroo.sendTransacEmail(sendSmtpEmail);
      const msgId = (response && response.body && response.body.messageId) || response.messageId;
      console.log(`✅ Sent email to ${user.email} (messageId: ${msgId || "N/A"})`);
      successCount++;
    } catch (err) {
      console.error(`❌ Error sending to ${user.email}:`, err?.response?.body || err);
      failureCount++;
    }
  }

  console.log("Done sending emails.");
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed:  ${failureCount}`);
}

main()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      // ignore
    }
  });
