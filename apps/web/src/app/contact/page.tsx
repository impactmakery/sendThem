'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { LanguageToggle } from '@/components/ui/language-toggle';

export default function ContactPage() {
  const { locale } = useLanguage();
  const isHe = locale === 'he';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setStatus('sending');

    // Simulate sending — in production this would POST to an API route
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#060606] text-white" dir={isHe ? 'rtl' : 'ltr'}>
      {/* Navbar */}
      <nav className="border-b border-white/[0.06] px-5 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-heading font-bold text-xs">
              S
            </div>
            <span className="font-heading font-semibold text-sm">SendThem</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-white/50 hover:text-white transition-colors"
            >
              {isHe ? 'חזרה לדף הבית' : 'Back to Home'}
            </Link>
            <LanguageToggle />
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-5 py-12">
        <h1 className="text-3xl font-heading font-bold mb-2">
          {isHe ? 'צרו קשר' : 'Contact Us'}
        </h1>
        <p className="text-sm text-white/50 mb-10">
          {isHe
            ? 'יש לכם שאלות? נשמח לעזור.'
            : 'Have questions? We\'d love to help.'}
        </p>

        {/* Contact Info */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 mb-8">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-white/40 text-xs mb-0.5">{isHe ? 'אימייל' : 'Email'}</p>
                <a
                  href="mailto:support@sendthem.org"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  support@sendthem.org
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div>
                <p className="text-white/40 text-xs mb-0.5">{isHe ? 'חברה' : 'Company'}</p>
                <p className="text-white/70">ImpactMakery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        {status === 'sent' ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">
              {isHe ? 'ההודעה נשלחה!' : 'Message Sent!'}
            </h2>
            <p className="text-sm text-white/50">
              {isHe
                ? 'תודה שפניתם אלינו. נחזור אליכם בהקדם.'
                : 'Thank you for reaching out. We\'ll get back to you soon.'}
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-4 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              {isHe ? 'שליחת הודעה נוספת' : 'Send another message'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs text-white/50 mb-1.5">
                {isHe ? 'שם' : 'Name'}
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-colors"
                placeholder={isHe ? 'השם שלכם' : 'Your name'}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs text-white/50 mb-1.5">
                {isHe ? 'אימייל' : 'Email'}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-colors"
                placeholder={isHe ? 'your@email.com' : 'your@email.com'}
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-xs text-white/50 mb-1.5">
                {isHe ? 'הודעה' : 'Message'}
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-colors resize-none"
                placeholder={isHe ? 'איך נוכל לעזור?' : 'How can we help?'}
              />
            </div>

            {status === 'error' && (
              <p className="text-xs text-red-400">
                {isHe
                  ? 'שגיאה בשליחת ההודעה. נסו שוב.'
                  : 'Error sending message. Please try again.'}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              {status === 'sending'
                ? (isHe ? 'שולח...' : 'Sending...')
                : (isHe ? 'שליחה' : 'Send Message')}
            </button>
          </form>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10 px-5 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-heading font-bold text-xs">
              S
            </div>
            <span className="font-heading font-semibold text-sm">SendThem</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">
              {isHe ? 'מדיניות פרטיות' : 'Privacy Policy'}
            </Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">
              {isHe ? 'תנאי שימוש' : 'Terms of Service'}
            </Link>
            <span>&copy; {new Date().getFullYear()} SendThem. {isHe ? 'כל הזכויות שמורות' : 'All rights reserved'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
