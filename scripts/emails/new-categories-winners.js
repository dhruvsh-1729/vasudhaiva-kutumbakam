#!/usr/bin/env node

// Load environment variables (MAILEROO_API_KEY, DATABASE_URL, NEXT_PUBLIC_BASE_URL, etc.)
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const maileroo = require("../maileroo-client");

// ---------- Prisma setup ----------
const prisma = new PrismaClient();

const BASE_URL =
  (process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.APP_BASE_URL ||
    "https://vkcompetition.jyot.in").replace(/\/$/, "");
const DASHBOARD_URL = `${BASE_URL}/main`;
const FORUM_URL = `${BASE_URL}/forum`;
const WINNERS_URL = `${BASE_URL}`;

// ---------- Helpers ----------
function parseArgs(argv) {
  const options = {
    sendAll: false,
    to: process.env.DEMO_EMAIL || null,
    name: process.env.DEMO_NAME || "Participant",
    newSlugs: [],
    limit: null,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--all") {
      options.sendAll = true;
    } else if ((arg === "--to" || arg === "-t") && argv[i + 1]) {
      options.to = argv[++i];
    } else if ((arg === "--name" || arg === "-n") && argv[i + 1]) {
      options.name = argv[++i];
    } else if ((arg === "--new" || arg === "--slugs") && argv[i + 1]) {
      options.newSlugs = argv[++i]
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    } else if (arg === "--limit" && argv[i + 1]) {
      const parsed = parseInt(argv[++i], 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        options.limit = parsed;
      }
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    }
  }

  return options;
}

function formatDate(date) {
  if (!date) return null;
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch (err) {
    return null;
  }
}

