const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

/**
 * Export ALL users with ALL fields to CSV.
 * - DB: Prisma
 * - Output: ./out/all-users-export-<timestamp>.csv
 *
 * Usage:
 *   node scripts/export-all.js
 */


const prisma = new PrismaClient();

/** Convert any value to CSV-safe string */
function toCsvValue(value) {
  if (value === null || value === undefined) return "";
  
  let str = String(value);
  
  // Handle dates
  if (value instanceof Date) {
    str = value.toISOString();
  }
  
  // Handle objects/arrays
  if (typeof value === "object" && !(value instanceof Date)) {
    str = JSON.stringify(value);
  }
  
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  str = str.replace(/"/g, '""');
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    str = `"${str}"`;
  }
  
  return str;
}

async function main() {
  console.log("Fetching all users with all fields...");

  // Fetch ALL users with ALL fields (no select clause)
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
  });

  console.log(`Fetched: ${users.length} users`);

  if (users.length === 0) {
    console.log("No users found.");
    return;
  }

  // Get all possible field names from the first user
  const allFields = Object.keys(users[0]);
  
  // Prepare output
  const outDir = path.join(process.cwd(), "out");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
  const csvPath = path.join(outDir, `all-users-export-${timestamp}.csv`);

  // Generate CSV
  const csvLines = [];
  
  // Header row
  csvLines.push(allFields.join(","));
  
  // Data rows
  for (const user of users) {
    const row = allFields.map(field => toCsvValue(user[field]));
    csvLines.push(row.join(","));
  }

  fs.writeFileSync(csvPath, csvLines.join("\n"), "utf8");

  console.log(`\nExported ${users.length} users to: ${csvPath}`);
  console.log(`\nFields included: ${allFields.join(", ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());