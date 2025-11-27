import { request } from './api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  weight?: string;
  height?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
  preferences?: {
    notifications: {
      email: boolean;
      inApp: boolean;
      expiryAlerts: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    language: string;
    profileVisibility: boolean;
    shareActivity: boolean;
    allowSharing: boolean;
  };
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  weight?: string;
  height?: string;
  preferences?: UserProfile['preferences'];
}

// Fetch user profile
export async function getUserProfile(): Promise<UserProfile> {
  return request<UserProfile>('/api/profile');
}

// Update user profile
export async function updateUserProfile(data: UpdateProfileData): Promise<UserProfile> {
  return request<UserProfile>('/api/profile', {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

// Upload avatar image
export async function uploadAvatar(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('avatar', file);
  
  return request<{ url: string }>('/api/profile/avatar', {
    method: 'POST',
    body: formData
    // Content-Type will be automatically set by browser for FormData
  });
}

// Delete user account
export async function deleteAccount(): Promise<void> {
  return request('/api/profile', {
    method: 'DELETE'
  });
}

// Update notification preferences
export async function updateNotificationPreferences(preferences: UserProfile['preferences']): Promise<UserProfile> {
  return request<UserProfile>('/api/profile/notifications', {
    method: 'PATCH',
    body: JSON.stringify({ preferences })
  });
}
