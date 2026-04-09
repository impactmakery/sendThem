'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { LanguageToggle } from '@/components/ui/language-toggle';

export default function TermsPage() {
  const { locale } = useLanguage();
  const isHe = locale === 'he';

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
      <main className="max-w-4xl mx-auto px-5 py-12">
        <h1 className="text-3xl font-heading font-bold mb-2">
          {isHe ? 'תנאי שימוש' : 'Terms of Service'}
        </h1>
        <p className="text-sm text-white/40 mb-10">
          {isHe ? 'עדכון אחרון: אפריל 2026' : 'Last updated: April 2026'}
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-white/70">
          {/* Introduction */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              {isHe ? '1. מבוא' : '1. Introduction'}
            </h2>
            <p>
              {isHe
                ? 'ברוכים הבאים ל-SendThem ("השירות"), המופעל על ידי ImpactMakery ("החברה", "אנחנו"). על ידי גישה לשירות או שימוש בו, אתם מסכימים לתנאים אלו. אם אינכם מסכימים, אנא הפסיקו להשתמש בשירות.'
                : 'Welcome to SendThem ("the Service"), operated by ImpactMakery ("the Company", "we", "us"). By accessing or using the Service, you agree to these Terms. If you do not agree, please discontinue use of the Service.'}
            </p>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              {isHe ? '2. שימוש מותר' : '2. Acceptable Use'}
            </h2>
            <p>
              {isHe
                ? 'אתם מתחייבים להשתמש בשירות אך ורק למטרות חוקיות. בפרט:'
                : 'You agree to use the Service only for lawful purposes. Specifically:'}
            </p>
            <ul className={`list-disc mt-2 space-y-1 ${isHe ? 'pr-5' : 'pl-5'}`}>
              <li>
                {isHe
                  ? 'לא לשלוח ספאם או הודעות שיווקיות ללא הסכמה מפורשת של הנמענים.'
                  : 'Do not send spam or marketing messages without explicit recipient consent.'}
              </li>
              <li>
                {isHe
                  ? 'לא להשתמש בשירות להפצת תוכן לא חוקי, מטעה או מזיק.'
                  : 'Do not use the Service to distribute illegal, misleading, or harmful content.'}
              </li>
              <li>
                {isHe
                  ? 'לא לנסות לעקוף מגבלות קצב שליחה או אמצעי אבטחה.'
                  : 'Do not attempt to circumvent rate limits or security measures.'}
              </li>
              <li>
                {isHe
                  ? 'לא להשתמש בחשבון של אדם אחר ללא רשות.'
                  : 'Do not use another person\'s account without authorization.'}
              </li>
            </ul>
          </section>

          {/* Credits & Payments */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              {isHe ? '3. קרדיטים ותשלומים' : '3. Credits & Payments'}
            </h2>
            <ul className={`list-disc space-y-1 ${isHe ? 'pr-5' : 'pl-5'}`}>
              <li>
                {isHe
                  ? 'קרדיט אחד = הודעת WhatsApp אחת שנמסרה בהצלחה.'
                  : 'One credit = one successfully delivered WhatsApp message.'}
              </li>
              <li>
                {isHe
                  ? 'קרדיטים אינם פגים ואינם ניתנים להעברה.'
                  : 'Credits do not expire and are non-transferable.'}
              </li>
              <li>
                {isHe
                  ? 'קרדיטים מנוכים רק עבור הודעות שנמסרו בהצלחה, לא עבור ניסיונות שנכשלו.'
                  : 'Credits are deducted only for successfully delivered messages, not for failed attempts.'}
              </li>
              <li>
                {isHe
                  ? 'תשלומים מעובדים באמצעות Stripe. אנחנו לא מאחסנים פרטי כרטיס אשראי.'
                  : 'Payments are processed via Stripe. We do not store credit card details.'}
              </li>
              <li>
                {isHe
                  ? 'החזרים זמינים עבור קרדיטים שלא נוצלו תוך 30 יום מהרכישה.'
                  : 'Refunds are available for unused credits within 30 days of purchase.'}
              </li>
            </ul>
          </section>

          {/* WhatsApp Compliance */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              {isHe ? '4. תאימות ל-WhatsApp' : '4. WhatsApp Compliance'}
            </h2>
            <p>
              {isHe
                ? 'SendThem משתמש ב-API הרשמי של Meta Cloud. המשמעות היא:'
                : 'SendThem uses the official Meta Cloud API. This means:'}
            </p>
            <ul className={`list-disc mt-2 space-y-1 ${isHe ? 'pr-5' : 'pl-5'}`}>
              <li>
                {isHe
                  ? 'כל תבניות ההודעות חייבות לעבור אישור של Meta לפני השליחה.'
                  : 'All message templates must be approved by Meta before sending.'}
              </li>
              <li>
                {isHe
                  ? 'אתם אחראים לוודא שיש לכם הסכמה לשלוח הודעות לכל נמען.'
                  : 'You are responsible for ensuring you have consent to message each recipient.'}
              </li>
              <li>
                {isHe
                  ? 'Meta עשויה לחסום או להגביל את החשבון שלכם בגין הפרת מדיניות WhatsApp Business.'
                  : 'Meta may block or restrict your account for violating WhatsApp Business policies.'}
              </li>
              <li>
                {isHe
                  ? 'אנחנו לא אחראים להגבלות שמוטלות על ידי Meta.'
                  : 'We are not responsible for restrictions imposed by Meta.'}
              </li>
            </ul>
          </section>

          {/* Data Handling */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              {isHe ? '5. טיפול במידע' : '5. Data Handling'}
            </h2>
            <p>
              {isHe
                ? 'קבצי האקסל שלכם מעובדים בצד השרת ונמחקים אוטומטית תוך 24 שעות לאחר השלמת הקמפיין. למידע נוסף, עיינו במדיניות הפרטיות שלנו.'
                : 'Your Excel files are processed server-side and automatically deleted within 24 hours after campaign completion. For more details, see our Privacy Policy.'}
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              {isHe ? '6. הגבלת אחריות' : '6. Limitation of Liability'}
            </h2>
            <p>
              {isHe
                ? 'השירות מסופק "כפי שהוא" (AS IS). ImpactMakery לא תהיה אחראית לנזקים עקיפים, מקריים או תוצאתיים הנובעים משימוש בשירות, כולל אך לא מוגבל לעיכובים במסירת הודעות, כשלי API של Meta, או תקלות טכניות. האחריות הכוללת שלנו מוגבלת לסכום ששולם על ידכם ב-12 החודשים האחרונים.'
                : 'The Service is provided "AS IS". ImpactMakery shall not be liable for indirect, incidental, or consequential damages arising from use of the Service, including but not limited to message delivery delays, Meta API failures, or technical outages. Our total liability is limited to the amount you paid in the preceding 12 months.'}
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              {isHe ? '7. שינויים בתנאים' : '7. Changes to Terms'}
            </h2>
            <p>
              {isHe
                ? 'אנו שומרים לעצמנו את הזכות לעדכן תנאים אלו. שינויים מהותיים יפורסמו באימייל או בהודעה באתר לפחות 14 יום לפני כניסתם לתוקף. המשך השימוש בשירות לאחר השינויים מהווה הסכמה לתנאים המעודכנים.'
                : 'We reserve the right to update these Terms. Material changes will be communicated via email or site notice at least 14 days before taking effect. Continued use of the Service after changes constitutes acceptance of the updated Terms.'}
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              {isHe ? '8. יצירת קשר' : '8. Contact'}
            </h2>
            <p>
              {isHe
                ? 'לשאלות בנוגע לתנאים אלו, פנו אלינו:'
                : 'For questions about these Terms, contact us:'}
            </p>
            <p className="mt-2">
              {isHe ? 'אימייל: ' : 'Email: '}
              <a
                href="mailto:support@sendthem.org"
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                support@sendthem.org
              </a>
            </p>
            <p className="mt-1">
              {isHe ? 'חברה: ImpactMakery' : 'Company: ImpactMakery'}
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10 px-5">
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
