#!/usr/bin/env node

/**
 * Export users created on/after an IST date to CSV/TXT for manual Gmail sending.
 * - DB: Prisma
 * - Output: ./out/manual-verification-<date>.csv and emails.txt
 *
 * Usage:
 *   node scripts/export-emails.js --since 2025-11-10
 *   node scripts/export-emails.js             (defaults to 2025-11-10)
 */

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function parseArgs() {
  const argv = process.argv.slice(2);
  const args = { since: "2025-11-10" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--since" && argv[i + 1]) args.since = argv[++i];
  }
  return args;
}

/** Convert local IST date (YYYY-MM-DD at 00:00 IST) to UTC Date for DB filter */
function istMidnightToUtc(yyyyMmDd) {
  // IST = UTC+05:30; IST 00:00 equals UTC previous day 18:30
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  utc.setUTCHours(utc.getUTCHours() - 5, utc.getUTCMinutes() - 30);
  return utc;
}

async function main() {
  const { since } = parseArgs();
  const cutoffUtc = istMidnightToUtc(since);

  console.log(`Cutoff IST date: ${since}`);
  console.log(`Cutoff as UTC : ${cutoffUtc.toISOString()}`);

  // Fetch minimal fields; tweak select if your schema differs
  const users = await prisma.user.findMany({
    where: { createdAt: { gte: cutoffUtc } },
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // De-duplicate by normalized email
  const seen = new Set();
  const deduped = users.filter((u) => {
    const e = (u.email || "").trim().toLowerCase();
    if (!e || !e.includes("@")) return false;
    if (seen.has(e)) return false;
    seen.add(e);
    return true;
  });

  console.log(`Fetched: ${users.length} | After de-dup: ${deduped.length}`);

  // Prepare outputs
  const outDir = path.join(process.cwd(), "out");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const stamp = since.replace(/-/g, "");
  const csvPath = path.join(outDir, `manual-verification-${stamp}.csv`);
  const txtPath = path.join(outDir, `manual-verification-${stamp}-emails.txt`);

  // CSV (for Sheets/Mail Merge): email,name,createdAtISO,id
  const csvLines = [
    "email,name,createdAtISO,id",
    ...deduped.map((u) =>
      [
        (u.email || "").trim(),
        (u.name || "").replaceAll('"', '""'),
        u.createdAt.toISOString(),
        u.id,
      ]
        .map((x) => (x?.includes(",") ? `"${x}"` : x))
        .join(",")
    ),
  ];
  fs.writeFileSync(csvPath, csvLines.join("\n"), "utf8");

  // TXT list of emails (comma-separated) — handy for BCC
  const emailList = deduped.map((u) => (u.email || "").trim()).join(", ");
  fs.writeFileSync(txtPath, emailList, "utf8");

  console.log(`\nWrote:\n  ${csvPath}\n  ${txtPath}`);
  console.log(
    "\nNext steps:\n- Use TXT for quick BCC batches in Gmail, or\n- Import CSV into Google Sheets for a Mail Merge."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
