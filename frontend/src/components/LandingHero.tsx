import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { AuthCard } from './AuthCard';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';

interface LandingHeroProps {
  onLogin?: (data: any) => void;
  onRegister?: (data: any) => void;
  loading?: boolean;
  error?: string;
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-black/5">
          {children}
        </div>
      </div>
    </div>
  );
}

export function LandingHero({ onLogin, onRegister, loading: propLoading = false, error: propError }: LandingHeroProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, loading: authLoading, error: authError } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [localError, setLocalError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    const t = setTimeout(() => setMounted(true), 50);
    return () => {
      clearTimeout(t);
      media.removeEventListener?.('change', update);
    };
  }, []);

  // Check if we should open login modal (from email verification success)
  useEffect(() => {
    const state = location.state as any;
    if (state?.openLoginModal) {
      setAuthMode('login');
      setModalOpen(true);
      // Clear the state
      navigate('/', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const openLogin = () => {
    setAuthMode('login');
    setModalOpen(true);
    setLocalError(null);
  };
  const openRegister = () => {
    setAuthMode('register');
    setModalOpen(true);
    setLocalError(null);
  };
  const toggleAuthMode = () => setAuthMode(m => m === 'login' ? 'register' : 'login');

  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      setLocalLoading(true);
      setLocalError(null);
      await login(data.email, data.password);
      setModalOpen(false);
      // User will be redirected automatically by App.tsx when user state changes
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Check if the error is due to unverified email
      if (err.details?.requiresVerification && err.details?.userId) {
        setLocalError('Please verify your email first. Redirecting to verification page...');
        // Redirect to verification page after a short delay
        setTimeout(() => {
          setModalOpen(false);
          navigate('/verify-email', {
            state: { userId: err.details.userId, email: data.email }
          });
        }, 1500);
      } else {
        const errorMessage = err.message || 'Login failed. Please try again.';
        setLocalError(errorMessage);
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleRegister = async (data: { name: string; email: string; password: string }) => {
    try {
      setLocalLoading(true);
      setLocalError(null);
      
      // Make direct API call to check if verification is required
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          name: data.name,
          password: data.password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Registration failed');
      }

      // Check if email verification is required
      if (responseData.requiresVerification && responseData.user) {
        setModalOpen(false);
        // Redirect to email verification page
        navigate('/verify-email', {
          state: { userId: responseData.user.id, email: responseData.user.email }
        });
      } else {
        // Old flow (if backend doesn't require verification)
        await register(data.email, data.name, data.password);
        setModalOpen(false);
      }
    } catch (err) {
      console.error('Register error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setLocalError(errorMessage);
    } finally {
      setLocalLoading(false);
    }
  };

  // Use local state for loading/error, fallback to props
  const isLoading = localLoading || authLoading || propLoading;
  const error = localError || authError || propError;

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700" />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="ks-texture" width="48" height="48" patternUnits="userSpaceOnUse">
            <g fill="white">
              <circle cx="8" cy="8" r="1.5" />
              <rect x="24" y="24" width="2" height="2" rx="1" />
              <path d="M36 10 l4 0 l0 2 l-4 0 z" />
              <path d="M12 30 l6 0 l0 2 l-6 0 z" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ks-texture)" />
      </svg>

      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-4xl px-6">
          <div className="flex flex-col items-center text-center text-white">
            <Logo size="xl" className={`mb-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} />

            {/* Tagline */}
            <span className={`inline-flex items-center px-4 py-1.5 rounded-full bg-white/90 text-orange-700 text-sm font-semibold shadow-md border border-white/60 mb-4 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              Your smart kitchen companion
            </span>
            {/* Headline */}
            <h1 className={`max-w-3xl text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-4 drop-shadow-lg transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
              Plan meals effortlessly. Reduce waste. Cook with confidence.
            </h1>
            {/* Value prop */}
            <p className={`max-w-2xl text-lg sm:text-xl text-white/95 mb-8 transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              Track groceries, get expiry alerts, and plan meals in minutes.
            </p>
            {/* Actions */}
            <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <button
                onClick={openLogin}
                className="w-full sm:w-auto min-w-[200px] px-6 py-4 rounded-xl bg-white text-orange-700 font-semibold shadow-xl hover:shadow-2xl hover:bg-orange-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40 active:translate-y-[1px] transition"
              >Login</button>
              <button
                onClick={openRegister}
                className="w-full sm:w-auto min-w-[200px] px-6 py-4 rounded-xl bg-orange-900/10 text-white font-semibold shadow-xl ring-1 ring-white/40 hover:bg-orange-900/20 hover:shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40 active:translate-y-[1px] transition"
              >Register</button>
            </div>
            {/* Feature pills */}
            <div className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 transition-all ${reduceMotion ? '' : 'duration-700'} ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              {[
                { label: 'Smart expiry alerts', icon: '⚑' },
                { label: 'Meal planning', icon: '🍽️' },
                { label: 'Expiry tracking', icon: '♻️' },
                { label: 'Grocery planner', icon: '🛒' },
                { label: 'Recipe suggestions', icon: '📖' },
              ].map((f, i) => (
                <button
                  key={f.label}
                  type="button"
                  aria-label={f.label}
                  className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white/95 text-sm ring-1 ring-white/25 backdrop-blur-sm transition-transform hover:bg-white/25 hover:translate-y-[-1px] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
                  style={{ transitionDelay: reduceMotion ? undefined : `${100 * i}ms` }}
                >
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:scale-110">
                    {f.icon}
                  </span>
                  {f.label}
                </button>
              ))}
            </div>
            {/* Avatars social proof */}
            <div className={`mt-6 flex items-center justify-center gap-2 text-white/90 transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              {[1,2,3,4,5].map((n, idx) => (
                <img
                  key={n}
                  src={`https://i.pravatar.cc/48?img=${n}`}
                  alt={`KitchenSathi user avatar ${idx + 1}`}
                  className="h-8 w-8 rounded-full ring-2 ring-white/40 transition-transform hover:scale-105"
                />
              ))}
              <span className="ml-2 text-sm">Trusted by 1,500+ cooks</span>
            </div>
          </div>
        </div>
      </div>
      {/* Modal for Login/Register */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="p-6 sm:p-8">
          <AuthCard
            mode={authMode}
            onSubmit={authMode === 'login' ? handleLogin : handleRegister}
            onModeSwitch={toggleAuthMode}
            loading={isLoading}
            error={error}
          />
        </div>
      </Modal>
    </div>
  );
}

export default LandingHero;
