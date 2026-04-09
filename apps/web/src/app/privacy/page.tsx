'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { LanguageToggle } from '@/components/ui/language-toggle';

export default function PrivacyPage() {
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
          {isHe ? 'מדיניות פרטיות' : 'Privacy Policy'}
        </h1>
        <p className="text-sm text-white/40 mb-10">
          {isHe ? 'עדכון אחרון: אפריל 2026' : 'Last updated: April 2026'}
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-white/70">
          {/* What We Collect */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              {isHe ? '1. מידע שאנו אוספים' : '1. What We Collect'}
            </h2>
            <p>
              {isHe
                ? 'אנו אוספים את המידע הבא כאשר אתם משתמשים ב-SendThem:'
                : 'We collect the following information when you use SendThem:'}
            </p>
            <ul className={`list-disc mt-2 space-y-1 ${isHe ? 'pr-5' : 'pl-5'}`}>
              <li>
                {isHe
                  ? 'פרטי חשבון: שם, כתובת אימייל, וסיסמה מוצפנת.'
                  : 'Account details: name, email address, and encrypted password.'}
              </li>
              <li>
                {isHe
                  ? 'נתוני קמפיין: תבניות הודעות, רשימות נמענים (מספרי טלפון ושדות התאמה), וסטטוסי מסירה.'
                  : 'Campaign data: message templates, recipient lists (phone numbers and personalization fields), and delivery statuses.'}
              </li>
              <li>
                {isHe
                  ? 'נתוני תשלום: היסטוריית עסקאות ומזהי Stripe. אנחנו לא מאחסנים פרטי כרטיס אשראי.'
                  : 'Payment data: transaction history and Stripe identifiers. We do not store credit card details.'}
              </li>
              <li>
                {isHe
                  ? 'נתוני שימוש: כתובות IP, סוג דפדפן, וזמני גישה לצורכי אבטחה.'
                  : 'Usage data: IP addresses, browser type, and access times for security purposes.'}
              </li>
            </ul>
          </section>

          {/* How We Use Data */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              {isHe ? '2. כיצד אנו משתמשים במידע' : '2. How We Use Data'}
            </h2>
            <ul className={`list-disc space-y-1 ${isHe ? 'pr-5' : 'pl-5'}`}>
              <li>
                {isHe
                  ? 'לספק את שירות שליחת ההודעות ולנהל את חשבונכם.'
                  : 'To provide the message broadcasting service and manage your account.'}
              </li>
              <li>
                {isHe
                  ? 'לעבד תשלומים ולנהל יתרת קרדיטים.'
                  : 'To process payments and manage credit balances.'}
              </li>
              <li>
                {isHe
                  ? 'לשפר את השירות ולתקן באגים.'
                  : 'To improve the Service and fix bugs.'}
              </li>
              <li>
                {isHe
                  ? 'לתקשר עמכם בנוגע לחשבונכם או לשינויים בשירות.'
                  : 'To communicate with you about your account or Service changes.'}
              </li>
              <li>
                {isHe
                  ? 'לעמוד בדרישות חוקיות ורגולטוריות.'
                  : 'To comply with legal and regulatory requirements.'}
              </li>
            </ul>
          </section>

          {/* Data Storage & Security */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              {isHe ? '3. אחסון מידע ואבטחה' : '3. Data Storage & Security'}
            </h2>
            <p>
              {isHe
                ? 'המידע שלכם מאוחסן בשרתים מאובטחים של Supabase (בענן). אנו משתמשים בהצפנה בזמן העברה (TLS) ובמנוחה. הגישה למסד הנתונים מוגבלת ומבוקרת. סיסמאות מוצפנות באמצעות hashing ולא מאוחסנות בטקסט פתוח.'
                : 'Your data is stored on secure Supabase cloud servers. We use encryption in transit (TLS) and at rest. Database access is restricted and audited. Passwords are hashed and never stored in plain text.'}
            </p>
          </section>

          {/* Third Parties */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              {isHe ? '4. צדדים שלישיים' : '4. Third-Party Services'}
            </h2>
            <p className="mb-2">
              {isHe
                ? 'אנו משתפים מידע עם הספקים הבאים, אך ורק במידה הנדרשת לתפעול השירות:'
                : 'We share data with the following providers, only to the extent necessary to operate the Service:'}
            </p>
            <ul className={`list-disc space-y-1 ${isHe ? 'pr-5' : 'pl-5'}`}>
              <li>
                <span className="text-white font-medium">Supabase</span> —{' '}
                {isHe ? 'אימות משתמשים ומסד נתונים.' : 'User authentication and database.'}
              </li>
              <li>
                <span className="text-white font-medium">Stripe</span> —{' '}
                {isHe ? 'עיבוד תשלומים. Stripe מנהל את פרטי כרטיס האשראי בהתאם ל-PCI DSS.' : 'Payment processing. Stripe handles credit card details under PCI DSS compliance.'}
              </li>
              <li>
                <span className="text-white font-medium">Meta (WhatsApp Cloud API)</span> —{' '}
                {isHe ? 'מסירת הודעות. מספרי טלפון של נמענים נשלחים ל-Meta לצורך שליחת ההודעות.' : 'Message delivery. Recipient phone numbers are sent to Meta for message delivery.'}
              </li>
              <li>
                <span className="text-white font-medium">Resend</span> —{' '}
                {isHe ? 'שליחת הודעות אימייל מערכתיות (אימות חשבון, איפוס סיסמה).' : 'Sending transactional emails (account verification, password reset).'}
              </li>
            </ul>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              {isHe ? '5. שמירת מידע' : '5. Data Retention'}
            </h2>
            <ul className={`list-disc space-y-1 ${isHe ? 'pr-5' : 'pl-5'}`}>
              <li>
                <span className="text-white font-medium">
                  {isHe ? 'קבצי אקסל' : 'Excel files'}
                </span>
                {' — '}
                {isHe
                  ? 'נמחקים אוטומטית תוך 24 שעות מסיום הקמפיין או מהעלאה.'
                  : 'Automatically deleted within 24 hours of campaign completion or upload.'}
              </li>
              <li>
                <span className="text-white font-medium">
                  {isHe ? 'נתוני חשבון' : 'Account data'}
                </span>
                {' — '}
                {isHe
                  ? 'נשמרים כל עוד החשבון פעיל. ניתן לבקש מחיקה בכל עת.'
                  : 'Retained as long as the account is active. You may request deletion at any time.'}
              </li>
              <li>
                <span className="text-white font-medium">
                  {isHe ? 'יומני הודעות' : 'Message logs'}
                </span>
                {' — '}
                {isHe
                  ? 'סטטוסי מסירה נשמרים לצורכי דיווח ונמחקים לאחר 12 חודשים.'
                  : 'Delivery statuses are retained for reporting and deleted after 12 months.'}
              </li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              {isHe ? '6. הזכויות שלכם' : '6. Your Rights'}
            </h2>
            <p>
              {isHe
                ? 'יש לכם את הזכות:'
                : 'You have the right to:'}
            </p>
            <ul className={`list-disc mt-2 space-y-1 ${isHe ? 'pr-5' : 'pl-5'}`}>
              <li>
                {isHe
                  ? 'לבקש עותק של המידע האישי שאנו מחזיקים עליכם.'
                  : 'Request a copy of the personal data we hold about you.'}
              </li>
              <li>
                {isHe
                  ? 'לבקש תיקון מידע שגוי.'
                  : 'Request correction of inaccurate data.'}
              </li>
              <li>
                {isHe
                  ? 'לבקש מחיקת החשבון והמידע שלכם.'
                  : 'Request deletion of your account and data.'}
              </li>
              <li>
                {isHe
                  ? 'לייצא את נתוני הקמפיינים שלכם.'
                  : 'Export your campaign data.'}
              </li>
            </ul>
            <p className="mt-2">
              {isHe
                ? 'לביצוע כל בקשה, פנו אלינו בכתובת '
                : 'To make any request, contact us at '}
              <a
                href="mailto:support@sendthem.org"
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                support@sendthem.org
              </a>
            </p>
          </section>

          {/* Israeli Privacy Law Compliance */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              {isHe ? '7. עמידה בחקיקת פרטיות' : '7. Privacy Law Compliance'}
            </h2>
            <p>
              {isHe
                ? 'SendThem פועל בהתאם לחוק הגנת הפרטיות, התשמ"א-1981, ותקנות הגנת הפרטיות (אבטחת מידע), התשע"ז-2017 של מדינת ישראל. בנוסף, אנו מיישמים עקרונות מקבילים ל-GDPR, כולל מזעור מידע, מגבלות מטרה, ושקיפות בעיבוד. אנו לא מוכרים, סוחרים, או משתפים מידע אישי עם צדדים שלישיים למטרות שיווק.'
                : 'SendThem complies with Israel\'s Protection of Privacy Law, 5741-1981, and the Privacy Protection Regulations (Data Security), 5777-2017. Additionally, we apply GDPR-equivalent principles including data minimization, purpose limitation, and transparency in processing. We do not sell, trade, or share personal data with third parties for marketing purposes.'}
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">
              {isHe ? '8. יצירת קשר' : '8. Contact'}
            </h2>
            <p>
              {isHe
                ? 'לשאלות בנוגע למדיניות פרטיות זו:'
                : 'For questions about this Privacy Policy:'}
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
