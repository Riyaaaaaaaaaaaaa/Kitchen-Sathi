import crypto from 'crypto';

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  // Generate a random 6-digit number
  const code = crypto.randomInt(100000, 999999).toString();
  return code;
}

/**
 * Generate an expiration date (10 minutes from now)
 */
export function getVerificationExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10);
  return expiry;
}

/**
 * Check if a verification code has expired
 */
export function isCodeExpired(expiryDate: Date | undefined): boolean {
  if (!expiryDate) return true;
  return new Date() > expiryDate;
}

