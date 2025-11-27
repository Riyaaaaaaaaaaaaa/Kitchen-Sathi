import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReceivedShares, getSentShares, updateShareStatus, deleteShare, SharedRecipe } from '../../lib/sharedRecipesApi';
import { Logo } from '../Logo';
import { UserAvatar } from '../UserAvatar';
import NotificationBell from '../NotificationBell';
import { StarRating } from '../StarRating';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../Toast';

export function SharedRecipesPage() {
  const navigate = useNavigate();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [receivedShares, setReceivedShares] = useState<SharedRecipe[]>([]);
  const [sentShares, setSentShares] = useState<SharedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<SharedRecipe | null>(null);

  useEffect(() => {
    fetchShares();
  }, [activeTab]);

  const fetchShares = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'received') {
        const shares = await getReceivedShares();
        setReceivedShares(shares);
      } else {
        const shares = await getSentShares();
        setSentShares(shares);
      }
    } catch (err: any) {
      console.error('Error fetching shares:', err);
      setError(err.message || 'Failed to load shared recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (shareId: string) => {
    try {
      const result = await updateShareStatus(shareId, 'accepted');
      success(result.message);
      fetchShares();
    } catch (err: any) {
      console.error('Error accepting share:', err);
      showError(err.message || 'Failed to accept recipe');
    }
  };

  const handleReject = async (shareId: string) => {
    try {
      const result = await updateShareStatus(shareId, 'rejected');
      success(result.message);
      fetchShares();
    } catch (err: any) {
      console.error('Error rejecting share:', err);
      showError(err.message || 'Failed to reject recipe');
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const handleDelete = async (shareId: string) => {
    try {
      const result = await deleteShare(shareId);
      success(result.message);
      setShowDeleteModal(null);
      fetchShares();
    } catch (err: any) {
      console.error('Error deleting share:', err);
      showError(err.message || 'Failed to remove share');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Pending</span>;
      case 'accepted':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Accepted</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Rejected</span>;
      default:
        return null;
    }
  };

  const currentShares = activeTab === 'received' ? receivedShares : sentShares;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="md" className="text-orange-600" />
            <div className="flex items-center gap-4">
              <NotificationBell />
              <UserAvatar size="md" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🤝 Shared Recipes</h1>
          <p className="text-gray-600">View recipes shared with you and by you</p>
        </div>
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'received'
                  ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📬 Received ({receivedShares.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'sent'
                  ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📤 Sent ({sentShares.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchShares}
              className="mt-2 text-red-700 underline"
            >
              Try again
            </button>
          </div>
        ) : currentShares.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-12 text-center">
            <div className="text-6xl mb-4">{activeTab === 'received' ? '📭' : '📪'}</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {activeTab === 'received' ? 'No recipes shared with you' : 'No recipes shared by you'}
            </h2>
            <p className="text-gray-600">
              {activeTab === 'received'
                ? 'When someone shares a recipe with you, it will appear here.'
                : 'Share your recipes with friends and family to see them here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentShares.map((share) => (
              <div
                key={share._id}
                className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Recipe Image */}
                    {share.recipeId?.image && (
                      <img
                        src={share.recipeId.image}
                        alt={share.recipeId.name}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    )}

                    {/* Recipe Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 truncate">
                            {share.recipeId?.name || 'Deleted Recipe'}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {activeTab === 'received' ? (
                              <>From: <span className="font-medium">{share.ownerId?.name || share.ownerId?.email}</span></>
                            ) : (
                              <>To: <span className="font-medium">{share.sharedWithUserId?.name || share.sharedWithUserId?.email}</span></>
                            )}
                          </p>
                        </div>
                        {getStatusBadge(share.status)}
                      </div>

                      {/* Recipe Details */}
                      {share.recipeId && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {share.recipeId.cookingTime && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                              🕐 {share.recipeId.cookingTime} min
                            </span>
                          )}
                          {share.recipeId.servings && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                              👥 {share.recipeId.servings} servings
                            </span>
                          )}
                          {share.recipeId.cuisine && (
                            <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-full">
                              {share.recipeId.cuisine}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Rating */}
                      {share.recipeId?.rating && (
                        <div className="mb-3">
                          <StarRating rating={share.recipeId.rating} readonly size="sm" showLabel />
                        </div>
                      )}

                      {/* Message */}
                      {share.message && (
                        <div className="p-3 bg-gray-50 rounded-lg mb-3">
                          <p className="text-sm text-gray-700 italic">"{share.message}"</p>
                        </div>
                      )}

                      {/* Shared Date */}
                      <p className="text-xs text-gray-500">
                        Shared on {new Date(share.sharedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                    {activeTab === 'received' && share.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAccept(share._id)}
                          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleReject(share._id)}
                          className="flex-1 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors text-sm"
                        >
                          ✕ Reject
                        </button>
                      </>
                    )}

                    {/* Show View Recipe button for:
                        - Received + Accepted shares (view in SharedRecipeViewPage)
                        - Sent + Any status (view in My Recipes - it's their own recipe)
                    */}
                    {share.recipeId && (share.status === 'accepted' || activeTab === 'sent') && (
                      <button
                        onClick={() => {
                          if (activeTab === 'received') {
                            navigate(`/shared-recipes/${share._id}/view`);
                          } else {
                            navigate(`/my-recipes/${share.recipeId._id}`);
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        View Recipe
                      </button>
                    )}

                    <button
                      onClick={() => setShowDeleteModal(share._id)}
                      className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg font-medium transition-colors text-sm"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Remove Share</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to remove this share?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default SharedRecipesPage;

