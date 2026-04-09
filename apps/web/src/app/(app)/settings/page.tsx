'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { apiClient } from '@/lib/api-client';
import { validatePassword } from '@repo/shared';
import { useLanguage } from '@/lib/language-context';

export default function SettingsPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    apiClient<{ email: string; creditBalance: number }>('/me')
      .then((data) => {
        setEmail(data.email);
        setCreditBalance(data.creditBalance);
      })
      .catch(() => {});
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    const pwError = validatePassword(newPassword);
    if (pwError) { setPasswordError(pwError); return; }
    if (newPassword !== confirmPassword) { setPasswordError(t('passwordsNoMatch')); return; }

    setPasswordLoading(true);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);

    if (error) {
      setPasswordError(error.message);
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-8">{t('accountSettingsTitle')}</h1>

      {/* Account info */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Account information</h2>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/50">{t('emailAddress')}</span>
            <div>
              <span className="text-sm font-medium text-white" dir="ltr">{email}</span>
              <p className="text-xs text-white/50 mt-0.5">To change email, please contact support</p>
            </div>
          </div>
          <div className="flex justify-between items-center border-t border-white/[0.06] pt-4">
            <span className="text-sm text-white/50">{t('creditBalance')}</span>
            <span className="text-sm font-medium text-white">{creditBalance !== null ? `${creditBalance.toLocaleString()} ${t('credits')}` : '...'}</span>
          </div>
        </div>
      </section>

      {/* Change password */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">{t('changePassword')}</h2>
        <form onSubmit={handleChangePassword} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          {passwordError && (
            <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-lg border border-red-500/20">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="bg-emerald-500/10 text-emerald-400 text-sm px-4 py-3 rounded-lg border border-emerald-500/20">
              {t('passwordUpdated')}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/50 mb-1">{t('currentPassword')}</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/50 mb-1">{t('newPassword')}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40"
              dir="ltr"
            />
            <p className="text-xs text-white/50 mt-1">{t('passwordHint')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/50 mb-1">{t('confirmNewPassword')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40"
              dir="ltr"
            />
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="bg-white text-[#060606] px-5 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {passwordLoading ? t('updating') : t('updatePassword')}
          </button>
        </form>
      </section>

      {/* Danger zone */}
      <section>
        <h2 className="text-lg font-semibold text-red-400 mb-4">Danger zone</h2>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <h3 className="font-medium text-white">Delete account</h3>
          <p className="text-sm text-white/70 mt-1">
            Permanently delete your account, all your campaigns, and any remaining credits. This action cannot be undone.
          </p>
          <button className="mt-3 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500/10 transition-colors">
            Delete my account
          </button>
        </div>
      </section>
    </div>
  );
}
