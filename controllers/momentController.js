import { Moment } from '../models/Moment.js';
import { nextOrder, findOr404 } from './crud.js';
import { clean } from '../utils/text.js';

const fields = (b = {}) => ({
  ...(b.date !== undefined && { date: clean(b.date, 60) }),
  ...(b.title !== undefined && { title: clean(b.title, 120) }),
  ...(b.text !== undefined && { text: clean(b.text, 1500) }),
});

// GET /api/moments
export const listMoments = async (_req, res) => res.json(await Moment.find().sort('order createdAt'));

// POST /api/moments  { date, title, text }
export async function createMoment(req, res) {
  res.status(201).json(await Moment.create({ ...fields(req.body), order: await nextOrder(Moment) }));
}

// PATCH /api/moments/:id
export async function updateMoment(req, res) {
  const m = await findOr404(Moment, req.params.id);
  m.set(fields(req.body));
  await m.save();
  res.json(m);
}

// DELETE /api/moments/:id
export async function deleteMoment(req, res) {
  const m = await findOr404(Moment, req.params.id, '_id');
  await m.deleteOne();
  res.json({ ok: true });
}
