'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { trackStep } from '@/lib/tracking';

/* ───────────────── Scroll-reveal hook ───────────────── */

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, visible };
}

/* ───────────────── Three.js hero background ───────────────── */

function HeroCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    let destroyed = false;

    import('three').then((THREE) => {
      if (destroyed || !container) return;

      const SEPARATION = 150;
      const AMOUNTX = 40;
      const AMOUNTY = 60;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        60, container.clientWidth / container.clientHeight, 1, 10000,
      );
      camera.position.set(0, 355, 1220);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      const positions: number[] = [];
      const colors: number[] = [];
      const geometry = new THREE.BufferGeometry();

      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          positions.push(
            ix * SEPARATION - (AMOUNTX * SEPARATION) / 2,
            0,
            iy * SEPARATION - (AMOUNTY * SEPARATION) / 2,
          );
          colors.push(0.3, 0.85, 0.65);
        }
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 8, vertexColors: true, transparent: true, opacity: 0.7, sizeAttenuation: true,
      });
      scene.add(new THREE.Points(geometry, material));

      let count = 0;
      let animId = 0;
      let scrollY = 0;

      const onScroll = () => { scrollY = window.scrollY; };
      window.addEventListener('scroll', onScroll, { passive: true });

      const animate = () => {
        if (destroyed) return;
        animId = requestAnimationFrame(animate);

        const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
        const sf = Math.min(scrollY / maxScroll, 1);

        camera.position.y = 355 + sf * 500;
        camera.position.z = 1220 - sf * 800;
        camera.lookAt(0, 0, 0);

        const amp = 50 + sf * 40;
        const posArr = geometry.attributes.position.array as Float32Array;
        let i = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
          for (let iy = 0; iy < AMOUNTY; iy++) {
            posArr[i * 3 + 1] =
              Math.sin((ix + count) * 0.3) * amp +
              Math.sin((iy + count) * 0.5) * amp;
            i++;
          }
        }
        geometry.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
        count += 0.07;
      };

      const onResize = () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener('resize', onResize);
      animate();

      const cleanup = () => {
        destroyed = true;
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(animId);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
      (container as any).__cleanup = cleanup;
    });

    return () => {
      destroyed = true;
      if ((container as any).__cleanup) (container as any).__cleanup();
    };
  }, []);

  return <div ref={canvasRef} className="absolute inset-0" />;
}

/* ───────────────── icons (inline SVG) ───────────────── */

