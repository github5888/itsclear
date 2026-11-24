import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { api } from '../../services/api';
import { GoogleSignInButton } from './GoogleSignInButton';
import {
  X,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Coins,
  Eye,
  EyeOff,
  ShoppingBag,
  MailCheck,
  CheckCircle2,
  KeyRound,
  Loader2,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalTab,
    pendingCartAction,
    closeAuthModal,
    openAuthModal,
    login,
    loginWithOtp,
    sendLoginOtp,
    loginWithGoogle,
    linkGoogleAccount,
    verifyRegistrationOtp,
    notify
  } = useStore();

  // Tab state: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(authModalTab || 'login');

  // Login view mode: 'otp' (default) | 'password'
  const [loginMode, setLoginMode] = useState<'otp' | 'password'>('otp');

  // Email OTP states
  const [emailInput, setEmailInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(30);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Password login states
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Google OAuth states
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [linkingState, setLinkingState] = useState<{
    required: boolean;
    credential: string;
    email: string;
    name?: string;
  } | null>(null);
  const [linkPassword, setLinkPassword] = useState('');
  const [linkOtp, setLinkOtp] = useState('');
  const [linkMethod, setLinkMethod] = useState<'password' | 'otp'>('password');
  const [isLinking, setIsLinking] = useState(false);

  // Register inputs
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCity, setRegCity] = useState('Lucknow');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regStep, setRegStep] = useState<'form' | 'otp'>('form');
  const [regOtpCode, setRegOtpCode] = useState('');

  // Reset states when modal opens
  useEffect(() => {
    if (authModalTab) {
      setActiveTab(authModalTab);
      setLoginMode('otp');
      setOtpSent(false);
      setOtpCode('');
      setRegStep('form');
      setLinkingState(null);
    }
  }, [authModalTab, isAuthModalOpen]);

  // Resend OTP countdown
  useEffect(() => {
    let timer: any = null;
    if (otpSent && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [otpSent, otpCountdown]);

  if (!isAuthModalOpen) return null;

  // 1. Google OAuth Success Handler
  const handleGoogleSuccess = async (credential: string) => {
    setIsGoogleLoading(true);
    try {
      const res = await loginWithGoogle(credential);
      if (res.requiresLinking && res.email) {
        setLinkingState({
          required: true,
          credential,
          email: res.email,
          name: res.name
        });
        notify('Account Linking Required', 'Please authorize linking your existing account to Google.', 'info');
      }
    } catch (err: any) {
      notify('Google Sign In Error', err.message || 'Could not sign in with Google.', 'error');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // 2. Google Account Linking Confirmation
  const handleConfirmLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkingState) return;

    setIsLinking(true);
    try {
      if (linkMethod === 'password') {
        if (!linkPassword) {
          notify('Password Required', 'Please enter your account password to authorize linking.', 'warning');
          setIsLinking(false);
          return;
        }
        await linkGoogleAccount(linkingState.credential, { password: linkPassword });
      } else {
        if (!linkOtp || linkOtp.length !== 6) {
          notify('OTP Required', 'Please enter the 6-digit verification code.', 'warning');
          setIsLinking(false);
          return;
        }
        await linkGoogleAccount(linkingState.credential, { otp: linkOtp });
      }
      setLinkingState(null);
    } catch (err: any) {
      // Notification handled in context
    } finally {
      setIsLinking(false);
    }
  };

  // 3. Send Email OTP for Login
  const handleSendLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      notify('Invalid Email', 'Please enter a valid email address.', 'warning');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await sendLoginOtp(email);
      setOtpSent(true);
      setOtpCountdown(res.resendAfter || 30);
      if (res.devOtp) {
        setOtpCode(res.devOtp);
      }
    } catch (err) {
      // Error notified in context
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 4. Verify Email OTP for Login
  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      notify('Invalid Code', 'Please enter the 6-digit numeric verification code.', 'warning');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await loginWithOtp(emailInput.trim().toLowerCase(), cleanOtp);
    } catch (err) {
      // Error notified in context
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // 5. Password Login Submit
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = loginEmailOrPhone.trim();
    const pw = loginPassword.trim();
    if (!id || !pw) {
      notify('Missing Fields', 'Please enter your email/phone and password.', 'warning');
      return;
    }

    try {
      await login(id, pw);
    } catch (err) {
      // Error notified in context
    }
  };

  // 6. Registration Flow
  const handleRegisterSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = regName.trim();
    const phone = regPhone.trim();
    const email = regEmail.trim().toLowerCase();
    const password = regPassword.trim();

    if (!name || !phone || !email || !password) {
      notify('Missing Fields', 'All fields are required to register.', 'warning');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await api.sendRegistrationOtp({
        fullName: name,
        mobile: phone,
        email,
        city: regCity,
        password,
        confirmPassword: password
      });
      setRegStep('otp');
      if (res.devOtp) {
        setRegOtpCode(res.devOtp);
      }
      notify('Verification Code Sent', `A 6-digit code was sent to ${email}.`, 'success');
    } catch (err: any) {
      notify('Registration Error', err.message || 'Could not send verification code.', 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleRegisterVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = regOtpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      notify('Invalid Code', 'Please enter all 6 digits.', 'warning');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await verifyRegistrationOtp(regEmail.trim().toLowerCase(), cleanOtp, regCity);
    } catch (err: any) {
      notify('Verification Failed', err.message || 'Invalid or expired OTP.', 'error');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scale-up"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-10 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Banner */}
        <div className="bg-[#0b192c] text-white p-6 sm:p-7 text-center relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-2xl font-black tracking-tight text-white">
              itsclear<span className="text-amber-500">.</span>
            </span>
            <h2 className="text-lg font-bold text-slate-100 mt-1">
              {linkingState
                ? 'Link Google Account'
                : activeTab === 'login'
                ? 'Welcome to itsclear'
                : 'Create Your Account'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              100% Pure Cold-Stoneground Chakki Atta
            </p>
          </div>
        </div>

        {/* Pending Cart Alert */}
        {pendingCartAction && (
          <div className="p-3 bg-amber-50 border-b border-amber-200 flex items-center space-x-2.5 text-xs text-amber-900 px-6">
            <ShoppingBag className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="truncate">
              Sign in to add <strong>{pendingCartAction.product.name} ({pendingCartAction.variant.size})</strong> to basket.
            </span>
          </div>
        )}

        <div className="p-6 sm:p-7">

          {/* ============================================================== */}
          {/* VIEW: SECURE ACCOUNT LINKING SCREEN */}
          {/* ============================================================== */}
          {linkingState && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <p className="font-bold mb-1">Existing Account Detected</p>
                An account registered with <strong>{linkingState.email}</strong> already exists. To authorize linking your Google identity, please verify your credentials.
              </div>

              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-700">
                <button
                  type="button"
                  onClick={() => setLinkMethod('password')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    linkMethod === 'password' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setLinkMethod('otp');
                    try {
                      await sendLoginOtp(linkingState.email);
                    } catch {}
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    linkMethod === 'otp' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                  }`}
                >
                  Email OTP
                </button>
              </div>

              <form onSubmit={handleConfirmLink} className="space-y-3">
                {linkMethod === 'password' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Account Password</label>
                    <input
                      type="password"
                      required
                      value={linkPassword}
                      onChange={(e) => setLinkPassword(e.target.value)}
                      placeholder="Enter your existing account password"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">6-Digit Verification Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={linkOtp}
                      onChange={(e) => setLinkOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      className="w-full text-center tracking-[6px] font-mono font-bold text-lg px-4 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLinking}
                  className="w-full py-3 bg-slate-950 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center space-x-2"
                >
                  {isLinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Authorize &amp; Link Google Account</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setLinkingState(null)}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW: MAIN LOGIN FLOW (Google + Email OTP) */}
          {/* ============================================================== */}
          {!linkingState && activeTab === 'login' && (
            <div className="space-y-5">
              {/* 1. Continue with Google */}
              <div>
                <GoogleSignInButton
                  onSuccess={handleGoogleSuccess}
                  onError={(msg) => notify('Google Sign In', msg, 'warning')}
                  isLoading={isGoogleLoading}
                  text="continue_with"
                />
              </div>

              {/* Minimal Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  OR
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              {/* 2. Email OTP Sign In */}
              {loginMode === 'otp' ? (
                <div>
                  {!otpSent ? (
                    <form onSubmit={handleSendLoginOtp} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="Enter your email address"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
                          />
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSendingOtp || !emailInput}
                        className="w-full py-3 bg-[#fb641b] hover:bg-[#e85a16] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        {isSendingOtp ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Sending Code...</span>
                          </>
                        ) : (
                          <span>Send Email OTP</span>
                        )}
                      </button>

                      <div className="pt-2 text-center">
                        <button
                          type="button"
                          onClick={() => setLoginMode('password')}
                          className="text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors"
                        >
                          Sign in with password instead &rarr;
                        </button>
                      </div>
                    </form>
                  ) : (
                    // OTP Verification Step
                    <form onSubmit={handleVerifyLoginOtp} className="space-y-4">
                      <div className="text-center space-y-1">
                        <div className="inline-flex p-2 rounded-full bg-emerald-50 text-emerald-600 mb-1">
                          <MailCheck className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-900">Enter 6-Digit Code</p>
                        <p className="text-xs text-slate-500">
                          Sent to <strong>{emailInput}</strong>
                        </p>
                      </div>

                      <div>
                        <input
                          type="text"
                          maxLength={6}
                          autoFocus
                          required
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="••••••"
                          className="w-full text-center text-2xl font-mono font-bold tracking-[8px] py-2.5 border-2 border-slate-200 focus:border-amber-500 rounded-xl text-slate-900 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpCode('');
                          }}
                          className="text-slate-500 hover:text-slate-800 font-semibold"
                        >
                          Change Email
                        </button>

                        <button
                          type="button"
                          disabled={otpCountdown > 0}
                          onClick={async () => {
                            try {
                              const res = await sendLoginOtp(emailInput);
                              setOtpCountdown(res.resendAfter || 30);
                              if (res.devOtp) setOtpCode(res.devOtp);
                            } catch {}
                          }}
                          className={`font-semibold ${
                            otpCountdown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-orange-600 hover:underline'
                          }`}
                        >
                          {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend Code'}
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isVerifyingOtp || otpCode.length !== 6}
                        className="w-full py-3 bg-[#fb641b] hover:bg-[#e85a16] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        {isVerifyingOtp ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <span>Verify &amp; Sign In</span>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                // 3. Password Fallback Form
                <form onSubmit={handlePasswordLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email or Mobile Number</label>
                    <input
                      type="text"
                      required
                      value={loginEmailOrPhone}
                      onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                      placeholder="Enter registered email or mobile"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#fb641b] hover:bg-[#e85a16] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all"
                  >
                    Sign In with Password
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setLoginMode('otp')}
                      className="text-xs text-slate-500 hover:text-slate-900 font-semibold"
                    >
                      &larr; Back to Email OTP Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* Bottom Switcher */}
              <div className="pt-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  New to itsclear?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-orange-600 font-bold hover:underline"
                  >
                    Create an account
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW: REGISTER / SIGN UP FLOW */}
          {/* ============================================================== */}
          {!linkingState && activeTab === 'register' && (
            <div className="space-y-4">
              {/* Google 1-Click Sign Up */}
              <div>
                <GoogleSignInButton
                  onSuccess={handleGoogleSuccess}
                  onError={(msg) => notify('Google Sign In', msg, 'warning')}
                  isLoading={isGoogleLoading}
                  text="signup_with"
                />
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  OR REGISTER WITH DETAILS
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              {regStep === 'form' ? (
                <form onSubmit={handleRegisterSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Ramesh Sharma"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Create Password</label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-3.5 pr-9 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* 250 Grain Coins Banner */}
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-2 text-xs text-emerald-900">
                    <Coins className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Get <strong>250 Free Grain Coins (₹250 value)</strong> upon registration!</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full py-3 bg-[#fb641b] hover:bg-[#e85a16] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center space-x-2"
                  >
                    {isSendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Continue &amp; Verify Email</span>}
                  </button>
                </form>
              ) : (
                // Registration OTP Step
                <form onSubmit={handleRegisterVerifyOtp} className="space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-slate-900">Verify Your Email Address</p>
                    <p className="text-xs text-slate-500">
                      Enter the 6-digit OTP sent to <strong>{regEmail}</strong>
                    </p>
                  </div>

                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    required
                    value={regOtpCode}
                    onChange={(e) => setRegOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    className="w-full text-center text-2xl font-mono font-bold tracking-[8px] py-2.5 border-2 border-slate-200 focus:border-amber-500 rounded-xl text-slate-900 focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={isVerifyingOtp || regOtpCode.length !== 6}
                    className="w-full py-3 bg-[#fb641b] hover:bg-[#e85a16] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isVerifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify &amp; Create Account</span>}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setRegStep('form')}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      &larr; Back to details
                    </button>
                  </div>
                </form>
              )}

              <div className="pt-3 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-orange-600 font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
