import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DIRECT_UPLOAD_LINE = 'Use the submission panel on this page to upload your file directly (no Google Drive link needed).';
const UPLOAD_CHECK_LINE = 'Double-check your uploaded file opens correctly after upload.';

const replacementRules = [
  { regex: /•\s*Only\s+Google\s*drive\s*links\s*accepted\.?/gi, replace: `• ${DIRECT_UPLOAD_LINE}` },
  { regex: /Only\s+Google\s*drive\s*links\s*accepted\.?/gi, replace: DIRECT_UPLOAD_LINE },
  { regex: /Ensure\s+Google\s*Drive\s+link\s+permissions\s+are\s+set\s+to\s+["“]?Anyone with the link can view["”]?\.?/gi, replace: UPLOAD_CHECK_LINE },
  { regex: /Google\s*Drive\s+link\s+permissions\s+are\s+set\s+to\s+["“]?anyone with the link can view["”]?\.?/gi, replace: UPLOAD_CHECK_LINE },
];

const driveRegex = /google\s*drive/i;
const directUploadRegex = /(upload your file directly|upload.*submission panel|use the submission panel)/i;
const removeAnyoneCanView = (text) => {
  const lines = text.split('\n');
  const filtered = lines.filter((line) => !/anyone with the link can view/i.test(line));
  return filtered.join('\n').trim();
};

function transformSection(section, legacyId) {
  if (!section || typeof section !== 'object' || typeof section.content !== 'string' || legacyId === 1) {
    return { section, changed: false };
  }

  let content = section.content;
  let changed = false;

  for (const { regex, replace } of replacementRules) {
    if (regex.test(content)) {
      content = content.replace(regex, replace);
      changed = true;
    }
  }

  const hadDrive = driveRegex.test(section.content);
  const hasDriveNow = driveRegex.test(content);
  const mentionsDirectUpload = directUploadRegex.test(content);

  if (hadDrive && !hasDriveNow && !mentionsDirectUpload) {
    const submissionProcessRegex = /(\*\*Submission Process:\*\*\s*\n)((?:.|\n)*?)(\n\s*\*\*|$)/i;
    if (submissionProcessRegex.test(content)) {
      content = content.replace(submissionProcessRegex, (match, heading, body, tail) => {
        const trimmedBody = body.trimEnd();
        const needsTrailingNewline = trimmedBody.endsWith('\n') ? '' : '\n';
        return `${heading}${trimmedBody}${needsTrailingNewline}• ${DIRECT_UPLOAD_LINE}\n${tail}`;
      });
    } else {
      content = `${content}\n\n• ${DIRECT_UPLOAD_LINE}`;
    }
    changed = true;
  }

  content = content.replace(/\n{3,}/g, '\n\n').trim();

  const cleaned = removeAnyoneCanView(content);
  if (cleaned !== content) {
    changed = true;
    content = cleaned;
  }

  if (content !== section.content) {
    changed = true;
  }

  return { section: { ...section, content }, changed };
}

async function main() {
  const competitions = await prisma.competition.findMany({
    select: { legacyId: true, sections: true, title: true },
    orderBy: { legacyId: 'asc' },
  });

  let updatedCount = 0;
  const updates = [];

  for (const comp of competitions) {
    if (comp.legacyId === 1) continue; // Video competition keeps Google Drive instructions

    const sectionsArray = Array.isArray(comp.sections) ? comp.sections : [];
    let sectionChanged = false;

    const nextSections = sectionsArray.map((section) => {
      const { section: newSection, changed } = transformSection(section, comp.legacyId);
      if (changed) sectionChanged = true;
      return newSection;
    });

    if (sectionChanged) {
      await prisma.competition.update({
        where: { legacyId: comp.legacyId },
        data: { sections: nextSections },
      });
      updatedCount += 1;
      updates.push(`Updated competition ${comp.legacyId} (${comp.title})`);
    }
  }

  console.log(`Guidelines update finished. Competitions changed: ${updatedCount}/${competitions.length}`);
  updates.forEach((line) => console.log(line));
}

main()
  .catch(async (error) => {
    console.error('Failed to update competition guidelines', error);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
