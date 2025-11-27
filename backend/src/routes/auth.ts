import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { signAuthToken } from '../utils/jwt.js';
import { emailService } from '../services/emailService.js';
import { generateVerificationCode, getVerificationExpiry, isCodeExpired } from '../utils/verificationCode.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { GroceryItem } from '../models/GroceryItem.js';
import { MealPlan } from '../models/MealPlan.js';
import { UserRecipe } from '../models/UserRecipe.js';
import { SharedRecipe } from '../models/SharedRecipe.js';
import { SavedRecipe } from '../models/SavedRecipe.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
});

router.post('/register', async (req, res) => {
  try {
    console.log('[routes] 🔐 Auth route hit: POST /register');
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    
    const { email, name, password } = parsed.data;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationExpiry = getVerificationExpiry();
    
    // Create user (not verified yet)
    const user = await User.create({
      email,
      name,
      passwordHash,
      role: 'user',
      isEmailVerified: false,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: verificationExpiry,
    });
    
    // Send verification email
    const emailSent = await emailService.sendVerificationEmail(email, verificationCode, name);
    
    if (!emailSent) {
      console.warn('[auth] ⚠️ Failed to send verification email, but user was created');
    }
    
    console.log(`[auth] ✅ User registered: ${email} (verification email sent: ${emailSent})`);
    
    // Return user info (but don't generate token yet - they need to verify email first)
    return res.status(201).json({
      message: 'Registration successful! Please check your email for the verification code.',
      user: { id: user.id, email: user.email, name: user.name, isEmailVerified: false },
      requiresVerification: true,
    });
  } catch (error: any) {
    console.error('[auth] ❌ Registration error:', error);
    console.error('[auth] ❌ Error stack:', error.stack);
    console.error('[auth] ❌ Error message:', error.message);
    return res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post('/login', async (req, res) => {
  try {
    console.log('[routes] 🔐 Auth route hit: POST /login');
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    
    const { email, password } = parsed.data;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    
    // Check if email is verified
    if (!user.isEmailVerified) {
      console.log(`[auth] ⚠️ Login attempt for unverified email: ${email}`);
      return res.status(403).json({
        error: 'Email not verified',
        message: 'Please verify your email before logging in.',
        requiresVerification: true,
        userId: user.id,
      });
    }
    
    const token = signAuthToken({ sub: user.id, role: user.role });
    console.log(`[auth] ✅ User logged in: ${email}`);
    
    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, isEmailVerified: user.isEmailVerified },
    });
  } catch (error: any) {
    console.error('[auth] ❌ Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Verify email with code
const verifyEmailSchema = z.object({
  userId: z.string(),
  code: z.string().length(6),
});

router.post('/verify-email', async (req, res) => {
  try {
    console.log('[routes] 🔐 Auth route hit: POST /verify-email');
    const parsed = verifyEmailSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid request data' });
    
    const { userId, code } = parsed.data;
    
    // Find user with verification code (need to explicitly select it)
    const user = await User.findById(userId).select('+emailVerificationCode +emailVerificationExpires');
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }
    
    // Check if code exists
    if (!user.emailVerificationCode) {
      return res.status(400).json({ error: 'No verification code found. Please request a new one.' });
    }
    
    // Check if code matches
    if (user.emailVerificationCode !== code) {
      console.log(`[auth] ❌ Invalid verification code for user: ${userId}`);
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    
    // Check if code expired
    if (isCodeExpired(user.emailVerificationExpires)) {
      console.log(`[auth] ❌ Expired verification code for user: ${userId}`);
      return res.status(400).json({ error: 'Verification code expired. Please request a new one.' });
    }
    
    // Mark email as verified and clear verification code
    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    // Generate auth token
    const token = signAuthToken({ sub: user.id, role: user.role });
    
    console.log(`[auth] ✅ Email verified for user: ${user.email}`);
    
    return res.json({
      message: 'Email verified successfully!',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, isEmailVerified: true },
    });
  } catch (error: any) {
    console.error('[auth] ❌ Email verification error:', error);
    return res.status(500).json({ error: 'Email verification failed' });
  }
});

// Resend verification code
const resendCodeSchema = z.object({
  userId: z.string(),
});

router.post('/resend-verification', async (req, res) => {
  try {
    console.log('[routes] 🔐 Auth route hit: POST /resend-verification');
    const parsed = resendCodeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid request data' });
    
    const { userId } = parsed.data;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }
    
    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationExpiry = getVerificationExpiry();
    
    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = verificationExpiry;
    await user.save();
    
    // Send new verification email
    const emailSent = await emailService.sendVerificationEmail(user.email, verificationCode, user.name);
    
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send verification email' });
    }
    
    console.log(`[auth] ✅ Verification code resent to: ${user.email}`);
    
    return res.json({ message: 'Verification code sent! Please check your email.' });
  } catch (error: any) {
    console.error('[auth] ❌ Resend verification error:', error);
    return res.status(500).json({ error: 'Failed to resend verification code' });
  }
});

// Request password reset
const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

router.post('/forgot-password', async (req, res) => {
  try {
    console.log('[routes] 🔐 Auth route hit: POST /forgot-password');
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid email address' });
    
    const { email } = parsed.data;
    const user = await User.findOne({ email });
    
    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      console.log(`[auth] ⚠️ Password reset requested for non-existent email: ${email}`);
      return res.json({ message: 'If an account exists with this email, a password reset code has been sent.' });
    }
    
    // Generate reset code
    const resetCode = generateVerificationCode();
    const resetExpiry = getVerificationExpiry();
    
    user.passwordResetCode = resetCode;
    user.passwordResetExpires = resetExpiry;
    await user.save();
    
    // Send reset email
    const emailSent = await emailService.sendPasswordResetEmail(email, resetCode, user.name);
    
    if (!emailSent) {
      console.error('[auth] ❌ Failed to send password reset email');
    }
    
    console.log(`[auth] ✅ Password reset code sent to: ${email}`);
    
    return res.json({ message: 'If an account exists with this email, a password reset code has been sent.' });
  } catch (error: any) {
    console.error('[auth] ❌ Forgot password error:', error);
    return res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Reset password with code
const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8),
});

