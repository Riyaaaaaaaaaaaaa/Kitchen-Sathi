import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, uploadAvatar, UserProfile, UpdateProfileData } from '../lib/profileApi';
import { changePassword } from '../lib/api';

interface ProfileModalProps {
  onClose: () => void;
  user: any;
}

export function ProfileModal({ onClose, user }: ProfileModalProps) {
  const navigate = useNavigate();
  const { refreshMe, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'account'>('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '',
    dateOfBirth: '',
    gender: '',
    weight: '',
    height: '',
    preferences: {
      notifications: {
        email: true,
        inApp: true,
        expiryAlerts: true
      },
      theme: 'auto' as 'light' | 'dark' | 'auto',
      language: 'en',
      profileVisibility: true,
      shareActivity: true,
      allowSharing: true
    }
  });
  
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Calculate age from date of birth
  const calculateAge = (dob: string): number | null => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Load user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const userProfile = await getUserProfile();
        setProfile(userProfile);
        setFormData({
          name: userProfile.name,
          email: userProfile.email,
          avatar: userProfile.avatar || '',
          dateOfBirth: userProfile.dateOfBirth ? userProfile.dateOfBirth.split('T')[0] : '',
          gender: userProfile.gender || '',
          weight: userProfile.weight || '',
          height: userProfile.height || '',
          preferences: userProfile.preferences || {
            notifications: { email: true, inApp: true, expiryAlerts: true },
            theme: 'auto',
            language: 'en',
            profileVisibility: true,
            shareActivity: true,
            allowSharing: true
          }
        });
      } catch (err: any) {
        console.error('Failed to load profile:', err);
        // If user not found, they might have been deleted - log them out
        if (err.message?.includes('User not found') || err.message?.includes('404')) {
          console.log('User not found - logging out');
          logout();
          onClose();
          navigate('/');
        } else {
          setError('Failed to load profile data');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [logout, onClose, navigate]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const parts = field.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current: any = newData;
        
        // Navigate to the parent object
        for (let i = 0; i < parts.length - 1; i++) {
          const key = parts[i];
          if (!current[key]) {
            current[key] = {};
          } else {
            current[key] = { ...current[key] };
          }
          current = current[key];
        }
        
        // Set the final value
        current[parts[parts.length - 1]] = value;
        
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const updateData: UpdateProfileData = {
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        weight: formData.weight,
        height: formData.height,
        preferences: formData.preferences
      };

      await updateUserProfile(updateData);
      await refreshMe(); // Refresh auth context
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const { url } = await uploadAvatar(file);
      setFormData(prev => ({ ...prev, avatar: url }));
      setShowAvatarPicker(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to upload avatar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Use the correct token key - 'auth_token' not 'token'
      const token = localStorage.getItem('auth_token');
      console.log('🗑️ [Frontend] Attempting to delete account');
      console.log('🔑 [Frontend] Token present:', token ? 'Yes' : 'No');
      console.log('🔑 [Frontend] Token (first 20 chars):', token ? token.substring(0, 20) + '...' : 'N/A');
      
      const response = await fetch('http://localhost:5000/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('🗑️ [Frontend] Delete response status:', response.status);

      if (!response.ok) {
        // If unauthorized, the token is invalid - log out
        if (response.status === 401) {
          console.log('❌ [Frontend] Invalid token - logging out');
          const errorData = await response.json().catch(() => ({ error: 'Unauthorized' }));
          console.log('❌ [Frontend] Error details:', errorData);
          logout();
          onClose();
          navigate('/');
          return;
        }
        const data = await response.json();
        console.log('❌ [Frontend] Delete failed:', data);
        throw new Error(data.error || 'Failed to delete account');
      }

      console.log('✅ [Frontend] Account deleted successfully');
      // Clear any existing errors before showing success
      setError(null);
      // Show success modal instead of immediately redirecting
      setShowDeleteConfirm(false);
      setShowDeleteSuccess(true);
    } catch (err) {
      console.error('❌ [Frontend] Delete account error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setShowDeleteConfirm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setPasswordError(null);
      setPasswordSuccess(false);
      
      // Validate passwords
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setPasswordError('All fields are required');
        return;
      }
      
      if (passwordData.newPassword.length < 8) {
        setPasswordError('New password must be at least 8 characters long');
        return;
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('New passwords do not match');
        return;
      }
      
      if (passwordData.currentPassword === passwordData.newPassword) {
        setPasswordError('New password must be different from current password');
        return;
      }
      
      setSaving(true);
      
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      // Success!
      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowChangePassword(false);
      }, 3000);
      
    } catch (err: any) {
      console.error('Failed to change password:', err);
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSuccessClose = () => {
    // Logout and redirect to home
    logout();
    setShowDeleteSuccess(false);
    onClose();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            <span className="ml-3 text-gray-600">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Manage Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'profile', label: 'Profile', icon: '👤' },
            { id: 'preferences', label: 'Preferences', icon: '⚙️' },
            { id: 'account', label: 'Account', icon: '🔒' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <>
                {/* Avatar Section */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    {formData.avatar && formData.avatar.startsWith('http') ? (
                      <img 
                        src={formData.avatar} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover shadow-lg"
                      />
                    ) : formData.avatar ? (
                      <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg text-4xl">
                        {formData.avatar}
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowAvatarPicker(true)}
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center hover:bg-orange-700 transition-colors shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Click to choose avatar</p>
                </div>

                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Email Field (Read-only) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                    placeholder="Email from registration"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>

                {/* Date of Birth & Gender in one row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    {formData.dateOfBirth && calculateAge(formData.dateOfBirth) !== null && (
                      <p className="mt-1 text-xs text-gray-600">
                        Age: {calculateAge(formData.dateOfBirth)} years
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Weight, Height in one row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      id="weight"
                      type="number"
                      min="1"
                      max="500"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="70"
                    />
                  </div>
                  <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                      Height (cm)
                    </label>
                    <input
                      id="height"
                      type="number"
                      min="1"
                      max="300"
                      step="0.1"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="170"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferences.notifications.email}
                        onChange={(e) => handleInputChange('preferences.notifications.email', e.target.checked)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Email notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferences.notifications.inApp}
                        onChange={(e) => handleInputChange('preferences.notifications.inApp', e.target.checked)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">In-app notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferences.notifications.expiryAlerts}
                        onChange={(e) => handleInputChange('preferences.notifications.expiryAlerts', e.target.checked)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Expiry alerts</span>
                    </label>
                  </div>
                </div>

              </>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <>
                {/* Change Password Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">🔐 Change Password</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Update your password to keep your account secure
                      </p>
                    </div>
                    {!showChangePassword && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowChangePassword(true);
                          setPasswordError(null);
                          setPasswordSuccess(false);
                        }}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                      >
                        Change Password
                      </button>
                    )}
                  </div>

                  {showChangePassword && (
                    <div className="space-y-4 mt-6 pt-6 border-t border-gray-200">
                      {/* Current Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showCurrentPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Enter new password (min 8 characters)"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showNewPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Confirm New Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Re-enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showConfirmPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Error Message */}
                      {passwordError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-red-700">{passwordError}</p>
                        </div>
                      )}

                      {/* Success Message */}
                      {passwordSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-green-700">Password changed successfully!</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowChangePassword(false);
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            setPasswordError(null);
                            setPasswordSuccess(false);
                          }}
                          disabled={saving}
                          className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleChangePassword}
                          disabled={saving}
                          className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {saving ? (
                            <>
                              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Updating...
                            </>
                          ) : (
                            'Update Password'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Danger Zone</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={saving}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    Delete Account
                  </button>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setShowDeleteConfirm(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Account?</h3>
                        <p className="text-gray-600 mb-4">
                          This will permanently delete your account and all associated data:
                        </p>
                        <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
                          <li className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span>All your recipes and meal plans</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span>Your grocery lists and items</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span>Shared recipes and connections</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span>All analytics and history</span>
                          </li>
                        </ul>
                        <p className="text-sm font-semibold text-red-600">
                          This action cannot be undone!
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={saving}
                          className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={saving}
                          className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {saving ? (
                            <>
                              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Deleting...
                            </>
                          ) : (
                            'Yes, Delete My Account'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delete Success Modal */}
                {showDeleteSuccess && (
                  <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
                      <div className="text-center">
                        {/* Success Icon */}
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">
                          Account Deleted Successfully
                        </h2>

                        {/* Message */}
                        <p className="text-gray-600 mb-6">
                          Your account and all associated data have been permanently deleted. We're sorry to see you go!
                        </p>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
                          <p className="text-sm text-blue-800 mb-2">
                            <strong>What was deleted:</strong>
                          </p>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li className="flex items-start gap-2">
                              <span className="text-blue-600">✓</span>
                              <span>Your account and profile</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-600">✓</span>
                              <span>All recipes and meal plans</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-600">✓</span>
                              <span>Grocery lists and items</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-600">✓</span>
                              <span>Shared recipes and connections</span>
                            </li>
                          </ul>
                        </div>

                        {/* Feedback Message */}
                        <p className="text-sm text-gray-500 mb-6">
                          Thank you for using KitchenSathi. If you'd like to join us again in the future, you're always welcome! 🍳
                        </p>

                        {/* Go to Landing Page Button */}
                        <button
                          onClick={handleDeleteSuccessClose}
                          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          Go to Home Page
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-600">Profile updated successfully!</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-3 bg-orange-600 text-white hover:bg-orange-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Avatar Picker Modal */}
        {showAvatarPicker && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Choose Your Avatar</h3>
                <button
                  onClick={() => setShowAvatarPicker(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Initials Option */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">📝 Use Initials</h4>
                <button
                  type="button"
                  onClick={() => {
                    handleInputChange('avatar', '');
                    setShowAvatarPicker(false);
                  }}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">Use Name Initials</p>
                    <p className="text-sm text-gray-600">Your initials will be displayed</p>
                  </div>
                </button>
              </div>

              {/* Chef & Cooking Avatars */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">👨‍🍳 Chef Avatars</h4>
                <div className="grid grid-cols-6 gap-3">
                  {['🧑‍🍳', '👨‍🍳', '👩‍🍳', '👨‍🍳', '👩‍🍳', '🧑‍🍳'].map((emoji, idx) => (
                    <button
                      key={`chef-${idx}`}
                      type="button"
                      onClick={() => {
                        handleInputChange('avatar', emoji);
                        setShowAvatarPicker(false);
                      }}
                      className={`w-full aspect-square rounded-xl border-2 flex items-center justify-center text-3xl hover:border-orange-500 hover:bg-orange-50 transition-all ${
                        formData.avatar === emoji ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Food & Kitchen Avatars */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">🍳 Food & Kitchen</h4>
                <div className="grid grid-cols-6 gap-3">
                  {['🍳', '🥘', '🍲', '🥗', '🍱', '🍜', '🍕', '🍔', '🌮', '🌯', '🥙', '🧆', '🥪', '🍝', '🍛', '🍚', '🥟', '🍤'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        handleInputChange('avatar', emoji);
                        setShowAvatarPicker(false);
                      }}
                      className={`w-full aspect-square rounded-xl border-2 flex items-center justify-center text-3xl hover:border-orange-500 hover:bg-orange-50 transition-all ${
                        formData.avatar === emoji ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desserts & Beverages */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">🧁 Desserts & Drinks</h4>
                <div className="grid grid-cols-6 gap-3">
                  {['🧁', '🍰', '🎂', '🍪', '🍩', '🥧', '☕', '🍵', '🧃', '🥤', '🧋', '🍹'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        handleInputChange('avatar', emoji);
                        setShowAvatarPicker(false);
                      }}
                      className={`w-full aspect-square rounded-xl border-2 flex items-center justify-center text-3xl hover:border-orange-500 hover:bg-orange-50 transition-all ${
                        formData.avatar === emoji ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fruits & Vegetables */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">🥬 Fresh Produce</h4>
                <div className="grid grid-cols-6 gap-3">
                  {['🍅', '🥕', '🥬', '🥦', '🌽', '🥒', '🍎', '🍊', '🍋', '🍌', '🍓', '🥑'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        handleInputChange('avatar', emoji);
                        setShowAvatarPicker(false);
                      }}
                      className={`w-full aspect-square rounded-xl border-2 flex items-center justify-center text-3xl hover:border-orange-500 hover:bg-orange-50 transition-all ${
                        formData.avatar === emoji ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Image Upload */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">📸 Upload Custom Image</h4>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                  className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">{saving ? 'Uploading...' : 'Upload Your Photo'}</p>
                    <p className="text-sm text-gray-600">JPG, PNG or GIF (max 5MB)</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileModal;
