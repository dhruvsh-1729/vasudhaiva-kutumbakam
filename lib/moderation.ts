const bannedKeywords = [
  'spam', 'abuse', 'scam', 'malware'
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
