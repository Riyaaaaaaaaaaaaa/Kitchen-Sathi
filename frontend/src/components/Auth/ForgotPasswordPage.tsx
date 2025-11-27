import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      showToast('Please enter your email', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset code');
      }

      setEmailSent(true);
      showToast('Reset code sent! Check your email 📧', 'success');
      
      // Navigate to reset password page after a short delay
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 2000);
    } catch (err: any) {
      showToast(err.message || 'Failed to send reset code', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl mb-4 shadow-lg">
            <span className="text-4xl">🔑</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-gray-600">
            No worries! Enter your email and we'll send you a reset code.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:outline-none transition-all"
                disabled={loading || emailSent}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || emailSent}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : emailSent ? (
                'Code Sent! ✓'
              ) : (
                'Send Reset Code'
              )}
            </button>
          </form>
        </div>

        {/* Info Box */}
        {emailSent && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
            <div className="flex gap-3">
              <span className="text-green-600 text-xl">✓</span>
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 mb-1">Check your email</h4>
                <p className="text-sm text-green-700">
                  We've sent a 6-digit reset code to your email. You'll be redirected to enter it shortly.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <span className="text-blue-600 text-xl">ℹ️</span>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">Security Note</h4>
              <p className="text-sm text-blue-700">
                For your security, the reset code will expire in 10 minutes. Check your spam folder if you don't see the email.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

