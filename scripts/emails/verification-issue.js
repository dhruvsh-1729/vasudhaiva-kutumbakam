const { PrismaClient } = require("@prisma/client");
const readline = require("readline");
const maileroo = require("../maileroo-client");

// Load environment variables
require("dotenv").config();

// ---------- Prisma setup ----------
const prisma = new PrismaClient();

// ---------- Helpers ----------
function askConfirmation(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      // resolve(answer.trim().toLowerCase() === "y" || answer.trim().toLowerCase() === "yes");
      resolve(true); // auto-confirm for testing
    });
  });
}

function getEmailTemplate(userName) {
  const safeName = userName || "there";
  const baseUrl = "https://vkcompetition.jyot.in";
  const subject = "Your VK account is verified — you can log in";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto; padding: 18px;">
  <p style="margin:0 0 12px 0;">Hi ${safeName},</p>

  <p style="margin:0 0 12px 0;">We ran into an issue with our mailing system, so you may not have received the email to verify your account when you registered.</p>

  <p style="margin:0 0 12px 0;">To keep things moving, we have manually verified your Vasudhaiva Kutumbakam account. You can log in and continue making submissions in the open categories.</p>

  <p style="margin:0 0 12px 0;"><a href="${baseUrl}/main" style="color:#0b57d0; text-decoration:none;">Log in and view open categories</a></p>

  <p style="margin:0 0 12px 0;">If you already verified earlier, there is nothing else you need to do. We're sorry for the severe inconvenience and appreciate your patience.</p>

  <p style="margin:24px 0 0 0;">— Vasudhaiva Kutumbakam Team</p>
</body>
</html>
  `.trim();

  const textContent = `
Hi ${safeName},

We ran into an issue with our mailing system, so you may not have received the email to verify your account.

To keep things moving, we have manually verified your Vasudhaiva Kutumbakam account. You can log in and continue making submissions in the open categories here: ${baseUrl}/main

If you already verified earlier, there is nothing else you need to do. We're sorry for the severe inconvenience and appreciate your patience.

— Vasudhaiva Kutumbakam Team
  `.trim();

  return { subject, htmlContent, textContent };
}

async function sendEmail(user, senderEmail) {
  const firstName = user.name?.split(" ")[0] || "there";
  const { subject, htmlContent, textContent } = getEmailTemplate(firstName);

  const sendSmtpEmail = {
    sender: { email: senderEmail || "vk4.ki.oar@e696732678450cac.maileroo.org", name: "Vasudhaiva Kutumbakam" },
    to: [{ email: user.email, name: user.name || "Participant" }],
    subject,
    htmlContent,
    textContent,
  };

  return maileroo.sendTransacEmail(sendSmtpEmail);
}

// ---------- Main ----------
async function main() {
  console.log("=".repeat(60));
  console.log("📧 VK Competition - Verification Issue Notice");
  console.log("=".repeat(60));

  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // last 20 days
        lt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // up to 10 days ago
      }
    },
    select: { email: true, name: true },
  });

  // const users = [{ name: "Dhruv Shah", email:"dhruv@chillsubs.com"}]

  const targets = users.filter((u) => !!u.email);
  console.log(`\n👥 Found ${targets.length} active users with emails.`);

  // const confirmed = await askConfirmation(`Send the verification notice to ${targets.length} users? (y/N): `);
  // if (!confirmed) {
  //   console.log("Cancelled. No emails sent.");
  //   process.exit(0);
  // }

  let successCount = 0;
  let failureCount = 0;
  const startTime = Date.now();

  for (let i = 0; i < targets.length; i++) {
    const user = targets[i];
    try {
      if (successCount > 0 && successCount % 25 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // gentle pause
      }

      await sendEmail(user);
      successCount++;
      console.log(`   [${i + 1}/${targets.length}] ✓ ${user.email}`);
    } catch (err) {
      failureCount++;
      const message = err?.response?.body?.message || err.message || "Unknown error";
      console.error(`   [${i + 1}/${targets.length}] ✗ ${user.email}: ${message}`);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("\n" + "=".repeat(60));
  console.log("Done!");
  console.log(`Sent: ${successCount} | Failed: ${failureCount} | Time: ${duration}s`);
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
