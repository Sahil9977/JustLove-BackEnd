import { unlockAt, isUnlocked } from '../utils/unlock.js';

// GET /api/timer (public) -> { unlockAt, now, unlocked }
// `now` is the SERVER's clock, so the countdown stays right even if the visitor's device clock is wrong.
export function getTimer(_req, res) {
  res.set('Cache-Control', 'no-store');
  res.json({ unlockAt: unlockAt().toISOString(), now: new Date().toISOString(), unlocked: isUnlocked() });
}