router.post('/reset-password', async (req, res) => {
  try {
    console.log('[routes] 🔐 Auth route hit: POST /reset-password');
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid request data' });
    
    const { email, code, newPassword } = parsed.data;
    
    // Find user with reset code (need to explicitly select it)
    const user = await User.findOne({ email }).select('+passwordResetCode +passwordResetExpires');
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Check if reset code exists
    if (!user.passwordResetCode) {
      return res.status(400).json({ error: 'No password reset code found. Please request a new one.' });
    }
    
    // Check if code matches
    if (user.passwordResetCode !== code) {
      console.log(`[auth] ❌ Invalid reset code for user: ${email}`);
      return res.status(400).json({ error: 'Invalid reset code' });
    }
    
    // Check if code expired
    if (isCodeExpired(user.passwordResetExpires)) {
      console.log(`[auth] ❌ Expired reset code for user: ${email}`);
      return res.status(400).json({ error: 'Reset code expired. Please request a new one.' });
    }
    
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    // Update password and clear reset code
    user.passwordHash = passwordHash;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    console.log(`[auth] ✅ Password reset successful for user: ${email}`);
    
    return res.json({ message: 'Password reset successful! You can now log in with your new password.' });
  } catch (error: any) {
    console.error('[auth] ❌ Reset password error:', error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
});

// POST /api/auth/change-password - Change user password (requires authentication)
router.post('/change-password', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    console.log(`[auth] 🔐 POST /change-password - User: ${userId}`);
    
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      console.log(`[auth] ❌ Invalid current password for user: ${userId}`);
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    // Update password
    user.passwordHash = newPasswordHash;
    await user.save();
    
    console.log(`[auth] ✅ Password changed successfully for user: ${user.email}`);
    
    return res.json({ message: 'Password changed successfully!' });
  } catch (error: any) {
    console.error('[auth] ❌ Change password error:', error);
    return res.status(500).json({ error: 'Failed to change password' });
  }
});

// DELETE /api/auth/delete-account - Delete user account (requires authentication)
router.delete('/delete-account', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    console.log(`[auth] 🗑️ DELETE /delete-account - User: ${userId}`);
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete user's data using imported models
    await Promise.all([
      GroceryItem.deleteMany({ userId }),
      MealPlan.deleteMany({ userId }),
      UserRecipe.deleteMany({ userId }),
      SharedRecipe.deleteMany({ $or: [{ ownerId: userId }, { sharedWithUserId: userId }] }),
      SavedRecipe.deleteMany({ userId }),
    ]);
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    console.log(`[auth] ✅ Account deleted successfully: ${user.email}`);
    
    return res.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    console.error('[auth] ❌ Delete account error:', error);
    console.error('[auth] ❌ Error stack:', error.stack);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;

