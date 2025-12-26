const { PrismaClient } = require("@prisma/client");
const maileroo = require("./maileroo-client");

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

// ---------- Generate competition HTML section ----------
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

  return `
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid ${competition.color || "#007bff"};">
      <h4 style="color: #333; margin: 0 0 10px 0;">${competition.icon || "🏆"} ${competition.title}</h4>
      <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">${competition.description || ""}</p>
      ${first || second || third ? `
      <div style="font-size: 14px;">
        ${first ? `<div>🥇 1st Place: <strong>${formatPrize(first)}</strong></div>` : ""}
        ${second ? `<div>🥈 2nd Place: <strong>${formatPrize(second)}</strong></div>` : ""}
        ${third ? `<div>🥉 3rd Place: <strong>${formatPrize(third)}</strong></div>` : ""}
      </div>
      ` : ""}
      <p style="color: #888; font-size: 12px; margin: 10px 0 0 0;">📅 Deadline: ${deadlineText}</p>
    </div>
  `;
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

  let text = `\n${competition.icon || "🏆"} ${competition.title}\n`;
  text += `${competition.description || ""}\n`;
  if (first) text += `🥇 1st Place: ${formatPrize(first)}\n`;
  if (second) text += `🥈 2nd Place: ${formatPrize(second)}\n`;
  if (third) text += `🥉 3rd Place: ${formatPrize(third)}\n`;
  text += `📅 Deadline: ${deadlineText}\n`;

  return text;
}

