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
function getDirectUploadEmailTemplate(userName) {
  const safeName = userName || "Participant";
  const baseUrl = "https://vkcompetition.jyot.in";
  const whatsappGroupLink = "https://shorturl.at/wUGsc";

  const subject = "Good news: Direct file uploads now available on VK Competition";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 16px; background-color: #ffffff; color: #222;">
        <p style="margin: 0 0 16px 0;">Hello ${safeName},</p>

        <p style="margin: 0 0 12px 0;">
          We have some good news! We have made the submission process easier for you.
        </p>

        <h3 style="margin: 20px 0 8px 0; font-size: 18px;">What's changed?</h3>
        <p style="margin: 0 0 12px 0;">
          You <strong>no longer need to upload your files to Google Drive</strong> and then submit the link on our website.
          You can now <strong>directly upload your files</strong> on the website itself!
        </p>

        <p style="margin: 0 0 12px 0; padding: 12px; background-color: #f0f9ff; border-left: 4px solid #065fd4; border-radius: 4px;">
          <strong>Exception:</strong> Video submissions still need to be submitted via Google Drive links.
          For all other file types, you can upload directly to the website.
        </p>

        <h3 style="margin: 20px 0 8px 0; font-size: 18px;">Why we made this change</h3>
        <p style="margin: 0 0 12px 0;">
          We are constantly working to improve your experience on the VK Competition website.
          This update makes the submission process simpler and saves you one extra step.
        </p>

        <h3 style="margin: 20px 0 8px 0; font-size: 18px;">Submit your work here</h3>
        <p style="margin: 0 0 12px 0;">
          Visit the website to start submitting:
        </p>
        <p style="margin: 0 0 20px 0;">
          <a href="${baseUrl}/main"
             style="display: inline-block; padding: 10px 18px; border-radius: 4px; background-color: #065fd4; color: #ffffff; text-decoration: none; font-weight: 600;">
            Go to VK Competition website
          </a>
        </p>

        <h3 style="margin: 20px 0 8px 0; font-size: 18px;">Have questions?</h3>
        <p style="margin: 0 0 8px 0;">
          If you have any queries or need help with submissions, please reach out to us without any hesitation:
        </p>
        <ul style="margin: 0 0 12px 18px; padding: 0;">
          <li>Join our WhatsApp group: <a href="${whatsappGroupLink}" style="color: #065fd4;">Click here to join</a></li>
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

We have some good news! We have made the submission process easier for you.

WHAT'S CHANGED?
You no longer need to upload your files to Google Drive and then submit the link on our website.
You can now directly upload your files on the website itself!

EXCEPTION: Video submissions still need to be submitted via Google Drive links.
For all other file types, you can upload directly to the website.

WHY WE MADE THIS CHANGE
We are constantly working to improve your experience on the VK Competition website.
This update makes the submission process simpler and saves you one extra step.

SUBMIT YOUR WORK HERE
Visit the website to start submitting:
${baseUrl}/main

HAVE QUESTIONS?
If you have any queries or need help with submissions, please reach out to us without any hesitation:
- Join our WhatsApp group: ${whatsappGroupLink}
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
  console.log("📧 DEBUG: First user:", users[0]); // Debug line

  let successCount = 0;
  let failureCount = 0;

  for (const user of users) {
    if (!user.email) continue;

    const userName = user.name || "Participant";
    const template = getDirectUploadEmailTemplate(userName);

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = {
      email: "vk4.ki.oar@gmail.com",
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
    sendSmtpEmail.tags = ["vk-competition-direct-upload"];

    console.log(`\n📤 Attempting to send to: ${user.email}`); // Debug line
    console.log(`📝 Subject: ${template.subject}`); // Debug line

    try {
      // Small delay between emails to avoid rate limiting / bulk spikes
      if (successCount > 0 && successCount % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`📊 Full response:`, JSON.stringify(response, null, 2)); // Debug line
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
      console.error("Full error object:", JSON.stringify(err, null, 2)); // Debug line
      failureCount++;
    }
  }

  console.log("\n✨ Done sending emails.");
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed:  ${failureCount}`);
  console.log("\n💡 Next steps:");
  console.log("1. Check your Brevo dashboard for email logs");
  console.log("2. Check spam/junk folder");
  console.log("3. Verify sender email is authenticated in Brevo");
}

main()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });