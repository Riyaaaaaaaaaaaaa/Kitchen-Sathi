const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

export type AuthUser = { 
  id: string; 
  email: string; 
  name: string; 
  role: 'user' | 'admin';
  avatar?: string;
};

export type ApiError = {
  message: string;
  status?: number;
  details?: any;
};

export function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('auth_token', token);
  else localStorage.removeItem('auth_token');
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  
  // Don't set Content-Type if body is FormData (browser will set it with boundary)
  const isFormData = options.body instanceof FormData;
  
  const headers: HeadersInit = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  
  console.log(`🌐 [api] ${options.method || 'GET'} ${API_BASE}${path}`);
  console.log(`🔑 [api] Token present: ${!!token}`);
  console.log(`📦 [api] Body type: ${isFormData ? 'FormData' : 'JSON'}`);
  
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    
    console.log(`📊 [api] Response status: ${res.status} ${res.statusText}`);
    
    // Handle 204 No Content (successful DELETE, no body)
    if (res.status === 204) {
      console.log(`✅ [api] 204 No Content - Request successful`);
      return null as T;
    }
    
    const text = await res.text();
    console.log(`📄 [api] Response text (first 200 chars):`, text.substring(0, 200));
    
    // Check if response is HTML (error page)
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.error(`❌ [api] Received HTML instead of JSON for ${path}`);
      throw { 
        message: 'Server returned HTML instead of JSON. This usually means the backend route doesn\'t exist or there\'s a server error.', 
        status: res.status 
      } as ApiError;
    }
    
    const data = text ? JSON.parse(text) : null;
    
    if (!res.ok) {
      const error: ApiError = {
        message: data?.error || data?.message || res.statusText || 'Request failed',
        status: res.status,
        details: data
      };
      throw error;
    }
    return data as T;
  } catch (err) {
    if (err instanceof Error && err.name === 'TypeError') {
      // Network error
      throw { message: 'Network error - check if backend is running', status: 0 } as ApiError;
    }
    if (err instanceof SyntaxError) {
      // JSON parse error
      throw { message: `Invalid JSON response: ${err.message}`, status: 0 } as ApiError;
    }
    throw err;
  }
}

export async function registerUser(input: { email: string; name: string; password: string }): Promise<{ token: string; user: AuthUser }> {
  return request('/api/auth/register', { method: 'POST', body: JSON.stringify(input) });
}

export async function loginUser(input: { email: string; password: string }): Promise<{ token: string; user: AuthUser }> {
  return request('/api/auth/login', { method: 'POST', body: JSON.stringify(input) });
}

export async function fetchMe(): Promise<{ user: { id: string; role: 'user' | 'admin' } }> {
  return request('/api/me');
}

export async function changePassword(input: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
  return request('/api/auth/change-password', { method: 'POST', body: JSON.stringify(input) });
}

// Backend health check
export async function checkHealth(): Promise<{ status: string; service: string; time: string }> {
  return request('/api/health');
}

// Grocery list types and API
// Grocery Item Status Enum
export enum GroceryItemStatus {
  PENDING = 'pending',     // Not yet bought
  COMPLETED = 'completed', // Bought but not used
  USED = 'used'           // Bought and consumed/used
}

export type GroceryItem = {
  _id: string; // MongoDB uses _id, not id
  id?: string; // Optional for compatibility
  name: string;
  quantity: number;
  unit: string;
  price?: number; // Optional price per unit in ₹
  status: GroceryItemStatus;
  completed: boolean; // Deprecated - use status instead
  createdAt: string;
  updatedAt: string;
  expiryDate?: string;
  usedAt?: string; // Track when item was marked as used
  notificationPreferences: {
    enabled: boolean;
    daysBeforeExpiry: number[];
    emailNotifications: boolean;
    inAppNotifications: boolean;
  };
  lastNotificationSent?: string;
  notificationHistory: string[];
};

export type Notification = {
  _id: string;
  id?: string;
  userId: string;
  groceryItemId: string;
  type: 'expiry_reminder' | 'expiry_warning' | 'expiry_urgent';
  title: string;
  message: string;
  status: 'sent' | 'delivered' | 'failed' | 'read';
  sentAt: string;
  readAt?: string;
  deliveryMethod: 'email' | 'in_app' | 'both';
  metadata?: {
    daysUntilExpiry?: number;
    expiryDate?: string;
    itemName?: string;
  };
};

