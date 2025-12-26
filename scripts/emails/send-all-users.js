const { PrismaClient } = require("@prisma/client");
const readline = require("readline");
const path = require("path");
const fs = require("fs");
const maileroo = require("../maileroo-client");

// Load environment variables
require("dotenv").config();

// ---------- Prisma setup ----------
const prisma = new PrismaClient();

// ---------- Format prize amount ----------
function formatPrize(amount) {
  if (!amount) return "TBA";
  const num = typeof amount === "string" ? parseInt(amount.replace(/[^\d]/g, "")) : amount;
  if (isNaN(num)) return amount;
  return `₹${num.toLocaleString("en-IN")}`;
}

// ---------- Generate competition section (simple, text-like) ----------
function generateCompetitionSection(competition) {
  const prizes = competition.prizes || {};
  const first = prizes.first || prizes["1st"] || null;
  const second = prizes.second || prizes["2nd"] || null;
  const third = prizes.third || prizes["3rd"] || null;

  const deadlineText = competition.deadline
    ? new Date(competition.deadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Ongoing";

  // Simple, minimal HTML - looks more like a personal email
  let html = `<p style="margin: 0 0 5px 0;"><strong>${competition.title}</strong></p>`;
  html += `<p style="margin: 0 0 5px 0; color: #555;">${competition.description || ""}</p>`;
  
  if (first || second || third) {
    html += `<p style="margin: 0 0 5px 0;">`;
    if (first) html += `1st: ${formatPrize(first)} `;
    if (second) html += `| 2nd: ${formatPrize(second)} `;
    if (third) html += `| 3rd: ${formatPrize(third)}`;
    html += `</p>`;
  }
  
  html += `<p style="margin: 0 0 15px 0; color: #888;">Deadline: ${deadlineText}</p>`;

  return html;
}

// ---------- Generate competition text section ----------
function generateCompetitionText(competition) {
  const prizes = competition.prizes || {};
  const first = prizes.first || prizes["1st"] || null;
  const second = prizes.second || prizes["2nd"] || null;
  const third = prizes.third || prizes["3rd"] || null;

  const deadlineText = competition.deadline
    ? new Date(competition.deadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Ongoing";

  let text = `\n${competition.title}\n`;
  text += `${competition.description || ""}\n`;
  if (first) text += `1st: ${formatPrize(first)} `;
  if (second) text += `| 2nd: ${formatPrize(second)} `;
  if (third) text += `| 3rd: ${formatPrize(third)}\n`;
  text += `Deadline: ${deadlineText}\n`;

  return text;
}

// ---------- Email template (Optimized for Primary Inbox) ----------
// Key changes to avoid Promotions tab:
// 1. Simple, personal subject line (no excessive emojis/caps)
// 2. Minimal HTML formatting - looks like a personal email
// 3. High text-to-image ratio (no images)
// 4. No flashy buttons or promotional language
// 5. Personal tone, like writing to a friend
// 6. Single CTA as a simple link, not a button
// 7. Short, focused content
function getEmailTemplate(userName, competitions) {
  const safeName = userName || "there";
  const baseUrl = "https://vkcompetition.jyot.in";
  const forumUrl = "https://vkcompetition.jyot.in/forum";
  const winnersUrl = "https://vkcompetition.jyot.in";

  const competitionsHtml = competitions.map(generateCompetitionSection).join("");
  const competitionsText = competitions.map(generateCompetitionText).join("\n");

  // Simple, personal subject - avoid spam triggers
  const subject = "Quick update: New categories open + Week 1-2 winners";

  // Minimal HTML - looks like a regular email, not a newsletter
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

<p>Hi ${safeName},</p>

<p>Hope you're doing well! Just wanted to share a couple of updates from the VK Competition:</p>

<p><strong>We've announced the winners for the first two weeks!</strong> You can check them out here: <a href="${winnersUrl}" style="color: #0066cc;">${winnersUrl}</a></p>

<p>Also, we've opened up some new competition categories. Here's what's available now:</p>

<div style="margin: 20px 0; padding-left: 15px; border-left: 2px solid #ddd;">
${competitionsHtml}
</div>

<p>If you've been thinking about participating, now's a great time to jump in. You can submit your entry here: <a href="${baseUrl}/main" style="color: #0066cc;">${baseUrl}/main</a></p>

<p>Feel free to reach out if you have any questions - just reply to this email or post on our forum at <a href="${forumUrl}" style="color: #0066cc;">${forumUrl}</a></p>

<p>Best,<br>
Dhruv</p>

<p style="color: #999; font-size: 13px; margin-top: 30px;">
—<br>
VK Competition Team<br>
<a href="mailto:vk4.ki.oar@gmail.com" style="color: #999;">vk4.ki.oar@gmail.com</a>
</p>

</body>
</html>
  `.trim();

  // Plain text version (important for deliverability)
  const textContent = `
Hi ${safeName},

Hope you're doing well! Just wanted to share a couple of updates from the VK Competition:

We've announced the winners for the first two weeks! You can check them out here:
${winnersUrl}

Also, we've opened up some new competition categories. Here's what's available now:
${competitionsText}

If you've been thinking about participating, now's a great time to jump in. You can submit your entry here:
${baseUrl}/main

Feel free to reach out if you have any questions - just reply to this email or post on our forum at ${forumUrl}

Best,
Dhruv

—
VK Competition Team
vk4.ki.oar@gmail.com
  `.trim();

  return { subject, htmlContent, textContent };
}

// ---------- Send email function ----------
async function sendEmail(user, competitions, attachment, senderEmail) {
  const userName = user.name?.split(" ")[0] || "there"; // Use first name only for personal feel
  const template = getEmailTemplate(userName, competitions);

  const sendSmtpEmail = {
    sender: { 
      email: senderEmail || "vk4.ki.oar@gmail.com", 
      name: "Dhruv from Vasudhaiva Kutumbakam" // Personal name, not brand name
    },
    headers: {
      "Precedence": "personal" // Indicate bulk email to avoid Promotions tab
    },
    to: [{ email: user.email, name: user.name || "Participant" }],
    subject: template.subject,
    htmlContent: template.htmlContent,
    textContent: template.textContent,
    attachment: attachment || [],
  };

  const response = await maileroo.sendTransacEmail(sendSmtpEmail);
  return response;
}

// ---------- Confirmation prompt ----------
function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

// ---------- Main script ----------
async function main() {
  console.log("=".repeat(60));
  console.log("📧 VK Competition - Email Sender (Inbox Optimized)");
  console.log("=".repeat(60));

  // Fetch all published competitions from database
  console.log("\n📚 Fetching competitions from database...");
  const competitions = await prisma.competition.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (competitions.length === 0) {
    console.log("⚠️ No published competitions found in database.");
    process.exit(0);
  }

  console.log(`\n✅ Found ${competitions.length} published competitions:`);
  competitions.forEach((c) => {
    console.log(`   • ${c.title} (deadline: ${c.deadline ? new Date(c.deadline).toLocaleDateString() : "Ongoing"})`);
  });

  const PDF_FILENAME = "painting-competition.pdf";
    const pdfPath = path.join(__dirname, PDF_FILENAME);
    
    if (!fs.existsSync(pdfPath)) {
      console.error(`❌ PDF file "${PDF_FILENAME}" not found in ${__dirname}. Place it in the same folder as this script.`);
      process.exit(1);
    }
  
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfBase64 = pdfBuffer.toString("base64");
    const attachment = [{ name: PDF_FILENAME, content: pdfBase64 }];

  // Fetch all verified, active users
  // const users = await prisma.user.findMany({
  //   where: {
  //     isActive: true,
  //     isEmailVerified: true,
  //   },
  //   select: {
  //     email: true,
  //     name: true,
  //   },
  // });

  const users = [{
    name:"Dhruv Shah", email:"dhruvsh2003@gmail.com"
  }]

  console.log(`\n👥 Found ${users.length} verified active users.`);

  // Show confirmation prompt
  console.log("\n" + "-".repeat(60));
  console.log("This will send a personal-style update email to all users.");
  console.log("-".repeat(60));

  const confirmed = await askConfirmation(`\nSend emails to ${users.length} users? (y/N): `);

  if (!confirmed) {
    console.log("\n❌ Cancelled. No emails sent.");
    process.exit(0);
  }

  console.log("\n🚀 Starting...\n");

  let successCount = 0;
  let failureCount = 0;
  const startTime = Date.now();

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    if (!user.email) continue;

    try {
      // Rate limiting: pause every 5 emails (slower = better deliverability)
      if (successCount > 0 && successCount % 5 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second pause
      }

      const response = await sendEmail(user, competitions, attachment);
      const msgId = response?.body?.messageId || response?.messageId || "OK";
      console.log(`   [${i + 1}/${users.length}] ✓ ${user.email}`);
      successCount++;
    } catch (err) {
      console.error(`   [${i + 1}/${users.length}] ✗ ${user.email}: ${err?.response?.body?.message || err.message}`);
      failureCount++;
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("\n" + "=".repeat(60));
  console.log("Done!");
  console.log(`   Sent: ${successCount} | Failed: ${failureCount} | Time: ${duration}s`);
  console.log("=".repeat(60));
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
