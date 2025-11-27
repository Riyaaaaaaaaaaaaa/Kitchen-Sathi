import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';

type FormField = {
  value: string;
  error: string | null;
  touched: boolean;
};

type FormState = {
  email: FormField;
  password: FormField;
  name?: FormField; // Optional for login form
};

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [fields, setFields] = useState<FormState>({
    email: { value: '', error: null, touched: false },
    password: { value: '', error: null, touched: false },
  });

  const validateField = (name: keyof FormState, value: string): string | null => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email';
        return null;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return null;
      default:
        return null;
    }
  };

  const updateField = (name: keyof FormState, value: string) => {
    const error = validateField(name, value);
    setFields(prev => ({
      ...prev,
      [name]: { value, error, touched: true }
    }));
  };

  const isFormValid = () => {
    return Object.values(fields).every(field => !field.error && field.value);
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isFormValid()) return;

    setLoading(true);
    setFormError(null);
    try {
      await login(fields.email.value, fields.password.value);
    } catch (err: any) {
      const error = err as ApiError;
      
      // Check if the error is due to unverified email
      if (error.details?.requiresVerification && error.details?.userId) {
        setFormError('Please verify your email first');
        // Redirect to verification page after a short delay
        setTimeout(() => {
          navigate('/verify-email', {
            state: { userId: error.details.userId, email: fields.email.value }
          });
        }, 1500);
      } else {
        setFormError(error.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          className={`mt-1 w-full rounded border p-2 ${
            fields.email.touched && fields.email.error ? 'border-red-500' : 'border-gray-300'
          } focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
          type="email"
          value={fields.email.value}
          onChange={(e) => updateField('email', e.target.value)}
          onBlur={() => updateField('email', fields.email.value)}
          required
        />
        {fields.email.touched && fields.email.error && (
          <p className="mt-1 text-sm text-red-600">{fields.email.error}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <div className="relative">
          <input
            className={`mt-1 w-full rounded border p-2 pr-10 ${
              fields.password.touched && fields.password.error ? 'border-red-500' : 'border-gray-300'
            } focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
            type={showPassword ? 'text' : 'password'}
            value={fields.password.value}
            onChange={(e) => updateField('password', e.target.value)}
            onBlur={() => updateField('password', fields.password.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </button>
        </div>
        {fields.password.touched && fields.password.error && (
          <p className="mt-1 text-sm text-red-600">{fields.password.error}</p>
        )}
      </div>

      {formError && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {formError}
        </div>
      )}

      <button
        disabled={loading || !isFormValid()}
        className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <div className="text-center mt-2">
        <button
          type="button"
          onClick={() => navigate('/forgot-password')}
          className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          Forgot your password?
        </button>
      </div>
    </form>
  );
}

export function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [fields, setFields] = useState<FormState>({
    email: { value: '', error: null, touched: false },
    password: { value: '', error: null, touched: false },
    name: { value: '', error: null, touched: false },
  });

  const validateField = (name: keyof FormState, value: string): string | null => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email';
        return null;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return null;
      case 'name':
        if (!value) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return null;
      default:
        return null;
    }
  };

  const updateField = (name: keyof FormState, value: string) => {
    const error = validateField(name, value);
    setFields(prev => ({
      ...prev,
      [name]: { value, error, touched: true }
    }));
  };

  const isFormValid = () => {
    return Object.values(fields).every(field => !field.error && field.value);
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isFormValid()) return;

    setLoading(true);
    setFormError(null);
    try {
      // Make direct API call instead of using context (since context expects token)
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fields.email.value,
          name: fields.name!.value,
          password: fields.password.value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw { message: data.error || 'Registration failed', details: data };
      }

      // Check if email verification is required
      if (data.requiresVerification && data.user) {
        // Redirect to email verification page
        navigate('/verify-email', {
          state: { userId: data.user.id, email: data.user.email }
        });
      } else {
        // Old flow (if backend doesn't require verification)
        await register(fields.email.value, fields.name!.value, fields.password.value);
      }
    } catch (err: any) {
      const error = err as ApiError;
      setFormError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          className={`mt-1 w-full rounded border p-2 ${
            fields.name?.touched && fields.name?.error ? 'border-red-500' : 'border-gray-300'
          } focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
          type="text"
          value={fields.name?.value || ''}
          onChange={(e) => updateField('name', e.target.value)}
          onBlur={() => updateField('name', fields.name?.value || '')}
          required
        />
        {fields.name?.touched && fields.name?.error && (
          <p className="mt-1 text-sm text-red-600">{fields.name.error}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          className={`mt-1 w-full rounded border p-2 ${
            fields.email.touched && fields.email.error ? 'border-red-500' : 'border-gray-300'
          } focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
          type="email"
          value={fields.email.value}
          onChange={(e) => updateField('email', e.target.value)}
          onBlur={() => updateField('email', fields.email.value)}
          required
        />
        {fields.email.touched && fields.email.error && (
          <p className="mt-1 text-sm text-red-600">{fields.email.error}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <div className="relative">
          <input
            className={`mt-1 w-full rounded border p-2 pr-10 ${
              fields.password.touched && fields.password.error ? 'border-red-500' : 'border-gray-300'
            } focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
            type={showPassword ? 'text' : 'password'}
            value={fields.password.value}
            onChange={(e) => updateField('password', e.target.value)}
            onBlur={() => updateField('password', fields.password.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </button>
        </div>
        {fields.password.touched && fields.password.error && (
          <p className="mt-1 text-sm text-red-600">{fields.password.error}</p>
        )}
      </div>

      {formError && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {formError}
        </div>
      )}

      <button
        disabled={loading || !isFormValid()}
        className="w-full rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50 hover:bg-green-700 focus:ring-2 focus:ring-green-500"
      >
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
