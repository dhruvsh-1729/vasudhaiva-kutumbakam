#!/usr/bin/env node
/**
 * Fetch a user's stored password hash (bcrypt) by email and optionally
 * verify a plaintext candidate against it.
 *
 * Usage:
 *   node scripts/emails/get-password.js <email> [plaintextPassword]
 *
 * Notes:
 * - Passwords are hashed with bcrypt (see pages/api/users/register.ts).
 * - Bcrypt hashes are one-way; you cannot decrypt them. Provide a plaintext
 *   candidate to check if it matches the stored hash.
 */

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

function normalizeEmail(raw) {
  return raw ? String(raw).toLowerCase().trim() : "";
}

async function main() {
  const [emailArg, candidatePassword] = process.argv.slice(2);
  const email = normalizeEmail(emailArg);

  if (!email) {
    console.error("Usage: node scripts/emails/get-password.js <email> [plaintextPassword]");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, password: true },
  });

  if (!user) {
    console.error(`No user found for email: ${email}`);
    process.exit(1);
  }

  console.log(`User: ${user.email}${user.name ? ` (${user.name})` : ""}`);
  console.log(`ID: ${user.id}`);
  console.log(`Stored bcrypt hash: ${user.password}`);

  if (candidatePassword) {
    const matches = await bcrypt.compare(candidatePassword, user.password);
    console.log(
      matches
        ? "✅ Provided plaintext matches the stored hash."
        : "❌ Provided plaintext does NOT match the stored hash."
    );
  } else {
    console.log(
      "No plaintext provided to verify. Bcrypt hashes cannot be decrypted; pass a plaintext password to check it."
    );
  }
}

main()
  .catch((err) => {
    console.error("Error while fetching/verifying password:", err);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      // ignore disconnect errors
    }
  });
