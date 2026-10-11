import { Content } from '../models/Content.js';
import { DEFAULT_CONTENT } from '../utils/defaults.js';
import { clean } from '../utils/text.js';

// GET /api/content -> { homeMessage, surpriseMessage } (created with defaults on first read)
export async function getContent(_req, res) {
  const doc = await Content.findOneAndUpdate({}, { $setOnInsert: DEFAULT_CONTENT }, { upsert: true, new: true });
  res.json(doc);
}

// PUT /api/content  { homeMessage?, surpriseMessage? }
export async function updateContent(req, res) {
  const b = req.body ?? {}, set = {};
  if (b.homeMessage !== undefined) set.homeMessage = clean(b.homeMessage, 1000);
  if (b.surpriseMessage !== undefined) set.surpriseMessage = clean(b.surpriseMessage, 1000);
  // A field may not be in both $set and $setOnInsert (MongoDB rejects it), so defaults only fill what is not being set.
  const defaults = Object.fromEntries(Object.entries(DEFAULT_CONTENT).filter(([k]) => !(k in set)));
  const update = { ...(Object.keys(set).length && { $set: set }), ...(Object.keys(defaults).length && { $setOnInsert: defaults }) };
  const doc = await Content.findOneAndUpdate({}, update, { upsert: true, new: true });
  res.json(doc);
}
