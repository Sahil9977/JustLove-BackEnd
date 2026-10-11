import { verifyToken } from '../utils/token.js';


export function requireAuth(req, res, next) {
  const token = req.cookies?.auth;
  // console.log('RA')

  if (!token) {
    console.log('No Token in cookie ');
    return res.status(401).json({
      authenticated: false,
      error: 'Authentication required.',
    });
  }

  try {
    const payload = verifyToken(token);

    req.user = payload;
    // console.log("ALL SET")

    return next();
  } catch (error) {
    // Token is expired, malformed, or has an invalid signature.
    // console.log("EXPIRED")

    res.clearCookie("auth", {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });

    return res.status(401).json({
      authenticated: false,
      error: 'Authentication expired.',
    });
  }
}