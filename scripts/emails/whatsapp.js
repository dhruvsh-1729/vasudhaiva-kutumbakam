const fs = require("fs");
const path = require("path");
const brevo = require("@getbrevo/brevo");
const { PrismaClient } = require("@prisma/client");

// Load environment variables
require("dotenv").config();

// ---------- Brevo setup ----------
const apiInstance = new brevo.TransactionalEmailsApi();

if (!process.env.BREVO_API_KEY) {
  console.error("❌ BREVO_API_KEY is not set in environment variables.");
  process.exit(1);
}

// Correct API key setup
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

// ---------- Prisma setup ----------
const prisma = new PrismaClient();

// ---------- Email template ----------
function getWeekTwoEmailTemplate(userName) {
  const safeName = userName || "Participant";
  const baseUrl = "https://vkcompetition.jyot.in";
  const whatsappGroupLink = "https://shorturl.at/wUGsc";

  const subject = "Important: Week 2 information for your VK Competition participation";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 16px; background-color: #ffffff; color: #222;">
        <p style="margin: 0 0 16px 0;">Hello ${safeName},</p>

        <p style="margin: 0 0 12px 0;">
          You are receiving this email because you registered as a participant in the
          <strong>VK Competition</strong>. This message contains important information for
          <strong>Week 2</strong>, including how we will share updates and clarify your doubts.
        </p>

        <h3 style="margin: 20px 0 8px 0; font-size: 18px;">Week 2 updates</h3>
        <p style="margin: 0 0 12px 0;">
          We are entering Week 2 of the competition. We will be introducing
          <strong>two additional categories</strong> shortly. As soon as they go live,
          we will share the details with you on the website and through email.
        </p>

        <h3 style="margin: 20px 0 8px 0; font-size: 18px;">Why we request you to join the WhatsApp group</h3>
        <p style="margin: 0 0 12px 0;">
          To make sure you do not miss any important update, clarification, or deadline,
          we are coordinating most of the real-time communication through one official
          WhatsApp group for participants.
        </p>

        <p style="margin: 0 0 8px 0;">
          You can join here:
        </p>
        <p style="margin: 0 0 12px 0;">
          <a href="${whatsappGroupLink}"
             style="display: inline-block; padding: 10px 18px; border-radius: 4px; background-color: #25D366; color: #ffffff; text-decoration: none; font-weight: 600;">
            Join the official VK Competition WhatsApp group
          </a>
        </p>
        <p style="margin: 0 0 12px 0;">
          Or use this plain link in your browser/WhatsApp:
          <br />
          <a href="${whatsappGroupLink}" style="color: #065fd4;">${whatsappGroupLink}</a>
        </p>

        <p style="margin: 0 0 12px 0; font-size: 14px;">
          Inside the group, you will receive:
          <br />– Time-sensitive updates and announcements
          <br />– Clarifications on rules and categories
          <br />– Responses to common questions
          <br />– A direct channel to reach the organizing team
        </p>

        <h3 style="margin: 20px 0 8px 0; font-size: 18px;">Current categories</h3>
        <p style="margin: 0 0 12px 0;">
          You can view the currently active categories and detailed information here:
        </p>
        <p style="margin: 0 0 20px 0;">
          <a href="${baseUrl}/main" style="color: #065fd4;">${baseUrl}/main</a>
        </p>

        <h3 style="margin: 20px 0 8px 0; font-size: 18px;">If you need help</h3>
        <p style="margin: 0 0 8px 0;">
          If you have any issue related to your participation, submissions, or categories, you can:
        </p>
        <ul style="margin: 0 0 12px 18px; padding: 0;">
          <li>Ask in the WhatsApp group (recommended for quick responses)</li>
          <li>Visit our forum: <a href="${baseUrl}/forum" style="color: #065fd4;">${baseUrl}/forum</a></li>
          <li>Email us directly at <a href="mailto:vk4.ki.oar@gmail.com" style="color: #065fd4;">vk4.ki.oar@gmail.com</a></li>
        </ul>

        <p style="margin: 20px 0 0 0;">
          Best regards,<br />
          Dhruv Shah<br />
          VK Competition Team
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

        <p style="margin: 0; font-size: 12px; color: #666;">
          VK Competition Team · Contact: vk4.ki.oar@gmail.com<br />
          Vasudhaiva Kutumbakam – The World is One Family
        </p>
      </body>
    </html>
  `;

  const textContent = `Hello ${safeName},

You are receiving this email because you registered as a participant in the VK Competition.
This message contains important information for Week 2, including how we will share updates and clarify your doubts.

WEEK 2 UPDATES
We are entering Week 2 of the competition. We will be introducing two additional categories shortly.
As soon as they go live, we will share the details with you on the website and through email.

WHY WE REQUEST YOU TO JOIN THE WHATSApp GROUP
To make sure you do not miss any important update, clarification, or deadline, we are coordinating
most of the real-time communication through one official WhatsApp group for participants.

Join the official WhatsApp group:
${whatsappGroupLink}

CURRENT CATEGORIES
You can view the currently active categories here:
${baseUrl}/main

IF YOU NEED HELP
If you have any issue related to your participation, submissions, or categories, you can:
- Ask in the WhatsApp group (recommended)
- Visit our forum: ${baseUrl}/forum
- Email us at: vk4.ki.oar@gmail.com

Best regards,
Dhruv Shah
VK Competition Team

VK Competition Team | Contact: vk4.ki.oar@gmail.com
Vasudhaiva Kutumbakam – The World is One Family`;

  return { subject, htmlContent, textContent };
}

// ---------- Main script ----------
async function main() {
  // For testing, uncomment this line:
  // const users = [{ name: "Dhruv Shah", email: "dhruvsh2003@gmail.com" }];

  // Fetch all users from database
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
    },
  });

  console.log(`Found ${users.length} users. Starting to send emails...`);

  let successCount = 0;
  let failureCount = 0;

  for (const user of users) {
    if (!user.email) continue;

    const userName = user.name || "Participant";
    const template = getWeekTwoEmailTemplate(userName);

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = {
      email: "vk4.ki.oar@gmail.com", // consider using a domain email here if you can
      name: "VK Competition",
    };
    sendSmtpEmail.to = [{ email: user.email, name: userName }];
    sendSmtpEmail.subject = template.subject;
    sendSmtpEmail.htmlContent = template.htmlContent;
    sendSmtpEmail.textContent = template.textContent;
    sendSmtpEmail.replyTo = {
      email: "vk4.ki.oar@gmail.com",
      name: "VK Competition",
    };
    // Optional: tag for Brevo analytics
    sendSmtpEmail.tags = ["vk-competition-week2"];

    try {
      // Small delay between emails to avoid rate limiting / bulk spikes
      if (successCount > 0 && successCount % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(
        `✅ Sent email to ${user.email} (messageId: ${
          response.messageId || "N/A"
        })`
      );
      successCount++;
    } catch (err) {
      console.error(
        `❌ Error sending to ${user.email}:`,
        err?.response?.body || err.message || err
      );
      failureCount++;
    }
  }

  console.log("\nDone sending emails.");
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed:  ${failureCount}`);
}

main()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
