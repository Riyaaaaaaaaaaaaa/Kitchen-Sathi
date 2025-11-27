import React, { useState, useEffect } from 'react';
import { searchUsersByEmail, shareRecipe, UserSearchResult } from '../../lib/sharedRecipesApi';
import { useToast } from '../../hooks/useToast';

interface ShareRecipeModalProps {
  isOpen: boolean;
  recipeId: string;
  recipeName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ShareRecipeModal({ isOpen, recipeId, recipeName, onClose, onSuccess }: ShareRecipeModalProps) {
  const { success, error: showError } = useToast();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setEmail('');
      setMessage('');
      setSearchResults([]);
      setSelectedUser(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (email.length >= 3) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300); // Debounce

    return () => clearTimeout(searchTimer);
  }, [email]);

  const handleSearch = async () => {
    if (email.length < 3) return;

    try {
      setIsSearching(true);
      const results = await searchUsersByEmail(email);
      setSearchResults(results);
    } catch (err: any) {
      console.error('Error searching users:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (user: UserSearchResult) => {
    setSelectedUser(user);
    setEmail(user.email);
    setSearchResults([]);
  };

  const handleShare = async () => {
    if (!email.trim()) {
      showError('Please enter an email address');
      return;
    }

    try {
      setIsSharing(true);
      const result = await shareRecipe(recipeId, email.trim(), message.trim());
      success(result.message);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error sharing recipe:', err);
      showError(err.message || 'Failed to share recipe');
    } finally {
      setIsSharing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Share Recipe</h2>
            <p className="text-sm text-gray-600 mt-1">{recipeName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Email Search */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Share with (Email) *
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSelectedUser(null);
              }}
              placeholder="Enter user's email..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={isSharing}
            />
            {isSearching && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && !selectedUser && (
            <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {searchResults.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{user.name || 'Unknown User'}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </button>
              ))}
            </div>
          )}

          {/* Selected User */}
          {selectedUser && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-medium text-green-900">{selectedUser.name || 'Unknown User'}</div>
                <div className="text-sm text-green-700">{selectedUser.email}</div>
              </div>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setEmail('');
                }}
                className="p-1 hover:bg-green-100 rounded-full transition-colors"
                aria-label="Clear selection"
              >
                <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <p className="mt-1 text-xs text-gray-500">
            Type at least 3 characters to search for users
          </p>
        </div>

        {/* Message */}
        <div className="mb-6">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message (Optional)
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a personal message..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            disabled={isSharing}
          />
          <p className="mt-1 text-xs text-gray-500 text-right">
            {message.length}/500
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSharing}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={isSharing || !email.trim()}
            className="flex-1 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSharing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sharing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Recipe
              </>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">ℹ️ Note:</span> The recipient will be able to view your recipe and add it to their meal plans.
          </p>
        </div>
      </div>
    </div>
  );
}

