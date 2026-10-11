import 'dotenv/config';
import { createApp } from './app.js';
import connectDB  from './config/db.js';
import { ensureOwner } from './controllers/authController.js';

for (const k of ['MONGO_URI', 'JWT_SECRET']) {
  if (!process.env[k]) { console.error(`Missing ${k} in server/.env`); process.exit(1); }
}
if (process.env.JWT_SECRET.length < 16) { console.error('JWT_SECRET is too short. Use a long random string.'); process.exit(1); }

try {
  await connectDB();

} catch (e) {
  console.error('Could not connect to MongoDB Atlas:', e.message);
  console.error('Check: 1) MONGO_URI user/password  2) Atlas > Network Access allows your IP  3) the password is URL-encoded');
  process.exit(1);
}

try {
  await ensureOwner();
} catch (e) {
  console.error('Could not configure owner', e.message);
}
const port = process.env.PORT || 5000;
createApp().listen(port, () => console.log(`JustLove server running on http://localhost:${port}`));
