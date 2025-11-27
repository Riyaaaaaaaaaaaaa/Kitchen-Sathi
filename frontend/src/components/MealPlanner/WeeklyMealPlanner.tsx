import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMealPlans,
  removeMealFromPlan,
  MealPlan,
  MealPlanEntry,
  getWeekDates
} from '../../lib/mealPlanApi';
import { Logo } from '../Logo';
import { UserAvatar } from '../UserAvatar';
import NotificationBell from '../NotificationBell';
import { MealCard } from './MealCard';
import { AddMealModal } from './AddMealModal';
import { MealDetailsModal } from './MealDetailsModal';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../Toast';

interface WeeklyMealPlannerProps {
  className?: string;
}

export function WeeklyMealPlanner({ className = '' }: WeeklyMealPlannerProps) {
  const navigate = useNavigate();
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ date: string; mealIndex: number } | null>(null);
  const [showMealDetails, setShowMealDetails] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<{ meal: MealPlanEntry; date: string; index: number } | null>(null);
  const { toasts, removeToast, success, error: showError } = useToast();

  const weekInfo = getWeekDates(currentWeekStart);

  useEffect(() => {
    loadWeekMealPlans();
  }, [currentWeekStart]);

  const loadWeekMealPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const plans = await getMealPlans(weekInfo.startDate, weekInfo.endDate);
      setMealPlans(plans);
    } catch (err: any) {
      setError(err.message || 'Failed to load meal plans');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const handleThisWeek = () => {
    setCurrentWeekStart(new Date());
  };

  const handleAddMeal = (date: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setSelectedDate(date);
    setSelectedMealType(mealType);
    setShowAddMealModal(true);
  };

  const handleMealClick = (meal: MealPlanEntry, date: string, index: number) => {
    setSelectedMeal({ meal, date, index });
    setShowMealDetails(true);
  };

  const handleRemoveMeal = async (date: string, mealIndex: number) => {
    setDeleteTarget({ date, mealIndex });
    setShowDeleteConfirm(true);
  };

  const handleRemoveMealFromDetails = async () => {
    if (!selectedMeal) return;

    try {
      await removeMealFromPlan(selectedMeal.date, selectedMeal.index);
      success('Meal removed from your plan');
      setShowMealDetails(false);
      setSelectedMeal(null);
      await loadWeekMealPlans();
    } catch (err: any) {
      console.error('Failed to remove meal:', err);
      showError(err.message || 'Failed to remove meal');
    }
  };

  const confirmRemoveMeal = async () => {
    if (!deleteTarget) return;

    try {
      await removeMealFromPlan(deleteTarget.date, deleteTarget.mealIndex);
      success('Meal removed from your plan');
      await loadWeekMealPlans();
    } catch (err: any) {
      console.error('Failed to remove meal:', err);
      showError(err.message || 'Failed to remove meal');
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const getMealsForDate = (date: string): MealPlan | undefined => {
    return mealPlans.find(plan => plan.date === date);
  };

  const getMealsByType = (date: string, mealType: string): MealPlanEntry[] => {
    const plan = getMealsForDate(date);
    if (!plan) return [];
    return plan.meals.filter(meal => meal.mealType === mealType);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  const mealTypes: Array<{ type: 'breakfast' | 'lunch' | 'dinner' | 'snack'; icon: string; label: string; color: string }> = [
    { type: 'breakfast', icon: '🌅', label: 'Breakfast', color: 'bg-yellow-50 border-yellow-200' },
    { type: 'lunch', icon: '🌞', label: 'Lunch', color: 'bg-orange-50 border-orange-200' },
    { type: 'dinner', icon: '🌙', label: 'Dinner', color: 'bg-purple-50 border-purple-200' },
    { type: 'snack', icon: '🍿', label: 'Snacks', color: 'bg-green-50 border-green-200' }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-orange-50 to-white ${className}`}>
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
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📅 Weekly Meal Planner</h1>
          <p className="text-gray-600">Plan your meals for the week</p>
        </div>
        {/* Week Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousWeek}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">
                {formatDate(weekInfo.startDate)} - {formatDate(weekInfo.endDate)}
              </h2>
              <button
                onClick={handleThisWeek}
                className="mt-1 text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Today
              </button>
            </div>

            <button
              onClick={handleNextWeek}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
              <span className="ml-3 text-gray-600">Loading meal plans...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Calendar Grid - Desktop */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
              <div className="grid grid-cols-8 border-b border-gray-200">
                {/* Meal Type Column Header */}
                <div className="p-4 bg-gray-50 font-medium text-gray-700 border-r border-gray-200">
                  Meal Type
                </div>
                {/* Day Headers */}
                {weekInfo.dates.map(date => (
                  <div
                    key={date}
                    className={`p-4 text-center border-r border-gray-200 last:border-r-0 ${
                      isToday(date) ? 'bg-orange-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{getDayName(date)}</div>
                    <div className={`text-sm ${isToday(date) ? 'text-orange-600 font-bold' : 'text-gray-600'}`}>
                      {formatDate(date)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Meal Rows */}
              {mealTypes.map(({ type, icon, label, color }) => (
                <div key={type} className="grid grid-cols-8 border-b border-gray-200 last:border-b-0">
                  {/* Meal Type Label */}
                  <div className={`p-4 ${color} border-r border-gray-200 flex items-center gap-2 font-medium`}>
                    <span className="text-2xl">{icon}</span>
                    <span>{label}</span>
                  </div>

                  {/* Day Cells */}
                  {weekInfo.dates.map(date => {
                    const meals = getMealsByType(date, type);
                    return (
                      <div
                        key={`${date}-${type}`}
                        className={`p-2 border-r border-gray-200 last:border-r-0 min-h-[120px] ${
                          isToday(date) ? 'bg-orange-50/30' : ''
                        }`}
                      >
                        <div className="space-y-2">
                          {meals.map((meal, idx) => (
                            <MealCard
                              key={idx}
                              meal={meal}
                              onClick={() => {
                                const plan = getMealsForDate(date);
                                if (plan) {
                                  const globalIndex = plan.meals.indexOf(meal);
                                  handleMealClick(meal, date, globalIndex);
                                }
                              }}
                              onRemove={() => {
                                const plan = getMealsForDate(date);
                                if (plan) {
                                  const globalIndex = plan.meals.indexOf(meal);
                                  handleRemoveMeal(date, globalIndex);
                                }
                              }}
                              compact
                            />
                          ))}
                          {/* Always show add button */}
                          <button
                            onClick={() => handleAddMeal(date, type)}
                            className="w-full py-2 flex items-center justify-center text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border-2 border-dashed border-gray-200 hover:border-orange-300"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Mobile View - Day Cards */}
            <div className="lg:hidden space-y-4">
              {weekInfo.dates.map(date => (
                <div
                  key={date}
                  className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                    isToday(date) ? 'border-orange-300 ring-2 ring-orange-200' : 'border-orange-100'
                  }`}
                >
                  {/* Day Header */}
                  <div className={`p-4 ${isToday(date) ? 'bg-orange-100' : 'bg-gray-50'} border-b border-gray-200`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{getDayName(date)}</div>
                        <div className={`text-sm ${isToday(date) ? 'text-orange-700 font-medium' : 'text-gray-600'}`}>
                          {formatDate(date)}
                        </div>
                      </div>
                      {isToday(date) && (
                        <span className="px-3 py-1 bg-orange-600 text-white text-xs font-medium rounded-full">
                          Today
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Meals for the day */}
                  <div className="p-4 space-y-4">
                    {mealTypes.map(({ type, icon, label, color }) => {
                      const meals = getMealsByType(date, type);
                      return (
                        <div key={type} className={`${color} rounded-lg p-3 border`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 font-medium text-gray-900">
                              <span className="text-xl">{icon}</span>
                              <span>{label}</span>
                            </div>
                            <button
                              onClick={() => handleAddMeal(date, type)}
                              className="p-1 text-gray-600 hover:text-orange-600 hover:bg-white rounded transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>

                          {meals.length > 0 ? (
                            <div className="space-y-2">
                              {meals.map((meal, idx) => (
                                <MealCard
                                  key={idx}
                                  meal={meal}
                                  onClick={() => {
                                    const plan = getMealsForDate(date);
                                    if (plan) {
                                      const globalIndex = plan.meals.indexOf(meal);
                                      handleMealClick(meal, date, globalIndex);
                                    }
                                  }}
                                  onRemove={() => {
                                    const plan = getMealsForDate(date);
                                    if (plan) {
                                      const globalIndex = plan.meals.indexOf(meal);
                                      handleRemoveMeal(date, globalIndex);
                                    }
                                  }}
                                />
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-2">No meal planned</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-orange-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/recipes')}
                  className="p-4 text-left border-2 border-dashed border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group"
                >
                  <div className="text-2xl mb-2">🍳</div>
                  <div className="font-medium text-gray-900 group-hover:text-orange-600">Browse Recipes</div>
                  <div className="text-sm text-gray-600">Find new meal ideas</div>
                </button>

                <button
                  onClick={() => navigate('/groceries')}
                  className="p-4 text-left border-2 border-dashed border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group"
                >
                  <div className="text-2xl mb-2">🛒</div>
                  <div className="font-medium text-gray-900 group-hover:text-orange-600">Grocery List</div>
                  <div className="text-sm text-gray-600">Manage your shopping</div>
                </button>

                <button
                  onClick={loadWeekMealPlans}
                  className="p-4 text-left border-2 border-dashed border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group"
                >
                  <div className="text-2xl mb-2">🔄</div>
                  <div className="font-medium text-gray-900 group-hover:text-orange-600">Refresh</div>
                  <div className="text-sm text-gray-600">Reload meal plans</div>
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Add Meal Modal */}
      {showAddMealModal && selectedDate && (
        <AddMealModal
          date={selectedDate}
          mealType={selectedMealType}
          onClose={() => {
            setShowAddMealModal(false);
            setSelectedDate(null);
          }}
          onSuccess={() => {
            setShowAddMealModal(false);
            setSelectedDate(null);
            loadWeekMealPlans();
          }}
        />
      )}

      {/* Meal Details Modal */}
      {showMealDetails && selectedMeal && (
        <MealDetailsModal
          meal={selectedMeal.meal}
          date={selectedMeal.date}
          onClose={() => {
            setShowMealDetails(false);
            setSelectedMeal(null);
          }}
          onRemove={handleRemoveMealFromDetails}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Remove Meal</h3>
              <p className="text-gray-600">
                Are you sure you want to remove this meal from your plan? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTarget(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveMeal}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default WeeklyMealPlanner;

