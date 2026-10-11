import mongoose from 'mongoose';

export const norm = (s) => String(s ?? '').trim().toLowerCase();
export const clean = (s, max) => String(s ?? '').trim().slice(0, max);
export const isId = (id) => mongoose.isValidObjectId(id);

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
