/** «andrea.salas@empresa.pe» → «an•••••@empresa.pe». */
export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  return `${user.slice(0, 2)}•••••@${domain}`;
}

export function onlyDigits(value: string, max = 11): string {
  return value.replace(/\D/g, '').slice(0, max);
}

export function initials(name: string): string {
  const words = name
    .replace(/[^\p{L}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase() || 'U';
}
