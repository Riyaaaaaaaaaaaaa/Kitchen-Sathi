import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingHero from './components/LandingHero';
import Dashboard from './components/Dashboard';
import { GroceryListPage } from './components/GroceryLists/GroceryListPage';
import { RecipeSuggestionsPage } from './components/Recipes/RecipeSuggestionsPage';
import { WeeklyMealPlanner } from './components/MealPlanner/WeeklyMealPlanner';
import { Analytics } from './components/Analytics';
import { AnalyticsHub } from './components/AnalyticsHub';
import { CalorieAnalytics } from './components/CalorieAnalytics';
import { MyRecipesPage } from './components/UserRecipes/MyRecipesPage';
import { CreateRecipePage } from './components/UserRecipes/CreateRecipePage';
import { RecipeDetailsPage } from './components/UserRecipes/RecipeDetailsPage';
import { SharedRecipesPage } from './components/UserRecipes/SharedRecipesPage';
import { SharedRecipeViewPage } from './components/UserRecipes/SharedRecipeViewPage';
import { VerifyEmailPage } from './components/Auth/VerifyEmailPage';
import { ForgotPasswordPage } from './components/Auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/Auth/ResetPasswordPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function Content() {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public route - Landing page or Dashboard */}
      <Route
        path="/"
        element={user ? <Dashboard /> : <LandingHero />}
      />

      {/* Auth routes (public) */}
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected routes */}
      <Route
        path="/groceries"
        element={
          <ProtectedRoute>
            <GroceryListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recipes"
        element={
          <ProtectedRoute>
            <RecipeSuggestionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/meal-planner"
        element={
          <ProtectedRoute>
            <WeeklyMealPlanner />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics-hub"
        element={
          <ProtectedRoute>
            <AnalyticsHub />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/calorie-analytics"
        element={
          <ProtectedRoute>
            <CalorieAnalytics />
          </ProtectedRoute>
        }
      />

      {/* My Recipes routes */}
      <Route
        path="/my-recipes"
        element={
          <ProtectedRoute>
            <MyRecipesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-recipes/create"
        element={
          <ProtectedRoute>
            <CreateRecipePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-recipes/:id"
        element={
          <ProtectedRoute>
            <RecipeDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-recipes/:id/edit"
        element={
          <ProtectedRoute>
            <CreateRecipePage />
          </ProtectedRoute>
        }
      />

      {/* Shared Recipes routes */}
      <Route
        path="/shared-recipes"
        element={
          <ProtectedRoute>
            <SharedRecipesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/shared-recipes/:shareId/view"
        element={
          <ProtectedRoute>
            <SharedRecipeViewPage />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Content />
      </AuthProvider>
    </BrowserRouter>
  );
}
