import React, { useState } from 'react';
import { useAuth } from '../../lib/authContext';
import { X, Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessRedirect: (targetRole: 'admin' | 'student') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccessRedirect }) => {
  const { loginWithGoogle, loginWithEmail, signupWithEmail, error, clearError } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    setLocalError(null);
    clearError();
    try {
      await loginWithGoogle();
      onClose();
      // Check if signed in user is admin
      const adminEmails = ['aki.sokpah.link@gmail.com', 'makealuckspam@gmail.com'];
      // The auth listener will update profile, wait briefly or check email
      onSuccessRedirect('student'); // Auth state listener will route appropriately
    } catch (err: any) {
      setLocalError(err?.message || 'Google sign-in could not be completed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);
    clearError();

    try {
      if (mode === 'signin') {
        await loginWithEmail(email, password);
      } else {
        if (!fullName) {
          setLocalError('Please enter your full name for student records.');
          setIsSubmitting(false);
          return;
        }
        await signupWithEmail(email, password, fullName);
      }
      onClose();
      onSuccessRedirect('student');
    } catch (err: any) {
      setLocalError(err?.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#0a192f] text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block">
              Nova International University
            </span>
            <h2 className="text-lg font-serif font-bold text-white">
              {mode === 'signin' ? 'Academic Portal Sign In' : 'New Learner Registration'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {(error || localError) && (
            <div className="mb-5 p-3 rounded-md bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>{localError || error}</div>
            </div>
          )}

          {/* Primary Authentication Method: Google Sign-In */}
          <div className="mb-5">
            <button
              id="auth-google-btn"
              type="button"
              disabled={isSubmitting}
              onClick={handleGoogleAuth}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg border border-slate-300 shadow-sm flex items-center justify-center gap-3 transition-colors disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-1.5">
              Instant access for NIU students & institutional administrator
            </p>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs text-slate-400 uppercase tracking-wider">
              Or with academic email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Legal Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    id="auth-fullname-input"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                />
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 bg-[#0a192f] hover:bg-slate-800 text-white text-sm font-semibold rounded-md shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                'Processing...'
              ) : mode === 'signin' ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                'Create Student Account'
              )}
            </button>
          </form>

          {/* Mode Switcher */}
          <div className="mt-5 text-center text-xs text-slate-500">
            {mode === 'signin' ? (
              <p>
                First time enrolling?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setLocalError(null); }}
                  className="text-blue-700 hover:text-blue-900 font-semibold underline ml-1"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setLocalError(null); }}
                  className="text-blue-700 hover:text-blue-900 font-semibold underline ml-1"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer Notice */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 text-[11px] text-slate-500 text-center">
          Authorized academic portal for Nova International University.
        </div>
      </div>
    </div>
  );
};