export async function getGroceryList(): Promise<GroceryItem[]> {
  const items = await request<GroceryItem[]>('/api/groceries');
  // Ensure both _id and id are available for compatibility
  return items.map(item => ({
    ...item,
    id: item._id, // Add id field for frontend compatibility
  }));
}

export async function addGroceryItem(item: { 
  name: string; 
  quantity: number; 
  unit: string; 
  price?: number; // Optional price in ₹
  expiryDate?: string;
  notificationPreferences?: GroceryItem['notificationPreferences'];
}): Promise<GroceryItem> {
  const newItem = await request<GroceryItem>('/api/groceries', { method: 'POST', body: JSON.stringify(item) });
  // Ensure both _id and id are available for compatibility
  return {
    ...newItem,
    id: newItem._id,
  };
}

export async function updateGroceryItem(id: string, updates: Partial<GroceryItem>): Promise<GroceryItem> {
  const updatedItem = await request<GroceryItem>(`/api/groceries/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
  // Ensure both _id and id are available for compatibility
  return {
    ...updatedItem,
    id: updatedItem._id,
  };
}

export async function deleteGroceryItem(id: string): Promise<void> {
  return request(`/api/groceries/${id}`, { method: 'DELETE' });
}

// Status management functions
export async function updateItemStatus(id: string, status: GroceryItemStatus): Promise<GroceryItem> {
  const updatedItem = await request<GroceryItem>(`/api/groceries/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
  return { ...updatedItem, id: updatedItem._id };
}

export async function markItemCompleted(id: string): Promise<GroceryItem> {
  const updatedItem = await request<GroceryItem>(`/api/groceries/${id}/mark-completed`, {
    method: 'POST'
  });
  return { ...updatedItem, id: updatedItem._id };
}

export async function markItemUsed(id: string): Promise<GroceryItem> {
  const updatedItem = await request<GroceryItem>(`/api/groceries/${id}/mark-used`, {
    method: 'POST'
  });
  return { ...updatedItem, id: updatedItem._id };
}

export async function getItemsByStatus(status: GroceryItemStatus): Promise<GroceryItem[]> {
  const items = await request<GroceryItem[]>(`/api/groceries/by-status/${status}`);
  return items.map(item => ({ ...item, id: item._id }));
}

// Expiry-related API functions
export async function getExpiringItems(days: number = 7): Promise<GroceryItem[]> {
  const items = await request<GroceryItem[]>(`/api/groceries/expiring?days=${days}`);
  return items.map(item => ({ ...item, id: item._id }));
}

export async function getExpiredItems(): Promise<GroceryItem[]> {
  const items = await request<GroceryItem[]>('/api/groceries/expired');
  return items.map(item => ({ ...item, id: item._id }));
}

export async function updateItemExpiry(id: string, updates: {
  expiryDate?: string;
  notificationPreferences?: GroceryItem['notificationPreferences'];
}): Promise<GroceryItem> {
  const updatedItem = await request<GroceryItem>(`/api/groceries/${id}/expiry`, { 
    method: 'PATCH', 
    body: JSON.stringify(updates) 
  });
  return { ...updatedItem, id: updatedItem._id };
}

// Notification API functions
export async function getNotifications(page: number = 1, limit: number = 20, status?: string): Promise<{
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(status && { status })
  });
  
  const result = await request<{
    notifications: Notification[];
    pagination: any;
  }>(`/api/groceries/notifications?${params}`);
  
  return {
    ...result,
    notifications: result.notifications.map(notif => ({ ...notif, id: notif._id }))
  };
}

export async function markNotificationAsRead(id: string): Promise<Notification> {
  const notification = await request<Notification>(`/api/groceries/notifications/${id}/read`, { 
    method: 'PATCH' 
  });
  return { ...notification, id: notification._id };
}

// Expiry statistics
export async function getExpiryStats(): Promise<{
  totalExpiringItems: number;
  byDate: Array<{
    _id: string;
    count: number;
    items: string[];
  }>;
  nextCheck: string;
}> {
  return request('/api/groceries/expiry/stats');
}


