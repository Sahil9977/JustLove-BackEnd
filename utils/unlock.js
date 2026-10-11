// When the love-code page opens. Edit UNLOCK_AT in server/.env to change it (no code change needed).
// ALWAYS include the time zone: IST is +05:30, e.g.  UNLOCK_AT=2026-10-11T12:00:00+05:30
// const DEFAULT_UNLOCK_AT = '2026-10-11T19:32:00+05:30'; // 11 Oct 2026, 12:00 PM India time

export function unlockAt() {
  const raw = (process.env.UNLOCK_AT || DEFAULT_UNLOCK_AT).trim();
  if (!/(Z|[+-]\d\d:?\d\d)$/i.test(raw)) throw new Error(`UNLOCK_AT must end with a time zone, e.g. 2026-10-11T12:00:00+05:30 (got "${raw}")`);
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) throw new Error(`UNLOCK_AT is not a valid date (got "${raw}")`);
  return d;
}
export const isUnlocked = () => Date.now() >= unlockAt().getTime();