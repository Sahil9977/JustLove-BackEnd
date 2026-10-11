import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimit.js';
import { requireAuth } from '../middleware/auth.js';
import { verifyCode, forgot, verifyOtp, getMe , logout} from '../controllers/authController.js';

const r = Router();
r.post('/verify', authLimiter, verifyCode);
r.post('/forgot', authLimiter, forgot);
r.post('/forgot/verify', authLimiter, verifyOtp);
r.get('/me', requireAuth, getMe);
// r.put('/code', authLimiter, requireAuth, changeCode);
r.post('/logout', logout)
export default r;
