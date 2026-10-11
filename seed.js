import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Config } from './models/Config.js';
import { Photo } from './models/Photo.js';
import { Moment } from './models/Moment.js';
import { Content } from './models/Content.js';
import { DEFAULT_CONTENT, DEFAULT_MOMENTS } from './utils/defaults.js';
import { norm } from './utils/text.js';

if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing in server/.env');
if (norm(process.env.LOVE_CODE).length < 4 || !process.env.OWNER_EMAIL) throw new Error('Set LOVE_CODE (4+ chars) and OWNER_EMAIL in server/.env first');

await mongoose.connect(process.env.MONGO_URI);
await Config.deleteMany({});
await Config.create({ codeHash: await bcrypt.hash(norm(process.env.LOVE_CODE), 10), ownerEmail: norm(process.env.OWNER_EMAIL) });
if (!(await Content.countDocuments())) await Content.create(DEFAULT_CONTENT);
if (!(await Moment.countDocuments())) await Moment.insertMany(DEFAULT_MOMENTS.map((m, order) => ({ ...m, order })));
if (!(await Photo.countDocuments())) {
  // Placeholders - open /admin after unlocking to upload real photos.
  await Photo.insertMany(Array.from({ length: 10 }, (_, i) => ({ url: '', caption: `[Caption ${i + 1}]`, order: i })));
}
console.log('Seeded. Now delete LOVE_CODE from server/.env');
await mongoose.disconnect();
