import React, { useEffect, useState } from 'react';
import { AuthCard } from './AuthCard';
import { Logo } from './Logo';

// Feature icons for enhanced visual appeal
const FeatureIcon = ({ icon, className = "w-5 h-5" }: { icon: string, className?: string }) => {
  const icons: Record<string, JSX.Element> = {
    alerts: (
      <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    planning: (
      <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
      </svg>
    ),
    tracking: (
      <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
      </svg>
    ),
    grocery: (
      <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <rect x="4" y="5" width="12" height="10" rx="2" fill="currentColor" />
        <path d="M7 8h6M7 11h3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="15" cy="5" r="1.5" fill="#fff" opacity="0.6" />
      </svg>
    ),
    recipes: (
      <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    )
  };
  return icons[icon] || null;
};

interface LandingPageProps {
  onLogin: (data: any) => void;
  onRegister: (data: any) => void;
  loading?: boolean;
  error?: string;
}

export function LandingPage({ onLogin, onRegister, loading = false, error }: LandingPageProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [mounted, setMounted] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);

  const handleAuthSubmit = (data: any) => {
    if (authMode === 'login') {
      onLogin(data);
    } else {
      onRegister(data);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'login' ? 'register' : 'login');
  };

  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 50);
    const t2 = setTimeout(() => setHeroVisible(true), 200);
    const t3 = setTimeout(() => setFeaturesVisible(true), 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Background decorative elements (very subtle, de-emphasized) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -left-16 w-40 h-40 bg-orange-100 rounded-full opacity-10"></div>
        <div className="absolute bottom-[-2rem] right-[-2rem] w-48 h-48 bg-orange-200 rounded-full opacity-10"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Column - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 to-orange-600 relative overflow-hidden">
          {/* Faint kitchen pattern texture for warmth */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-16 left-16 w-24 h-24 border border-white rounded-full"></div>
            <div className="absolute bottom-24 right-24 w-20 h-20 border border-white rounded-full"></div>
            {/* Subtle kitchen utensil patterns */}
            <div className="absolute top-32 right-32 w-16 h-16 opacity-10">
              <svg viewBox="0 0 16 16" fill="white">
                <path d="M8 2L6 4L8 6L10 4L8 2Z" />
                <path d="M8 6L6 8L8 10L10 8L8 6Z" />
              </svg>
            </div>
          </div>

          {/* Kitchen Hero Illustration */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <img
              src="/kitchen-hero.svg"
              alt="KitchenSathi kitchen illustration with cooking pot, vegetables, and utensils"
              className="max-w-full max-h-full object-contain opacity-20"
            />
          </div>

          {/* Content Overlay with premium card styling */}
          <div className="relative z-10 flex flex-col justify-center p-12 text-left">
            <div className="max-w-2xl bg-white/50 backdrop-blur-3xl ring-2 ring-white/60 rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/20">
              <Logo size="xl" className="mb-6" />

              {/* Tagline with chip/capsule background for max clarity */}
              <div
                className={`inline-block mb-4 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}
              >
                <span className="inline-flex items-center px-4 py-2 bg-white/90 text-orange-700 text-sm font-semibold rounded-full shadow-lg border border-white/50">
                  Your smart kitchen companion
                </span>
              </div>

              {/* Headline with staggered animation */}
              <h1
                className={`text-gray-900 text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-6 transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
              >
                Plan meals effortlessly. Reduce waste. Cook with confidence.
              </h1>

              {/* Supporting copy */}
              <p className="text-gray-800 text-lg leading-relaxed">
                KitchenSathi helps you track groceries, get expiry alerts, and plan meals that fit your life.
              </p>
            </div>

            {/* Enhanced Features List with icons and descriptions */}
            <div className={`mt-8 max-w-2xl transition-all duration-700 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 text-white">
                  <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center ring-1 ring-white/30">
                    <FeatureIcon icon="alerts" className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Smart expiry alerts</h3>
                    <p className="text-white/80 text-sm">Never waste food again with timely notifications</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 text-white">
                  <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center ring-1 ring-white/30">
                    <FeatureIcon icon="planning" className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Intelligent meal planning</h3>
                    <p className="text-white/80 text-sm">Plan meals based on your ingredients and preferences</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 text-white">
                  <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center ring-1 ring-white/30">
                    <FeatureIcon icon="tracking" className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Waste reduction tracking</h3>
                    <p className="text-white/80 text-sm">Monitor and reduce food waste with smart insights</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 text-white">
                  <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center ring-1 ring-white/30">
                    <FeatureIcon icon="grocery" className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Grocery Planner</h3>
                    <p className="text-white/80 text-sm">Organize your grocery list and shop efficiently</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 text-white">
                  <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center ring-1 ring-white/30">
                    <FeatureIcon icon="recipes" className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Recipe suggestions</h3>
                    <p className="text-white/80 text-sm">Discover new recipes based on what you have</p>
                  </div>
                </div>
              </div>

              {/* Trust indicator below features */}
              <div className="mt-6 pt-4 border-t border-white/20">
                <p className="text-white/80 text-sm font-medium text-center">
                  Trusted by 1,500+ cooks across India
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Auth Section (mobile shows hero first for simplicity) */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Hero: stacked first with larger headline */}
            <div className="lg:hidden mb-8">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-1 shadow-xl">
                <div className="bg-white/50 backdrop-blur-3xl ring-2 ring-white/60 rounded-2xl p-6 text-left shadow-2xl border border-white/20">
                  <Logo size="lg" className="mb-4" />

                  {/* Mobile tagline with chip */}
                  <div className="mb-4">
                    <span className="inline-flex items-center px-3 py-1.5 bg-white/90 text-orange-700 text-xs font-semibold rounded-full shadow-md border border-white/50">
                      Your smart kitchen companion
                    </span>
                  </div>

                  <h2 className={`text-gray-900 text-3xl font-extrabold leading-tight mb-4 transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}>
                    Plan meals effortlessly. Reduce waste. Cook with confidence.
                  </h2>

                  <p className="text-gray-800 text-base leading-relaxed">
                    KitchenSathi helps you track groceries, get expiry alerts, and plan meals that fit your life.
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Features: enhanced with icons and descriptions */}
            <div className="lg:hidden mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Why KitchenSathi?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 text-gray-800">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center ring-1 ring-orange-200">
                    <FeatureIcon icon="alerts" className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Smart expiry alerts</h4>
                    <p className="text-xs text-gray-600">Never waste food again</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-gray-800">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center ring-1 ring-orange-200">
                    <FeatureIcon icon="planning" className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Intelligent meal planning</h4>
                    <p className="text-xs text-gray-600">Plan based on your ingredients</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-gray-800">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center ring-1 ring-orange-200">
                    <FeatureIcon icon="tracking" className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Waste reduction tracking</h4>
                    <p className="text-xs text-gray-600">Monitor and reduce food waste</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-gray-800">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center ring-1 ring-orange-200">
                    <FeatureIcon icon="grocery" className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Grocery Planner</h4>
                    <p className="text-xs text-gray-600">Keep lists and never miss an item</p>
                  </div>
                </div>


                <div className="flex items-start space-x-3 text-gray-800">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center ring-1 ring-orange-200">
                    <FeatureIcon icon="recipes" className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Recipe suggestions</h4>
                    <p className="text-xs text-gray-600">Discover new recipes</p>
                  </div>
                </div>
              </div>

              {/* Trust indicator for mobile */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-gray-600 text-xs font-medium text-center">
                  Trusted by 1,500+ cooks across India
                </p>
              </div>
            </div>

            {/* Auth Card (after hero and features) */}
            <AuthCard
              mode={authMode}
              onSubmit={handleAuthSubmit}
              onModeSwitch={toggleAuthMode} 
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
