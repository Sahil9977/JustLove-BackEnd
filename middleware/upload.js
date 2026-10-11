import multer from 'multer';
import { HttpError } from '../utils/text.js';

const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_MB = 4;

// Keeps the image in memory so it can be saved into MongoDB. Field name: "image".
export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MB * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => (TYPES.includes(file.mimetype) ? cb(null, true) : cb(new HttpError(400, 'Only JPG, PNG, WebP or GIF images are allowed.'))),
}).single('image');