// ---------- Email template ----------
function getEmailTemplate(userName, competitions) {
  const safeName = userName || "Participant";
  const baseUrl = "https://vkcompetition.jyot.in";
  const forumUrl = "https://vkcompetition.jyot.in/forum";
  const winnersUrl = "https://vkcompetition.jyot.in/winners";

  // Calculate total prize pool
  let totalPrizePool = 0;
  competitions.forEach((comp) => {
    if (comp.prizePool) {
      const num = parseInt(comp.prizePool.replace(/[^\d]/g, ""));
      if (!isNaN(num)) totalPrizePool += num;
    }
  });

  const competitionsHtml = competitions.map(generateCompetitionSection).join("");
  const competitionsText = competitions.map(generateCompetitionText).join("\n");

  const subject = "🎉 New Categories Open + Phase 1 Winners Announced!";

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <h2 style="color: #333;">Hello ${safeName}! 👋</h2>
        
        <p>We have some exciting updates from the VK Competition!</p>
        
        <!-- Winners Announcement -->
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffc107;">
          <h3 style="color: #856404; margin: 0 0 15px 0;">🏆 Phase 1 Winners Announced!</h3>
          <p style="color: #856404; margin: 0 0 15px 0;">
            Congratulations to all the winners from the first two weeks of competition! 
            Your creativity and dedication have been truly inspiring.
          </p>
          <a href="${winnersUrl}" style="display: inline-block; background-color: #ffc107; color: #856404; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            🎊 View Winners
          </a>
        </div>
        
        <!-- New Categories -->
        <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #28a745;">
          <h3 style="color: #155724; margin: 0 0 15px 0;">🚀 New Categories Now Open!</h3>
          <p style="color: #155724; margin: 0;">
            Fresh opportunities await! We've opened new competition categories for you to showcase your talents.
            ${totalPrizePool > 0 ? `<strong>Total prizes worth ₹${totalPrizePool.toLocaleString("en-IN")}!</strong>` : ""}
          </p>
        </div>
        
        <h3 style="color: #333; margin-top: 25px;">Available Competitions:</h3>
        
        ${competitionsHtml}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/main" style="display: inline-block; background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
            🎯 Submit Your Entry Now
          </a>
        </div>
        
        <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #1976D2;">
            <strong>💡 Pro Tip:</strong> Start early and take your time to create something amazing. 
            Quality submissions always stand out to our judges!
          </p>
        </div>
        
        <p style="margin-top: 25px;"><strong>Need help or have questions?</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Visit our <a href="${forumUrl}" style="color: #007bff;">Community Forum</a> to connect with other participants</li>
          <li>Email us at <a href="mailto:vk4.ki.oar@gmail.com" style="color: #007bff;">vk4.ki.oar@gmail.com</a></li>
        </ul>
        
        <p style="margin-top: 30px;">
          Best of luck with your submissions!<br><br>
          Warm regards,<br>
          <strong>Dhruv Shah</strong><br>
          VK Competition Team
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          VK Competition | Vasudhaiva Kutumbakam - The World is One Family<br>
          <a href="mailto:vk4.ki.oar@gmail.com" style="color: #999;">vk4.ki.oar@gmail.com</a>
        </p>
      </body>
    </html>
  `;

  const textContent = `
Hello ${safeName}! 👋

We have some exciting updates from the VK Competition!

🏆 PHASE 1 WINNERS ANNOUNCED!
Congratulations to all the winners from the first two weeks of competition! 
Your creativity and dedication have been truly inspiring.
View Winners: ${winnersUrl}

🚀 NEW CATEGORIES NOW OPEN!
Fresh opportunities await! We've opened new competition categories for you to showcase your talents.
${totalPrizePool > 0 ? `Total prizes worth ₹${totalPrizePool.toLocaleString("en-IN")}!` : ""}

AVAILABLE COMPETITIONS:
${competitionsText}

🎯 Submit Your Entry: ${baseUrl}/main

💡 Pro Tip: Start early and take your time to create something amazing. 
Quality submissions always stand out to our judges!

Need help or have questions?
- Visit our Community Forum: ${forumUrl}
- Email us at: vk4.ki.oar@gmail.com

Best of luck with your submissions!

Warm regards,
Dhruv Shah
VK Competition Team

---
VK Competition | Vasudhaiva Kutumbakam - The World is One Family
Contact: vk4.ki.oar@gmail.com
  `;

  return { subject, htmlContent, textContent };
}

// ---------- Send email function ----------
async function sendEmail(user, competitions) {
  const userName = user.name || "Participant";
  const template = getEmailTemplate(userName, competitions);

  const sendSmtpEmail = {
    sender: { email: "vk4.ki.oar@gmail.com", name: "VK Competition" },
    to: [{ email: user.email, name: userName }],
    subject: template.subject,
    htmlContent: template.htmlContent,
    textContent: template.textContent,
    headers: {
      "X-Mailer": "VK Competition System",
      "X-Priority": "3",
      "Precedence": "bulk",
      "Auto-Submitted": "auto-generated",
    },
    tags: ["transactional", "new-categories", "winners-announcement"],
  };

  const response = await maileroo.sendTransacEmail(sendSmtpEmail);
  return response;
}

// ---------- Main script ----------
async function main() {
  const args = process.argv.slice(2);
  const isDemoMode = args.includes("--demo");
  const demoEmail = args.find((arg) => arg.startsWith("--email="))?.split("=")[1];

  // Fetch all published competitions from database
  console.log("📚 Fetching competitions from database...");
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
    console.log("   Add competitions to the database first.");
    process.exit(0);
  }

  console.log(`✅ Found ${competitions.length} published competitions:`);
  competitions.forEach((c) => {
    console.log(`   - ${c.title} (${c.slug})`);
  });

  let users;

  if (isDemoMode) {
    // Demo mode - send to a single test email
    const testEmail = demoEmail || "dhruvsh2003@gmail.com";
    const testName = "Dhruv Shah";
    users = [{ name: testName, email: testEmail }];
    console.log(`\n🧪 Demo mode: Sending test email to ${testEmail}`);
  } else {
    // Production mode - fetch all users
    users = await prisma.user.findMany({
      where: {
        isActive: true,
        isEmailVerified: true,
      },
      select: {
        email: true,
        name: true,
      },
    });
    console.log(`\n📧 Production mode: Found ${users.length} verified users`);
  }

  let successCount = 0;
  let failureCount = 0;

  for (const user of users) {
    if (!user.email) continue;

    try {
      // Add delay between emails to avoid rate limiting
      if (successCount > 0 && successCount % 10 === 0) {
        console.log("⏳ Pausing briefly to avoid rate limits...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const response = await sendEmail(user, competitions);
      const msgId = response?.body?.messageId || response?.messageId || "N/A";
      console.log(`✅ Sent to ${user.email} (messageId: ${msgId})`);
      successCount++;
    } catch (err) {
      console.error(`❌ Failed to send to ${user.email}:`, err?.response?.body || err.message);
      failureCount++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 Summary:");
  console.log(`   ✅ Sent successfully: ${successCount}`);
  console.log(`   ❌ Failed: ${failureCount}`);
  console.log("=".repeat(50));
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
