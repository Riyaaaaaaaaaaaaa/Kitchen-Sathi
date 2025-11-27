import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get user profile
router.get('/', requireAuth, async (req: any, res) => {
  try {
    console.log(`[profile-api] 📋 GET /profile - User: ${req.user.id}`);
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profile = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : '',
      gender: user.gender || '',
      weight: user.weight?.toString() || '',
      height: user.height?.toString() || '',
      role: user.role,
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
      preferences: user.preferences || {
        notifications: {
          email: true,
          inApp: true,
          expiryAlerts: true
        },
        theme: 'auto',
        language: 'en',
        profileVisibility: true,
        shareActivity: true,
        allowSharing: true
      }
    };

    res.json(profile);
  } catch (error) {
    console.error('[profile-api] ❌ Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.patch('/', requireAuth, async (req: any, res) => {
  try {
    console.log(`[profile-api] ✏️ PATCH /profile - User: ${req.user.id}`);
    const { name, avatar, dateOfBirth, gender, weight, height, preferences } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : undefined;
    if (gender !== undefined) user.gender = gender;
    if (weight !== undefined) user.weight = weight ? parseFloat(weight) : undefined;
    if (height !== undefined) user.height = height ? parseFloat(height) : undefined;
    if (preferences !== undefined) user.preferences = preferences;

    await user.save();

    const updatedProfile = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : '',
      gender: user.gender || '',
      weight: user.weight?.toString() || '',
      height: user.height?.toString() || '',
      role: user.role,
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
      preferences: user.preferences || {
        notifications: {
          email: true,
          inApp: true,
          expiryAlerts: true
        },
        theme: 'auto',
        language: 'en',
        profileVisibility: true,
        shareActivity: true,
        allowSharing: true
      }
    };

    res.json(updatedProfile);
  } catch (error) {
    console.error('[profile-api] ❌ Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload avatar
router.post('/avatar', requireAuth, upload.single('avatar'), async (req: any, res) => {
  try {
    console.log(`[profile-api] 📸 POST /profile/avatar - User: ${req.user.id}`);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'kitchensathi/avatars',
          public_id: `avatar_${req.user.id}_${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const avatarUrl = result.secure_url;

    // Update user's avatar in database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.avatar = avatarUrl;
    await user.save();

    console.log(`[profile-api] ✅ Avatar uploaded: ${avatarUrl}`);
    res.json({ url: avatarUrl });
  } catch (err) {
    console.error('[profile-api] ❌ Error uploading avatar:', err);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Update notification preferences
router.patch('/notifications', requireAuth, async (req: any, res) => {
  try {
    console.log(`[profile-api] 🔔 PATCH /profile/notifications - User: ${req.user.id}`);
    const { preferences } = req.body;

    // TODO: Update notification preferences in database
    const updatedProfile = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      avatar: null,
      role: req.user.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferences: preferences
    };

    res.json(updatedProfile);
  } catch (error) {
    console.error('[profile-api] ❌ Error updating notifications:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// Delete account
router.delete('/', requireAuth, async (req: any, res) => {
  try {
    console.log(`[profile-api] 🗑️ DELETE /profile - User: ${req.user.id}`);
    
    // TODO: Delete user account and all associated data
    // This should be implemented with proper data cleanup
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('[profile-api] ❌ Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
