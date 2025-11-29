import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const competitions = await prisma.competition.findMany({
    select: { legacyId: true, title: true, sections: true },
    orderBy: { legacyId: 'asc' },
  });

  const outDir = path.join(__dirname, 'out');
  const outPath = path.join(outDir, 'competition-guidelines.json');

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const payload = competitions.map((comp) => ({
    legacyId: comp.legacyId,
    title: comp.title,
    sections: comp.sections || [],
  }));

  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Exported ${competitions.length} competitions to ${outPath}`);
}

main()
  .catch(async (error) => {
    console.error('Failed to export competition guidelines', error);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