function normalizePrizeEntries(prizes) {
  if (!prizes || typeof prizes !== "object") return [];
  const preferredOrder = ["first", "second", "third", "special", "consolation"];
  const entries = Object.entries(prizes)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => {
      const label = key.replace(/_/g, " ");
      const pretty =
        label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
      return { key, label: pretty, value: String(value) };
    });

  entries.sort((a, b) => {
    const aIndex = preferredOrder.indexOf(a.key.toLowerCase());
    const bIndex = preferredOrder.indexOf(b.key.toLowerCase());
    if (aIndex === -1 && bIndex === -1) return a.label.localeCompare(b.label);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return entries;
}

function buildCompetitionBlocks(competitions) {
  const htmlParts = [];
  const textParts = [];

  competitions.forEach((comp) => {
    const prizeEntries = normalizePrizeEntries(comp.prizes);
    const deadline = formatDate(comp.deadline);

    const prizeHtml = prizeEntries.length
      ? `<ul style="margin: 8px 0 0 18px; padding: 0; color: #0f172a; font-size: 14px;">${prizeEntries
          .map(
            (entry) =>
              `<li style="margin: 2px 0;">${entry.label}: ${entry.value}</li>`
          )
          .join("")}</ul>`
      : `<p style="margin: 8px 0 0 0; color: #475569; font-size: 14px;">Prize details will be shared soon.</p>`;

    const prizeText = prizeEntries.length
      ? prizeEntries.map((entry) => `- ${entry.label}: ${entry.value}`).join("\n")
      : "Prize details will be shared soon.";

    htmlParts.push(
      `<div style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; margin-bottom: 12px; background: #f8fafc;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
          <div style="font-weight: 700; color: #0f172a;">${comp.title}</div>
          ${
            deadline
              ? `<div style="font-size: 12px; color: #475569;">Deadline: ${deadline}</div>`
              : ""
          }
        </div>
        ${
          comp.prizePool
            ? `<div style="margin-top: 6px; color: #334155; font-size: 14px;">Prize pool: ${comp.prizePool}</div>`
            : ""
        }
        ${prizeHtml}
      </div>`
    );

    const textLines = [
      comp.title,
      comp.prizePool ? `Prize pool: ${comp.prizePool}` : "",
      prizeText,
      deadline ? `Deadline: ${deadline}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    textParts.push(textLines);
  });

  return {
    html: htmlParts.join(""),
    text: textParts.join("\n\n"),
  };
}

function getEmailTemplate(userName, competitions, newCompetitions) {
  const safeName = userName || "Participant";
  const newSectionSource =
    newCompetitions && newCompetitions.length ? newCompetitions : competitions;

  const newBlocks = buildCompetitionBlocks(newSectionSource);
  const allBlocks = buildCompetitionBlocks(competitions);

  const subject =
    "New categories are live + Week 1 and Week 2 winners announced";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject}</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f5f7fb; font-family:'Segoe UI', Tahoma, sans-serif; color:#0f172a;">
        <div style="max-width:640px; margin:0 auto; background:#ffffff; padding:24px 22px 28px; border-radius:12px; box-shadow:0 10px 25px rgba(15, 23, 42, 0.08);">
          <p style="margin:0 0 10px 0; color:#475569; font-size:14px;">Hello ${safeName},</p>
          <p style="margin:0 0 14px 0; font-size:16px; line-height:1.6; color:#0f172a;">
            We have just added fresh categories to the VK Competition and the winners for Weeks 1 and 2 are published.
            You can review the highlights below and submit directly from your dashboard.
          </p>

          <div style="border:1px solid #e2e8f0; border-radius:10px; padding:14px 16px; background:#f8fafc; margin-bottom:18px;">
            <div style="font-weight:700; color:#0f172a; margin-bottom:6px;">New categories</div>
            ${newBlocks.html}
          </div>

          <div style="border:1px solid #e2e8f0; border-radius:10px; padding:14px 16px; background:#fff7ed; margin-bottom:18px;">
            <div style="font-weight:700; color:#9a3412; margin-bottom:6px;">Week 1 and Week 2 winners</div>
            <p style="margin:0 0 8px 0; color:#7c2d12; font-size:14px;">
              Congratulations to everyone who placed in the first two weeks. You can see the announcement here:
              <a href="${WINNERS_URL}" style="color:#b45309; text-decoration:none;">View winners</a>.
            </p>
          </div>

          <div style="border:1px solid #e2e8f0; border-radius:10px; padding:14px 16px; background:#f8fafc; margin-bottom:18px;">
            <div style="font-weight:700; color:#0f172a; margin-bottom:6px;">Prizes at a glance</div>
            ${allBlocks.html}
          </div>

          <div style="text-align:center; margin:22px 0 10px;">
            <a href="${DASHBOARD_URL}" style="display:inline-block; background:#0f172a; color:#ffffff; text-decoration:none; padding:12px 26px; border-radius:8px; font-weight:700;">
              Go to dashboard
            </a>
          </div>

          <p style="margin:16px 0 6px 0; color:#475569; font-size:14px;">
            Need help? Visit the forum (${FORUM_URL}) or reply to this email.
          </p>

          <p style="margin:10px 0 0 0; color:#475569; font-size:14px;">
            Best regards,<br/>
            VK Competition Team
          </p>
        </div>
      </body>
    </html>
  `;

  const textContent = `
Hello ${safeName},

We have added new categories and published winners for Weeks 1 and 2. You can review the details below and submit from your dashboard.

New categories:
${newBlocks.text}

Prizes at a glance:
${allBlocks.text}

Week 1 and Week 2 winners:
${WINNERS_URL}

Submit your entry: ${DASHBOARD_URL}
Need help? Visit the forum: ${FORUM_URL} or reply to this email.

Best regards,
VK Competition Team
  `.trim();

  return { subject, htmlContent, textContent };
}

async function fetchCompetitions(newSlugs) {
  const competitions = await prisma.competition.findMany({
    where: { isPublished: true },
    select: {
      title: true,
      slug: true,
      prizePool: true,
      prizes: true,
      deadline: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const slugSet = new Set((newSlugs || []).map((s) => s.toLowerCase()));
  let newCompetitions = competitions;

  if (slugSet.size > 0) {
    newCompetitions = competitions.filter((comp) =>
      slugSet.has(comp.slug.toLowerCase())
    );
  } else if (competitions.length > 3) {
    newCompetitions = competitions.slice(0, 3);
  }

  return { competitions, newCompetitions };
}

async function getRecipients(options) {
  if (options.sendAll) {
    const users = await prisma.user.findMany({
      select: { email: true, name: true },
      where: { email: { not: null } },
      orderBy: { createdAt: "asc" },
    });
    const filtered = users.filter((user) => !!user.email);
    if (options.limit) {
      return filtered.slice(0, options.limit);
    }
    return filtered;
  }

  if (!options.to) {
    console.error(
      "❌ No demo recipient found. Provide --to user@example.com or set DEMO_EMAIL."
    );
    process.exit(1);
  }

  return [
    {
      email: options.to,
      name: options.name || "Participant",
    },
  ];
}

async function sendEmail(recipient, template, tags) {
  const payload = {
    sender: {
      email: process.env.SENDER_EMAIL || "vk4.ki.oar@gmail.com",
      name: process.env.SENDER_NAME || "VK Competition",
    },
    to: [{ email: recipient.email, name: recipient.name || "Participant" }],
    subject: template.subject,
    htmlContent: template.htmlContent,
    textContent: template.textContent,
    headers: {
      "X-Mailer": "VK Competition System",
      "X-Priority": "3",
      Precedence: "bulk",
      "Auto-Submitted": "auto-generated",
    },
    tags,
  };

  return maileroo.sendTransacEmail(payload);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------- Main script ----------
async function main() {
  const options = parseArgs(process.argv.slice(2));
  const { competitions, newCompetitions } = await fetchCompetitions(
    options.newSlugs
  );

  if (!competitions.length) {
    console.error("❌ No competitions found. Please seed the database first.");
    process.exit(1);
  }

  const recipients = await getRecipients(options);
  if (!recipients.length) {
    console.error("❌ No recipients found to send emails.");
    process.exit(1);
  }

  const tags = [
    "transactional",
    "new-categories",
    options.sendAll ? "bulk" : "demo",
  ];

  const previewTemplate = getEmailTemplate(
    recipients[0].name,
    competitions,
    newCompetitions
  );

  console.log(
    `Prepared email "${previewTemplate.subject}" for ${recipients.length} recipient(s).`
  );

  if (options.dryRun) {
    console.log("Dry run mode enabled. No emails were sent.");
    return;
  }

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    const template = getEmailTemplate(
      recipient.name,
      competitions,
      newCompetitions
    );

    try {
      const response = await sendEmail(recipient, template, tags);
      const messageId =
        (response && response.body && response.body.messageId) ||
        response.messageId;
      console.log(
        `✅ Sent to ${recipient.email} (messageId: ${messageId || "N/A"})`
      );
      successCount++;
    } catch (err) {
      console.error(
        `❌ Error sending to ${recipient.email}:`,
        err?.response?.body || err
      );
      failureCount++;
    }

    if ((i + 1) % 10 === 0) {
      await sleep(800);
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
