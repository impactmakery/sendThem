'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { validateEmail, validatePassword } from '@repo/shared';
import { useLanguage } from '@/lib/language-context';

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tosAccepted, setTosAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});

  function validate() {
    const errors: Record<string, string | null> = {};
    errors.email = validateEmail(email);
    errors.password = validatePassword(password);
    errors.confirmPassword =
      password !== confirmPassword ? t('passwordsNoMatch') : null;
    errors.tos = !tosAccepted ? t('mustAcceptTos') : null;
    setFieldErrors(errors);
    return !Object.values(errors).some(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowser();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('accountExists');
      } else {
        setError(signUpError.message);
      }
      return;
    }

    router.push(`/checkout?email=${encodeURIComponent(email)}`);
  }

  async function handleGoogleSignup() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  function getErrorDisplay(errorKey: string | null) {
    if (!errorKey) return null;
    if (errorKey === 'accountExists') {
      return (
        <>
          {t('accountExists')}{' '}
          <Link href="/login" className="underline font-medium">
            {t('loginInstead')}
          </Link>
        </>
      );
    }
    return errorKey;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('createAccount')}</h1>
        <p className="text-white/50 mt-1 text-sm">
          {t('createAccountDesc')}
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-lg border border-red-500/20">
          {getErrorDisplay(error)}
        </div>
      )}

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleSignup}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-white/[0.1] rounded-lg bg-white/[0.05] text-sm font-medium text-white hover:bg-white/[0.08] transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {t('signupWithGoogle')}
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/[0.08]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-[#060606] px-3 text-white/50">{t('orContinueWithEmail')}</span>
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white/50 mb-1">
          {t('email')}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg text-sm bg-white/[0.05] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 ${
            fieldErrors.email ? 'border-red-500/40' : 'border-white/[0.1]'
          }`}
          placeholder="you@example.com"
          dir="ltr"
        />
        {fieldErrors.email && (
          <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-white/50 mb-1">
          {t('password')}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg text-sm bg-white/[0.05] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 ${
            fieldErrors.password ? 'border-red-500/40' : 'border-white/[0.1]'
          }`}
          dir="ltr"
        />
        <p className="text-white/50 text-xs mt-1">{t('passwordHint')}</p>
        {fieldErrors.password && (
          <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-white/50 mb-1"
        >
          {t('confirmPassword')}
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg text-sm bg-white/[0.05] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 ${
            fieldErrors.confirmPassword ? 'border-red-500/40' : 'border-white/[0.1]'
          }`}
          dir="ltr"
        />
        {fieldErrors.confirmPassword && (
          <p className="text-red-400 text-xs mt-1">{fieldErrors.confirmPassword}</p>
        )}
      </div>

      {/* Terms */}
      <div className="flex items-start gap-2">
        <input
          id="tos"
          type="checkbox"
          checked={tosAccepted}
          onChange={(e) => setTosAccepted(e.target.checked)}
          className="mt-1 h-4 w-4 rounded accent-emerald-500"
        />
        <label htmlFor="tos" className="text-sm text-white/60">
          {t('agreeToTerms')}{' '}
          <a href="#" className="text-emerald-400 underline hover:text-emerald-300">
            {t('termsOfService')}
          </a>{' '}
          {t('and')}{' '}
          <a href="#" className="text-emerald-400 underline hover:text-emerald-300">
            {t('privacyPolicy')}
          </a>
        </label>
      </div>
      {fieldErrors.tos && (
        <p className="text-red-400 text-xs -mt-3">{fieldErrors.tos}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-[#060606] py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t('creatingAccount') : t('signup')}
      </button>

      <p className="text-center text-sm text-white/50">
        {t('alreadyHaveAccount')}{' '}
        <Link href="/login" className="text-emerald-400 font-medium hover:text-emerald-300">
          {t('login')}
        </Link>
      </p>
    </form>
  );
}