function IconUpload() {
  return (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

/* ───────────────── Animate-in wrapper ───────────────── */

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ───────────────── FAQ data (Hebrew) ───────────────── */

const faqs = [
  {
    q: 'האם זה ה-API הרשמי של WhatsApp?',
    a: 'כן. SendThem משתמש ב-Cloud API הרשמי של Meta — אותה תשתית שמשמשת חברות ארגוניות ברחבי העולם. המספר העסקי שלכם בטוח ועומד בתקנות.',
  },
  {
    q: 'האם צריך מנוי?',
    a: 'ללא מנויים, ללא תשלום חודשי. קנו חבילות קרדיטים והשתמשו מתי שתרצו. הקרדיטים לא פגים.',
  },
  {
    q: 'אילו פורמטים של קבצים נתמכים?',
    a: 'אנחנו תומכים בקבצי אקסל (xlsx, xls). פשוט העלו את הגיליון עם מספרי טלפון ושדות התאמה — אנחנו מטפלים בשאר.',
  },
  {
    q: 'איך עובד אישור ההודעות?',
    a: 'WhatsApp דורש אישור תבנית להודעות שידור. אתם כותבים את התבנית בעורך שלנו, אנחנו מגישים ל-Meta, ומודיעים לכם ברגע שמאושר — בדרך כלל תוך דקות.',
  },
  {
    q: 'אפשר להתאים הודעות אישית?',
    a: 'בהחלט. השתמשו במשתנים כמו {{שם}} או {{חברה}} בתבניות שלכם, ממופים ישירות מעמודות בקובץ האקסל. כל נמען מקבל הודעה מותאמת אישית.',
  },
  {
    q: 'מה קורה עם המידע שלי?',
    a: 'קבצי האקסל מעובדים בצד השרת ונמחקים אוטומטית אחרי 24 שעות. אנחנו אף פעם לא משתפים או מוכרים את המידע שלכם. תקני פרטיות ישראליים הם קו הבסיס שלנו.',
  },
];

/* ───────────────── FAQ item ───────────────── */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-right group"
      >
        <span className={`text-white/40 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-45' : ''}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </span>
        <span className="text-base font-medium text-white group-hover:text-emerald-400 transition-colors pl-4">
          {q}
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 pb-5' : 'max-h-0'}`}>
        <p className="text-white/60 text-sm leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* ───────────────── page ───────────────── */

export default function LandingPageHe() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tracked50 = useRef(false);

  useEffect(() => {
    trackStep('page_view');

    const handleScroll = () => {
      if (tracked50.current) return;
      const scrollPct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrollPct > 0.5) {
        trackStep('scroll_50');
        tracked50.current = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleCtaClick() {
    trackStep('cta_click');
  }

  return (
    <div dir="rtl" className="bg-[#060606] text-white min-h-screen font-sans selection:bg-emerald-500/30">

      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#060606]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/he" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-heading font-bold text-sm">S</div>
            <span className="font-heading font-bold text-lg tracking-tight">SendThem</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">איך זה עובד</a>
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">תכונות</a>
            <a href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">תמחור</a>
            <a href="#faq" className="text-sm text-white/60 hover:text-white transition-colors">שאלות נפוצות</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="/" className="text-xs text-white/40 hover:text-white/60">EN</a>
            <Link href="/login" className="text-sm text-white/70 hover:text-white px-4 py-2 transition-colors">התחברות</Link>
            <Link href="/signup" onClick={handleCtaClick} className="text-sm font-medium bg-white text-[#060606] px-5 py-2 rounded-full hover:bg-white/90 transition-colors">התחל עכשיו</Link>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-white/60">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.06] bg-[#060606]/95 backdrop-blur-xl px-5 pb-5 pt-3 space-y-3">
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-white/60 py-2">איך זה עובד</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-white/60 py-2">תכונות</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-white/60 py-2">תמחור</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-white/60 py-2">שאלות נפוצות</a>
            <div className="pt-2 flex flex-col gap-2">
              <a href="/" className="text-xs text-center text-white/40 hover:text-white/60 py-1">EN</a>
              <Link href="/login" className="text-sm text-center text-white/70 border border-white/20 px-4 py-2.5 rounded-full">התחברות</Link>
              <Link href="/signup" onClick={handleCtaClick} className="text-sm text-center font-medium bg-white text-[#060606] px-4 py-2.5 rounded-full">התחל עכשיו</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ─── Hero with Three.js background ─── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-5 overflow-hidden min-h-[90vh] flex items-center">
        <HeroCanvas />

        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/[0.07] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-teal-600/[0.05] rounded-full blur-[80px] pointer-events-none" />

        <Reveal className="max-w-4xl mx-auto text-center relative z-10 w-full">
          <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/60 font-medium tracking-wide uppercase">API רשמי של Meta Cloud</span>
          </div>

          <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.1] mb-6">
            שליחת הודעות WhatsApp
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              בקלות מוחלטת
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            העלו את רשימת האקסל שלכם, כתבו תבנית מותאמת אישית, והגיעו לאלפים בוואטסאפ —
            הכל דרך ה-API הרשמי של Meta. בלי סיכון למספר האישי שלכם.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              onClick={handleCtaClick}
              className="group relative inline-flex items-center gap-2.5 bg-white text-[#060606] font-medium px-7 py-3.5 rounded-full text-sm hover:bg-white/90 transition-all shadow-[0_0_32px_rgba(16,185,129,0.15)]"
            >
              התחילו לשלוח עכשיו
              <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <a href="#how-it-works" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 px-5 py-3.5 transition-colors">
              ראו איך זה עובד
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
            </a>
          </div>

          <p className="text-xs text-white/30 mt-6">ללא מנוי — משלמים רק על מה ששולחים</p>
        </Reveal>
      </section>

      {/* ─── Stats bar ─── */}
      <Reveal>
        <section className="border-y border-white/[0.06] py-10 px-5">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-heading font-bold text-white">99.2%</div>
                <div className="text-sm text-white/40 mt-1">אחוז הגעה</div>
              </div>
              <div>
                <div className="text-3xl font-heading font-bold text-white">$0.10</div>
                <div className="text-sm text-white/40 mt-1">לכל הודעה</div>
              </div>
              <div>
                <div className="text-3xl font-heading font-bold text-white">&lt;5 min</div>
                <div className="text-sm text-white/40 mt-1">זמן הקמה</div>
              </div>
              <div>
                <div className="text-3xl font-heading font-bold text-white">100%</div>
                <div className="text-sm text-white/40 mt-1">תואם Meta</div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ─── How it works ─── */}
      <section id="how-it-works" className="py-20 md:py-28 px-5">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-xs font-medium tracking-widest uppercase text-emerald-400 mb-3">איך זה עובד</p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight">שלושה צעדים לקמפיין הראשון שלכם</h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <IconUpload />, num: '1', title: 'העלו את הרשימה', desc: 'גררו את קובץ האקסל עם מספרי הטלפון. אנחנו מזהים אוטומטית מספרים ישראליים ומאמתים כל איש קשר לפני השליחה.' },
              { icon: <IconEdit />, num: '2', title: 'כתבו ואשרו', desc: 'כתבו תבנית הודעה עם משתנים מותאמים אישית. אנחנו מגישים ל-Meta לאישור — בדרך כלל תוך דקות.' },
              { icon: <IconSend />, num: '3', title: 'שלחו ועקבו', desc: 'לחצו שלח וצפו במשלוח בזמן אמת. עקבו אחרי כל הודעה — נשלחה, נמסרה, נקראה — עם עדכוני התקדמות חיים.' },
            ].map((step, i) => (
              <Reveal key={step.num} delay={i * 120}>
                <div className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 hover:border-emerald-500/20 transition-all duration-300 h-full">
                  <div className="absolute top-6 left-6 text-[64px] font-heading font-bold text-white/[0.03] leading-none select-none">{step.num}</div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-5">{step.icon}</div>
                  <h3 className="font-heading font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-20 md:py-28 px-5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-xs font-medium tracking-widest uppercase text-emerald-400 mb-3">תכונות</p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight">כל מה שצריך לשליחה המונית</h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { icon: <IconShield />, title: 'API רשמי של Meta', desc: 'ללא פתרונות אפורים. המספר העסקי שלכם מאומת ומוגן על ידי התשתית של Meta.' },
              { icon: <IconBolt />, title: 'זיהוי מספרים ישראליים', desc: 'ממיר אוטומטית מספרי 05X לפורמט בינלאומי 972+. ללא עיצוב ידני.' },
              { icon: <IconChart />, title: 'מעקב בזמן אמת', desc: 'צפו בקמפיין שלכם מתפתח בשידור חי. עקבו אחרי סטטוס כל הודעה.' },
              { icon: <IconGlobe />, title: 'עבודה מבוססת אקסל', desc: 'עבדו כמו שאתם רגילים. העלו אקסל, מפו עמודות למשתנים, ושלחו הודעות מותאמות בקנה מידה.' },
            ].map((feat, i) => (
              <Reveal key={feat.title} delay={i * 100}>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 flex gap-4 h-full">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">{feat.icon}</div>
                  <div>
                    <h3 className="font-semibold mb-1.5">{feat.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-20 md:py-28 px-5">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-xs font-medium tracking-widest uppercase text-emerald-400 mb-3">תמחור</p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight">תמחור פשוט ושקוף</h2>
            <p className="text-white/50 mt-4 text-base">ללא מנויים. ללא עמלות נסתרות. קנו קרדיטים והשתמשו מתי שרוצים.</p>
          </Reveal>

          <Reveal delay={100}>
            <div className="relative bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] rounded-3xl p-8 md:p-10 overflow-hidden">
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-emerald-500/[0.08] rounded-full blur-[60px] pointer-events-none" />
              <div className="relative z-10 text-center">
                <div className="flex items-baseline justify-center gap-1 mb-2" dir="ltr">
                  <span className="text-6xl md:text-7xl font-heading font-bold tracking-tight">$0.10</span>
                  <span className="text-white/40 text-lg">/message</span>
                </div>
                <p className="text-white/50 text-sm mb-8">קרדיט אחד = הודעת WhatsApp אחת שנמסרה</p>
                <div className="max-w-sm mx-auto space-y-3 mb-10 text-right">
                  {['ללא מנוי חודשי', 'קרדיטים ללא תפוגה', 'חיוב לפי מסירה, לא לפי ניסיון', 'הנחות כמות', 'תשלום מאובטח ב-Stripe', 'דוחות מפורטים לכל הודעה'].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <IconCheck />
                      <span className="text-sm text-white/70">{item}</span>
                    </div>
                  ))}
                </div>
                <Link href="/signup" onClick={handleCtaClick} className="inline-flex items-center gap-2 bg-white text-[#060606] font-medium px-8 py-3.5 rounded-full text-sm hover:bg-white/90 transition-colors">
                  התחילו בחינם
                  <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <p className="text-xs text-white/30 mt-4">50 קרדיטים חינם בהרשמה</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 md:py-28 px-5 bg-white/[0.02]">
        <div className="max-w-2xl mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-xs font-medium tracking-widest uppercase text-emerald-400 mb-3">שאלות נפוצות</p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight">שאלות נפוצות</h2>
          </Reveal>
          <Reveal delay={100}>
            <div>
              {faqs.map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-20 md:py-28 px-5">
        <Reveal className="max-w-3xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/[0.05] rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight mb-5">מוכנים להגיע לקהל שלכם?</h2>
              <p className="text-white/50 text-base mb-8 max-w-lg mx-auto">צרו חשבון תוך 30 שניות ושלחו את קמפיין הוואטסאפ הראשון שלכם היום. 50 קרדיטים חינם בהרשמה.</p>
              <Link href="/signup" onClick={handleCtaClick} className="inline-flex items-center gap-2 bg-white text-[#060606] font-medium px-8 py-3.5 rounded-full text-sm hover:bg-white/90 transition-colors shadow-[0_0_40px_rgba(16,185,129,0.12)]">
                התחילו בחינם
                <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/[0.06] py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-heading font-bold text-xs">S</div>
            <span className="font-heading font-semibold text-sm">SendThem</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors">מדיניות פרטיות</a>
            <a href="#" className="hover:text-white/60 transition-colors">תנאי שימוש</a>
            <span>&copy; {new Date().getFullYear()} SendThem. כל הזכויות שמורות.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
