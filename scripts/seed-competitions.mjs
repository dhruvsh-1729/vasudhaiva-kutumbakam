import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import vm from 'vm';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load competitions from the existing static source to keep content in sync
const loadStaticCompetitions = () => {
  const sourcePath = path.join(__dirname, '../data/competitions.js');
  const code = fs.readFileSync(sourcePath, 'utf-8');

  // Quick-and-safe transform from ESM to CJS for this script context
  const cleaned = code.replace(/^import\s.+\n/gm, '');
  const transformed = cleaned
    .replace(/export const /g, 'const ')
    .replace(/export function /g, 'function ')
    .replace(/export default /g, 'const __default__ = ')
    + '\nmodule.exports = { competitions, getCompetitionById, getCompetitionBySlug, getAllCompetitionIds, getAllCompetitionSlugs };';

  const sandboxModule = { exports: {} };
  vm.runInNewContext(transformed, { module: sandboxModule, exports: sandboxModule.exports, require, console, process });
  return sandboxModule.exports;
};

const { competitions: staticCompetitions, getCompetitionById } = loadStaticCompetitions();

const parseDeadline = (deadline) => {
  if (!deadline) return null;
  const d = new Date(deadline);
  return Number.isNaN(d.getTime()) ? null : d;
};

const prizeDefaults = {
  1: { pool: '₹50,000', prizes: { first: '₹25,000', second: '₹15,000', third: '₹10,000' } },
  2: { pool: '₹50,000', prizes: { first: '₹25,000', second: '₹15,000', third: '₹10,000' } },
  3: { pool: '₹39,600', prizes: { first: '₹18,000', second: '₹12,000', third: '₹9,600' } },
  4: { pool: '₹1,76,000', prizes: { first: '₹1,00,000', second: '₹51,000', third: '₹25,000' } },
  5: { pool: '₹26,400', prizes: { first: '₹12,000', second: '₹8,000', third: '₹6,400' } },
};

const competitions = staticCompetitions.map((comp) => {
  const full = getCompetitionById(comp.id);
  const prizeData = prizeDefaults[comp.id] || {};
  return {
    legacyId: comp.id,
    title: comp.title,
    description: comp.description,
    slug: comp.slug,
    icon: comp.icon,
    color: comp.color,
    deadline: parseDeadline(comp.deadline),
    prizePool: prizeData.pool ?? null,
    prizes: prizeData.prizes ?? null,
    sections: full?.sections || [],
    isPublished: true,
  };
});

async function main() {
  for (const comp of competitions) {
    await prisma.competition.upsert({
      where: { legacyId: comp.legacyId },
      update: {
        ...comp,
        deadline: comp.deadline ? new Date(comp.deadline) : null,
      },
      create: {
        ...comp,
        deadline: comp.deadline ? new Date(comp.deadline) : null,
      },
    });
  }
}

main()
  .then(async () => {
    console.log('Competitions seeded');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
