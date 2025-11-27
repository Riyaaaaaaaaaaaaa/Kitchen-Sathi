import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProfileModal } from './ProfileModal';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  showDropdown?: boolean;
  className?: string;
}

export function UserAvatar({ size = 'md', showDropdown = true, className = '' }: UserAvatarProps) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarBg = (name: string) => {
    const colors = [
      'bg-orange-500',
      'bg-blue-500', 
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500'
    ];
    const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
    setIsOpen(false);
  };

  return (
    <>
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          aria-label="User menu"
        >
          {/* Avatar */}
          {user?.avatar && user.avatar.startsWith('http') ? (
            <img 
              src={user.avatar} 
              alt={user.name || 'User'} 
              className={`${sizeClasses[size]} rounded-full object-cover shadow-lg ring-2 ring-white`}
            />
          ) : user?.avatar ? (
            <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center shadow-lg ring-2 ring-white text-3xl`}>
              {user.avatar}
            </div>
          ) : (
            <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-semibold shadow-lg ring-2 ring-white bg-gradient-to-br from-orange-400 to-orange-600`}>
              {user?.name ? getInitials(user.name) : 'U'}
            </div>
          )}
          
          {/* Username */}
          <div className="hidden sm:block text-left">
            <div className="text-sm font-medium text-gray-900">
              {user?.name || 'User'}
            </div>
            <div className="text-xs text-gray-500">
              {user?.email}
            </div>
          </div>
          
          {/* Dropdown arrow */}
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && showDropdown && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="text-sm font-medium text-gray-900">{user?.name || 'User'}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
            
            <button
              onClick={handleProfileClick}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors flex items-center gap-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Manage Profile
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Profile Modal */}
      {showProfileModal && (
        <ProfileModal 
          onClose={() => setShowProfileModal(false)}
          user={user}
        />
      )}
    </>
  );
}


export default UserAvatar;
