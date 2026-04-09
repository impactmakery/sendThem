import type { Locale } from './i18n';

const copy = {
  // Navbar
  howItWorks: { he: 'איך זה עובד', en: 'How it works' },
  features: { he: 'תכונות', en: 'Features' },
  pricing: { he: 'תמחור', en: 'Pricing' },
  faq: { he: 'שאלות נפוצות', en: 'FAQ' },
  login: { he: 'התחברות', en: 'Log in' },
  getStarted: { he: 'התחל עכשיו', en: 'Get started' },

  // Hero
  heroBadge: { he: 'API רשמי של Meta Cloud', en: 'Official Meta Cloud API' },
  heroTitle1: { he: 'שליחת הודעות WhatsApp', en: 'WhatsApp broadcasts' },
  heroTitle2: { he: 'בקלות מוחלטת', en: 'made simple' },
  heroDesc: {
    he: 'העלו את רשימת האקסל שלכם, כתבו תבנית מותאמת אישית, והגיעו לאלפים בוואטסאפ — הכל דרך ה-API הרשמי של Meta. בלי סיכון למספר האישי שלכם.',
    en: "Upload your Excel list, compose a personalized template, and reach thousands on WhatsApp — all through Meta's official API. No risk to your personal number.",
  },
  heroCta: { he: 'התחילו לשלוח עכשיו', en: 'Start sending now' },
  heroSecondary: { he: 'ראו איך זה עובד', en: 'See how it works' },
  heroSmall: { he: 'ללא מנוי — משלמים רק על מה ששולחים', en: 'No subscription required — pay only for what you send' },

  // Stats
  statDelivery: { he: 'אחוז הגעה', en: 'Delivery rate' },
  statPrice: { he: 'לכל הודעה', en: 'Per message' },
  statSetup: { he: 'זמן הקמה', en: 'Setup time' },
  statCompliant: { he: 'תואם Meta', en: 'Meta compliant' },

  // How it works
  howItWorksLabel: { he: 'איך זה עובד', en: 'How it works' },
  howItWorksTitle: { he: 'שלושה צעדים לקמפיין הראשון שלכם', en: 'Three steps to your first campaign' },
  step1Title: { he: 'העלו את הרשימה', en: 'Upload your list' },
  step1Desc: {
    he: 'גררו את קובץ האקסל עם מספרי הטלפון. אנחנו מזהים אוטומטית מספרים ישראליים ומאמתים כל איש קשר לפני השליחה.',
    en: 'Drop in your Excel file with phone numbers. We auto-detect Israeli numbers and validate every contact before sending.',
  },
  step2Title: { he: 'כתבו ואשרו', en: 'Compose & approve' },
  step2Desc: {
    he: 'כתבו תבנית הודעה עם משתנים מותאמים אישית. אנחנו מגישים ל-Meta לאישור — בדרך כלל תוך דקות.',
    en: 'Write your message template with personalization variables. We submit it to Meta for approval — usually takes minutes.',
  },
  step3Title: { he: 'שלחו ועקבו', en: 'Send & track' },
  step3Desc: {
    he: 'לחצו שלח וצפו במשלוח בזמן אמת. עקבו אחרי כל הודעה — נשלחה, נמסרה, נקראה — עם עדכוני התקדמות חיים.',
    en: 'Hit send and watch delivery in real-time. Track every message — sent, delivered, read — with live progress updates.',
  },

  // Features
  featuresLabel: { he: 'תכונות', en: 'Features' },
  featuresTitle: { he: 'כל מה שצריך לשליחה המונית', en: 'Everything you need to broadcast' },
  feat1Title: { he: 'API רשמי של Meta', en: 'Official Meta API' },
  feat1Desc: {
    he: 'ללא פתרונות אפורים. המספר העסקי שלכם מאומת ומוגן על ידי התשתית של Meta.',
    en: "No grey-market workarounds. Your business number is verified and protected by Meta's infrastructure.",
  },
  feat2Title: { he: 'זיהוי מספרים ישראליים', en: 'Israeli number detection' },
  feat2Desc: {
    he: 'ממיר אוטומטית מספרי 05X לפורמט בינלאומי 972+. ללא עיצוב ידני.',
    en: 'Automatically normalizes 05X numbers to +972 international format. No manual reformatting needed.',
  },
  feat3Title: { he: 'מעקב בזמן אמת', en: 'Real-time tracking' },
  feat3Desc: {
    he: 'צפו בקמפיין שלכם מתפתח בשידור חי. עקבו אחרי סטטוס כל הודעה.',
    en: 'Watch your campaign unfold live. Track sent, delivered, and read status for every single message.',
  },
  feat4Title: { he: 'עבודה מבוססת אקסל', en: 'Excel-first workflow' },
  feat4Desc: {
    he: 'עבדו כמו שאתם רגילים. העלו אקסל, מפו עמודות למשתנים, ושלחו הודעות מותאמות בקנה מידה.',
    en: 'Work the way you already do. Upload Excel, map columns to variables, and send personalized messages at scale.',
  },

  // Pricing
  pricingLabel: { he: 'תמחור', en: 'Pricing' },
  pricingTitle: { he: 'תמחור פשוט ושקוף', en: 'Simple, transparent pricing' },
  pricingDesc: { he: 'ללא מנויים. ללא עמלות נסתרות. קנו קרדיטים והשתמשו מתי שרוצים.', en: 'No subscriptions. No hidden fees. Buy credits and use them whenever you want.' },
  pricingUnit: { he: '/הודעה', en: '/message' },
  pricingCredit: { he: 'קרדיט אחד = הודעת WhatsApp אחת שנמסרה', en: '1 credit = 1 WhatsApp message delivered' },
  pricingItem1: { he: 'ללא מנוי חודשי', en: 'No monthly subscription' },
  pricingItem2: { he: 'קרדיטים ללא תפוגה', en: 'Credits never expire' },
  pricingItem3: { he: 'חיוב לפי מסירה, לא לפי ניסיון', en: 'Charged per delivery, not per attempt' },
  pricingItem4: { he: 'הנחות כמות', en: 'Volume discounts available' },
  pricingItem5: { he: 'תשלום מאובטח ב-Stripe', en: 'Secure Stripe checkout' },
  pricingItem6: { he: 'דוחות מפורטים לכל הודעה', en: 'Detailed per-message reporting' },
  pricingCta: { he: 'התחילו בחינם', en: 'Get started free' },
  pricingFree: { he: '50 קרדיטים חינם בהרשמה', en: '50 free credits on signup' },

  // FAQ
  faqLabel: { he: 'שאלות נפוצות', en: 'FAQ' },
  faqTitle: { he: 'שאלות נפוצות', en: 'Common questions' },
  faq1Q: { he: 'האם זה ה-API הרשמי של WhatsApp?', en: 'Is this the official WhatsApp API?' },
  faq1A: {
    he: 'כן. SendThem משתמש ב-Cloud API הרשמי של Meta — אותה תשתית שמשמשת חברות ארגוניות ברחבי העולם. המספר העסקי שלכם בטוח ועומד בתקנות.',
    en: "Yes. SendThem uses Meta's official Cloud API — the same infrastructure trusted by enterprise companies worldwide. Your business number stays safe and compliant.",
  },
  faq2Q: { he: 'האם צריך מנוי?', en: 'Do I need a subscription?' },
  faq2A: {
    he: 'ללא מנויים, ללא תשלום חודשי. קנו חבילות קרדיטים והשתמשו מתי שתרצו. הקרדיטים לא פגים.',
    en: 'No subscriptions, no monthly fees. You buy credit packs and use them whenever you want. Credits never expire.',
  },
  faq3Q: { he: 'אילו פורמטים של קבצים נתמכים?', en: 'What file formats are supported for recipient lists?' },
  faq3A: {
    he: 'אנחנו תומכים בקבצי אקסל (xlsx, xls). פשוט העלו את הגיליון עם מספרי טלפון ושדות התאמה — אנחנו מטפלים בשאר.',
    en: 'We support Excel files (.xlsx, .xls). Simply upload your spreadsheet with phone numbers and any personalization fields — we handle the rest.',
  },
  faq4Q: { he: 'איך עובד אישור ההודעות?', en: 'How does message approval work?' },
  faq4A: {
    he: "WhatsApp דורש אישור תבנית להודעות שידור. אתם כותבים את התבנית בעורך שלנו, אנחנו מגישים ל-Meta, ומודיעים לכם ברגע שמאושר — בדרך כלל תוך דקות.",
    en: "WhatsApp requires template approval for broadcast messages. You compose your template in our editor, we submit it to Meta, and you're notified as soon as it's approved — usually within minutes.",
  },
  faq5Q: { he: 'אפשר להתאים הודעות אישית?', en: 'Can I personalize messages?' },
  faq5A: {
    he: 'בהחלט. השתמשו במשתנים כמו {{שם}} או {{חברה}} בתבניות שלכם, ממופים ישירות מעמודות בקובץ האקסל. כל נמען מקבל הודעה מותאמת אישית.',
    en: 'Absolutely. Use variables like {{name}} or {{company}} in your templates, mapped directly from columns in your Excel file. Every recipient gets a personalized message.',
  },
  faq6Q: { he: 'מה קורה עם המידע שלי?', en: 'What happens to my data?' },
  faq6A: {
    he: 'קבצי האקסל מעובדים בצד השרת ונמחקים אוטומטית אחרי 24 שעות. אנחנו אף פעם לא משתפים או מוכרים את המידע שלכם. תקני פרטיות ישראליים הם קו הבסיס שלנו.',
    en: 'Your Excel files are processed server-side and automatically deleted after 24 hours. We never share or sell your data. Israeli privacy standards are our baseline.',
  },

  // Final CTA
  ctaTitle: { he: 'מוכנים להגיע לקהל שלכם?', en: 'Ready to reach your audience?' },
  ctaDesc: {
    he: 'צרו חשבון תוך 30 שניות ושלחו את קמפיין הוואטסאפ הראשון שלכם היום. 50 קרדיטים חינם בהרשמה.',
    en: 'Create your account in 30 seconds and send your first WhatsApp campaign today. 50 free credits included.',
  },
  ctaButton: { he: 'התחילו בחינם', en: 'Start for free' },

  // Footer
  allRightsReserved: { he: 'כל הזכויות שמורות', en: 'All rights reserved' },
  privacyPolicy: { he: 'מדיניות פרטיות', en: 'Privacy Policy' },
  termsOfService: { he: 'תנאי שימוש', en: 'Terms of Service' },
} as const;

export type LandingKey = keyof typeof copy;

export function lt(key: LandingKey, locale: Locale): string {
  return copy[key][locale];
}

export function getLandingFaqs(locale: Locale) {
  return [
    { q: copy.faq1Q[locale], a: copy.faq1A[locale] },
    { q: copy.faq2Q[locale], a: copy.faq2A[locale] },
    { q: copy.faq3Q[locale], a: copy.faq3A[locale] },
    { q: copy.faq4Q[locale], a: copy.faq4A[locale] },
    { q: copy.faq5Q[locale], a: copy.faq5A[locale] },
    { q: copy.faq6Q[locale], a: copy.faq6A[locale] },
  ];
}
