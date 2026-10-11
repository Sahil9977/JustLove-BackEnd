import { isId, HttpError } from '../utils/text.js';

// Shared helpers for ordered collections (photos, moments).
export const nextOrder = async (Model) => {
  const last = await Model.findOne().sort('-order').select('order').lean();
  return last ? last.order + 1 : 0;
};

export const findOr404 = async (Model, id, select = '') => {
  if (!isId(id)) throw new HttpError(400, 'Invalid id.');
  const doc = await Model.findById(id).select(select);
  if (!doc) throw new HttpError(404, 'Not found');
  return doc;
};

// PUT /reorder  { ids: [id, id, ...] }  -> saves the new order
export const reorderHandler = (Model) => async (req, res) => {
  const ids = req.body?.ids;
  if (!Array.isArray(ids) || !ids.every(isId)) throw new HttpError(400, 'ids must be a list of valid ids.');
  await Model.bulkWrite(ids.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { order } } })));
  res.json({ ok: true });
};
