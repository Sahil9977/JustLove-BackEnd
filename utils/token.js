import jwt from 'jsonwebtoken';

export const signToken = (userId) => jwt.sign(userId, process.env.JWT_SECRET, { expiresIn: '3h' });
export const verifyToken = (t) => jwt.verify(t, process.env.JWT_SECRET);
