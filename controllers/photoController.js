import { Photo } from '../models/Photo.js';
import { nextOrder, findOr404 } from './crud.js';
import { clean, HttpError } from '../utils/text.js';

const isHttp = (u) => /^https?:\/\/\S+$/i.test(u);

// GET /api/photos -> list (without image bytes)
export const listPhotos = async (_req, res) => res.json(await Photo.find().sort('order createdAt'));

// POST /api/photos  multipart: image (file) OR url, plus caption
export async function createPhoto(req, res) {
  const url = clean(req.body?.url, 1000);
  if (!req.file && !url) throw new HttpError(400, 'Add an image file or an image link.');
  if (url && !isHttp(url)) throw new HttpError(400, 'The image link must start with http:// or https://');
  const photo = await Photo.create({
    url: req.file ? '' : url, caption: clean(req.body?.caption, 200), order: await nextOrder(Photo),
    ...(req.file && { hasImage: true, contentType: req.file.mimetype, data: req.file.buffer }),
  });
  res.status(201).json(await Photo.findById(photo._id));
}

// PATCH /api/photos/:id  caption / url / order / new image
export async function updatePhoto(req, res) {
  const photo = await findOr404(Photo, req.params.id);
  const b = req.body ?? {};
  if (b.caption !== undefined) photo.caption = clean(b.caption, 200);
  if (b.order !== undefined && Number.isFinite(Number(b.order))) photo.order = Number(b.order);
  if (b.url !== undefined) {
    const url = clean(b.url, 1000);
    if (url && !isHttp(url)) throw new HttpError(400, 'The image link must start with http:// or https://');
    photo.url = url;
    if (url) { photo.hasImage = false; photo.contentType = undefined; photo.data = undefined; }
  }
  if (req.file) { photo.url = ''; photo.hasImage = true; photo.contentType = req.file.mimetype; photo.data = req.file.buffer; }
  await photo.save();
  res.json(await Photo.findById(photo._id));
}

// DELETE /api/photos/:id
export async function deletePhoto(req, res) {
  const photo = await findOr404(Photo, req.params.id, '_id');
  await photo.deleteOne();
  res.json({ ok: true });
}

// GET /api/photos/:id/image -> the uploaded image bytes
export async function photoImage(req, res) {
  const photo = await findOr404(Photo, req.params.id, '+data contentType hasImage');
  if (!photo.hasImage || !photo.data) throw new HttpError(404, 'No uploaded image');
  res.set({ 'Content-Type': photo.contentType, 'Cache-Control': 'private, max-age=86400', 'Cross-Origin-Resource-Policy': 'cross-origin' });
  res.send(photo.data);
}
