import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';

interface LocationState {
  userId?: string;
  email?: string;
}

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const state = location.state as LocationState;
  const userId = state?.userId;
  const email = state?.email;
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!userId || !email) {
      showToast('Invalid verification link', 'error');
      navigate('/login');
    }
  }, [userId, email, navigate, showToast]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setCode(newCode.slice(0, 6));

    // Focus the next empty input or the last one
    const nextEmptyIndex = newCode.findIndex((c) => !c);
    const focusIndex = nextEmptyIndex === -1 ? 5 : Math.min(nextEmptyIndex, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      showToast('Please enter all 6 digits', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Don't save token or log in automatically
      // Just show success modal
      setShowSuccessModal(true);
    } catch (err: any) {
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setResending(true);
      const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }

      showToast('Verification code sent! Check your email 📧', 'success');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      showToast(err.message || 'Failed to resend code', 'error');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl mb-4 shadow-lg">
            <span className="text-4xl">📧</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            We sent a 6-digit code to{' '}
            <span className="font-semibold text-gray-900">{email}</span>
          </p>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-3 justify-center mb-8">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:outline-none transition-all"
                  disabled={loading}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || code.join('').length !== 6}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>
        </div>

        {/* Resend Code */}
        <div className="text-center">
          <p className="text-gray-600 mb-3">Didn't receive the code?</p>
          <button
            onClick={handleResendCode}
            disabled={resending}
            className="text-orange-600 hover:text-orange-700 font-semibold transition-colors disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Resend Code'}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <span className="text-blue-600 text-xl">ℹ️</span>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">Code expires in 10 minutes</h4>
              <p className="text-sm text-blue-700">
                Check your spam folder if you don't see the email. Make sure to verify your email before the code expires.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/login')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Login
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            {/* Success Icon */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Registration Successful! 🎉
              </h2>
              
              <p className="text-gray-600 mb-6">
                Your email has been verified successfully. You can now log in to your account and start your culinary journey!
              </p>

              {/* Features Preview */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm font-semibold text-orange-900 mb-3">What you can do now:</p>
                <ul className="space-y-2 text-sm text-orange-800">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-0.5">✓</span>
                    <span>Create and manage your recipes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-0.5">✓</span>
                    <span>Plan your meals for the week</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-0.5">✓</span>
                    <span>Track your grocery lists</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-0.5">✓</span>
                    <span>Share recipes with friends</span>
                  </li>
                </ul>
              </div>

              {/* Login Button */}
              <button
                onClick={() => navigate('/', { state: { openLoginModal: true } })}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Go to Login
              </button>

              <p className="text-sm text-gray-500 mt-4">
                Welcome to KitchenSathi! 🍳
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

