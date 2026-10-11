import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Config } from '../models/Config.js';
import { signToken } from '../utils/token.js';
import { sendMail } from '../utils/mailer.js';
import { norm, HttpError } from '../utils/text.js';
import { isUnlocked } from '../utils/unlock.js';

// owner created 

export async function ensureOwner() {
  let cfg = await Config.findOne({ key: 'owner' });

  if (!cfg) {
    cfg = await Config.create({ key: 'owner' });
  }

  if (!cfg.codeHash) {
    const { LOVE_CODE } = process.env;

    if (!LOVE_CODE) {
      throw new Error('First run: set LOVE_CODE');
    }

    cfg.codeHash = await bcrypt.hash(norm(LOVE_CODE), 12);
  }

  if (!cfg.previewHash) {
    const { PREVIEW_CODE } = process.env;

    if (!PREVIEW_CODE) {
      throw new Error('First run: set PREVIEW_CODE');
    }

    cfg.previewHash = await bcrypt.hash(norm(PREVIEW_CODE), 12);
  }

  await cfg.save();

  console.log('Owner configuration ready');
}

//reference  ===================================================// 
//  res.cookie('accessToken', accessToken, {
//     httpOnly: true,
//     secure: true,      // only over HTTPS
//     sameSite: 'strict', // blocks CSRF
//     maxAge: 15 * 60 * 1000, // 15 minutes

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/',
  maxAge: 1 * 60 * 60 * 1000, // 1 hours
};

export async function verifyCode(req, res) {
  if (!isUnlocked()) throw new HttpError(403, 'Not yet, our moment has not arrived. Watch the timer.');
  const code = norm(req.body?.code ?? '');

  if (!code) {
    throw new HttpError(400, 'Login code is required.');
  }

  const cfg = await Config.findOne({ key: 'owner' });

  if (!cfg || (!cfg.codeHash && !cfg.previewHash)) {
    throw new HttpError(500, 'Owner login is not configured.');
  }

  // Compare only when the corresponding hash exists
  const valid_C = cfg.codeHash
    ? await bcrypt.compare(code, cfg.codeHash)
    : false;

  const valid_P = cfg.previewHash
    ? await bcrypt.compare(code, cfg.previewHash)
    : false;

  if (valid_C) {
    const token = signToken({ userId: 'owner' });

    res.cookie('auth', token, COOKIE_OPTIONS);

    return res.status(200).json({
      authenticated: true,
      user: { id: 'owner' },
    });
  }

  if (valid_P) {
     const token = signToken({ userId: 'preview' });

    res.cookie('auth', token, COOKIE_OPTIONS);
    return res.status(200).json({
      authenticated: true,
      user: { id: 'preview' },
    });
  }

  // Reject invalid codes instead of authenticating a guest
  throw new HttpError(401, 'Invalid login code.');
}
// POST /api/auth/logout -
export async function logout(req, res) {
  try {
    res.clearCookie("auth", {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });

    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// POST /api/auth/forgot  { email }  -> same reply for everyone; mail goes only to the registered owner
export async function forgot(req, res) {
  res.json({ message: 'If this email is registered, a code is on its way.' });
  console.log(req.body.email)
  try {
    const cfg = await Config.findOne({ key: 'owner' });
    if (cfg && req.body.email) await Config.updateOne(
      { key: "owner" },        // 1. Filter (Find this document)
      { $set: { ownerEmail: req.body.email } }     // 2. Update (Change or add this field)
    )

    // await cfg.save();

    // if (!cfg || norm(req.body?.email) !== cfg.ownerEmail) return;
    const otp = String(crypto.randomInt(100000, 1000000));
    // console.log(otp)
    cfg.otpHash = await bcrypt.hash(otp, 12);
    cfg.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await cfg.save();
    await sendMail({ to: req.body.email, subject: 'Your one-time JustLove code', text: `Your one-time code is ${otp}. It works for 10 minutes.` });
  } catch (e) { console.error('forgot:', e.message); }
}

// POST /api/auth/forgot/verify  { email, otp }  -> { token }
export async function verifyOtp(req, res) {
  console.log(req.body.otp + "in")
  console.log(req.body.email + " out")
  const cfg = await Config.findOne();
  const ok = cfg && norm(req.body?.email) === cfg.ownerEmail && cfg.otpHash && cfg.otpExpires > new Date()
    && (await bcrypt.compare(String(req.body?.otp ?? '').trim(), cfg.otpHash));

  if (!ok) throw new HttpError(401, 'That code is not valid or has expired.');
  cfg.otpHash = undefined; cfg.otpExpires = undefined; await cfg.save();
  // res.json({ token: signToken() });
  const token = signToken({ userId: 'guest' });

  res.cookie('auth', token, COOKIE_OPTIONS);
  return res.status(200).json({
    authenticated: true,
    user: { id: 'guest' },
  });
}

// GET /api/auth/check  (needs token) -> { ok: true }
export const getMe = (req, res) => {
  return res.json({
    authenticated: true,
    user: {
      id: req.user.userId,
    },
  });
};
// // PUT /api/auth/code  { currentCode, newCode }  (needs token)
// export async function changeCode(req, res) {
//   const { currentCode, newCode } = req.body ?? {};
//   const next = norm(newCode);
//   if (next.length < 4) throw new HttpError(400, 'The new love code must be at least 4 characters.');
//   const cfg = await Config.findOne();
//   if (!cfg || !(await bcrypt.compare(norm(currentCode), cfg.codeHash))) throw new HttpError(401, 'Your current love code is not correct.');
//   cfg.codeHash = await bcrypt.hash(next, 10);
//   await cfg.save();
//   res.json({ message: 'Love code updated.' });
// }
