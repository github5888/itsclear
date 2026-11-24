import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { BrandName } from '../common/BrandName';
import { GoogleSignInButton } from '../auth/GoogleSignInButton';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Mail,
  RefreshCw,
  AlertCircle,
  Loader2,
  KeyRound
} from 'lucide-react';

interface AdminLoginGateProps {
  children: React.ReactNode;
  onReturnToHome: () => void;
}

type AuthMode = 'otp' | 'password';

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({ children, onReturnToHome }) => {
  const {
    isAdminAuthenticated,
    loginAdmin,
    loginAdminWithGoogle,
    loginAdminWithOtp,
    sendLoginOtp,
    logoutAdmin,
    updateAdminPassword
  } = useStore();

  const [authMode, setAuthMode] = useState<AuthMode>('otp');
  const [email, setEmail] = useState('admin@itsclear.in');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Password modal
  const [showChangePwModal, setShowChangePwModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Resend Countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleGoogleSuccess = async (credential: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const success = await loginAdminWithGoogle(credential);
      if (!success) {
        setErrorMessage('Access denied. This Google account does not hold administrator authorization.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google administrator authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      const success = await loginAdmin(email.trim().toLowerCase(), password);
      if (!success) {
        setErrorMessage('Invalid administrator credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid administrator email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const res = await sendLoginOtp(cleanEmail);
      setOtpSent(true);
      setCountdown(res?.resendAfter || 60);
      setStatusMessage('Verification code sent to your email.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const digit = val.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance
    if (digit && index < 5) {
      const nextInput = document.getElementById(`admin-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`admin-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit numeric code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const success = await loginAdminWithOtp(email.trim().toLowerCase(), fullOtp);
      if (!success) {
        setErrorMessage('Verification failed. Invalid code or insufficient admin privileges.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdminPassword(newPassword);
    setNewPassword('');
    setShowChangePwModal(false);
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-8 sm:p-10 space-y-6 text-slate-900 relative overflow-hidden">
          {/* Subtle top background glow */}
          <div className="absolute -top-20 -right-20 w-44 h-44 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-black text-slate-800 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
              <span>Restricted Operations Portal</span>
            </div>

            <div className="pt-2">
              <BrandName size="lg" theme="dark" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              Administrator Sign In
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed font-medium">
              Authorized personnel only. Authenticate with Google, secure Email OTP, or master password.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="font-semibold leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Status Alert */}
          {statusMessage && !errorMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium text-center">
              {statusMessage}
            </div>
          )}

          {/* 1. Google Identity Services */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
              Fast Corporate Access
            </label>
            <GoogleSignInButton
              portal="admin"
              onSuccess={handleGoogleSuccess}
              onError={(err) => setErrorMessage(err)}
              disabled={isLoading}
              isLoading={isLoading}
            />
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider shrink-0">
              OR MANUAL ACCESS
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* Tab Selector */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => { setAuthMode('otp'); setErrorMessage(''); }}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                authMode === 'otp' ? 'bg-white text-slate-950 shadow-xs' : 'hover:text-slate-950'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email OTP</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('password'); setErrorMessage(''); }}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                authMode === 'password' ? 'bg-white text-slate-950 shadow-xs' : 'hover:text-slate-950'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Master Password</span>
            </button>
          </div>

          {/* 2. Email OTP Mode */}
          {authMode === 'otp' && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Admin Email ID
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@itsclear.in"
                      disabled={isLoading}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all disabled:opacity-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-slate-950 hover:bg-orange-500 text-white hover:text-slate-950 font-black text-sm transition-all shadow-md flex items-center justify-center space-x-2 active:scale-98 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Administrator OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Code sent to: <strong className="text-slate-900">{email}</strong></span>
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtp(['', '', '', '', '', '']); }}
                      className="text-orange-600 hover:underline font-bold text-[11px]"
                    >
                      Change
                    </button>
                  </div>

                  {/* 6-digit OTP Inputs */}
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`admin-otp-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-12 text-center text-lg font-black bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-mono transition-all"
                        disabled={isLoading}
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.join('').length !== 6}
                    className="w-full py-3.5 rounded-xl bg-slate-950 hover:bg-orange-500 text-white hover:text-slate-950 font-black text-sm transition-all shadow-md flex items-center justify-center space-x-2 active:scale-98 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Unlock Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Resend Link */}
                  <div className="text-center text-xs text-slate-500">
                    {countdown > 0 ? (
                      <span>Resend code in <strong className="text-slate-800">{countdown}s</strong></span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        disabled={isLoading}
                        className="text-orange-600 font-bold hover:underline inline-flex items-center space-x-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Resend OTP Code</span>
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 3. Password Mode */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Admin Email ID
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@itsclear.in"
                  disabled={isLoading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    disabled={isLoading}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-11 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-mono disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-slate-950 hover:bg-orange-500 text-white hover:text-slate-950 font-black text-sm transition-all shadow-md flex items-center justify-center space-x-2 active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Unlock Admin Dashboard</span>
                    <ArrowRight className="w-4 h-4 font-black" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Back to store */}
          <div className="text-center pt-2">
            <button
              onClick={onReturnToHome}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 inline-flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Customer Store</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Admin Status Ribbon */}
      <div className="bg-slate-900 text-white px-4 sm:px-8 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">Authenticated administrator session</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowChangePwModal(true)}
            className="text-slate-300 hover:text-white font-semibold underline text-[11px]"
          >
            Change Admin Password
          </button>
          <button
            onClick={logoutAdmin}
            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] shadow-2xs transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>

      {children}

      {/* Change Password Modal */}
      {showChangePwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-slate-900 border border-slate-200">
            <h3 className="text-base font-black text-slate-950">Change Admin Password</h3>
            <p className="text-xs text-slate-500 font-medium">
              Set a new secure password for this administrator account.
            </p>
            <form onSubmit={handleUpdatePassword} className="space-y-3">
              <input
                type="password"
                required
                minLength={12}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 12 chars)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono"
              />
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePwModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-slate-950 hover:bg-orange-500 text-white hover:text-slate-950 font-bold text-xs"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
