import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'dev_secret';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
  sub: string;
  role: 'user' | 'admin';
}

export function signAuthToken(payload: JwtPayload): string {
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
}

export function verifyAuthToken(token: string): JwtPayload {
  return jwt.verify(token, jwtSecret) as JwtPayload;
}

