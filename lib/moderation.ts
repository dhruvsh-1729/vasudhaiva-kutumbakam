const bannedKeywords = [
  'abuse',
  'harass',
  'hate',
  'kill',
  'suicide',
  'sexual',
  'porn',
  'nude',
  'fuck',
  'shit',
  'bakchod',
  'mc',
  'bc',
  'chutiya',
  'harami',
  'gaand',
  'madarchod',
  'bhosdi',
  'बेवकूफ',
  'गंदा',
  'गाली',
  'मूर्ख',
  'कुत्ता',
  'कमीना',
  'साला',
];

export function detectAbuse(text: string): string[] {
  const normalized = text.toLowerCase();
  return bannedKeywords.filter((kw) => normalized.includes(kw.toLowerCase()));
}

export function ensureCleanContent(text: string): { ok: boolean; blocked?: string[] } {
  const blocked = detectAbuse(text);
  if (blocked.length > 0) {
    return { ok: false, blocked };
  }
  return { ok: true };
}
