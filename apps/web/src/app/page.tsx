'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { trackStep } from '@/lib/tracking';
import { useLanguage } from '@/lib/language-context';
import { lt, getLandingFaqs } from '@/lib/landing-i18n';
import { LanguageToggle } from '@/components/ui/language-toggle';

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

    // Dynamic import so Three.js doesn't block initial paint
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

      // cleanup stored in closure
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

function WhatsAppIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
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

/* ───────────────── FAQ data removed — now from landing-i18n ───────────────── */

/* ───────────────── FAQ item ───────────────── */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-base font-medium text-white group-hover:text-emerald-400 transition-colors pr-4">
          {q}
        </span>
        <span className={`text-white/40 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-45' : ''}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 pb-5' : 'max-h-0'}`}>
        <p className="text-white/60 text-sm leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* ───────────────── page ───────────────── */

export default function LandingPage() {
  const { locale, dir } = useLanguage();
  const l = (key: Parameters<typeof lt>[0]) => lt(key, locale);
  const faqs = getLandingFaqs(locale);
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
    <div dir={dir} className="bg-[#060606] text-white min-h-screen font-sans selection:bg-emerald-500/30">

      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#060606]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-heading font-bold text-sm">S</div>
            <span className="font-heading font-bold text-lg tracking-tight">SendThem</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">{l('howItWorks')}</a>
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">{l('features')}</a>
            <a href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">{l('pricing')}</a>
            <a href="#faq" className="text-sm text-white/60 hover:text-white transition-colors">{l('faq')}</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle />
            <Link href="/login" className="text-sm text-white/70 hover:text-white px-4 py-2 transition-colors">{l('login')}</Link>
            <Link href="/signup" onClick={handleCtaClick} className="text-sm font-medium bg-white text-[#060606] px-5 py-2 rounded-full hover:bg-white/90 transition-colors">{l('getStarted')}</Link>
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
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-white/60 py-2">{l('howItWorks')}</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-white/60 py-2">{l('features')}</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-white/60 py-2">{l('pricing')}</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-white/60 py-2">{l('faq')}</a>
            <div className="pt-2 flex flex-col gap-2">
              <LanguageToggle />
              <Link href="/login" className="text-sm text-center text-white/70 border border-white/20 px-4 py-2.5 rounded-full">{l('login')}</Link>
              <Link href="/signup" onClick={handleCtaClick} className="text-sm text-center font-medium bg-white text-[#060606] px-4 py-2.5 rounded-full">{l('getStarted')}</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ─── Hero with Three.js background ─── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-5 overflow-hidden min-h-[90vh] flex items-center">
        {/* Three.js canvas — fills the entire hero */}
        <HeroCanvas />

        {/* Gradient orbs (on top of canvas) */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/[0.07] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-teal-600/[0.05] rounded-full blur-[80px] pointer-events-none" />

        {/* Hero content */}
        <Reveal className="max-w-4xl mx-auto text-center relative z-10 w-full">
          <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/60 font-medium tracking-wide uppercase">{l('heroBadge')}</span>
          </div>

          <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.1] mb-6">
            {l('heroTitle1')}
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              {l('heroTitle2')}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            {l('heroDesc')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              onClick={handleCtaClick}
              className="group relative inline-flex items-center gap-2.5 bg-white text-[#060606] font-medium px-7 py-3.5 rounded-full text-sm hover:bg-white/90 transition-all shadow-[0_0_32px_rgba(16,185,129,0.15)]"
            >
              {l('heroCta')}
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <a href="#how-it-works" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 px-5 py-3.5 transition-colors">
              {l('heroSecondary')}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
            </a>
          </div>

          <p className="text-xs text-white/30 mt-6">{l('heroSmall')}</p>
        </Reveal>
      </section>

      {/* ─── Stats bar ─── */}
      <Reveal>
        <section className="border-y border-white/[0.06] py-10 px-5">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-heading font-bold text-white">99.2%</div>
                <div className="text-sm text-white/40 mt-1">{l('statDelivery')}</div>
              </div>
              <div>
                <div className="text-3xl font-heading font-bold text-white">$0.10</div>
                <div className="text-sm text-white/40 mt-1">{l('statPrice')}</div>
              </div>
              <div>
                <div className="text-3xl font-heading font-bold text-white">&lt;5 min</div>
                <div className="text-sm text-white/40 mt-1">{l('statSetup')}</div>
              </div>
              <div>
                <div className="text-3xl font-heading font-bold text-white">100%</div>
                <div className="text-sm text-white/40 mt-1">{l('statCompliant')}</div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ─── How it works ─── */}
      <section id="how-it-works" className="py-20 md:py-28 px-5">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-xs font-medium tracking-widest uppercase text-emerald-400 mb-3">{l('howItWorksLabel')}</p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight">{l('howItWorksTitle')}</h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <IconUpload />, num: '1', title: l('step1Title'), desc: l('step1Desc') },
              { icon: <IconEdit />, num: '2', title: l('step2Title'), desc: l('step2Desc') },
              { icon: <IconSend />, num: '3', title: l('step3Title'), desc: l('step3Desc') },
            ].map((step, i) => (
              <Reveal key={step.num} delay={i * 120}>
                <div className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 hover:border-emerald-500/20 transition-all duration-300 h-full">
                  <div className="absolute top-6 right-6 text-[64px] font-heading font-bold text-white/[0.03] leading-none select-none">{step.num}</div>
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
            <p className="text-xs font-medium tracking-widest uppercase text-emerald-400 mb-3">{l('featuresLabel')}</p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight">{l('featuresTitle')}</h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { icon: <IconShield />, title: l('feat1Title'), desc: l('feat1Desc') },
              { icon: <IconBolt />, title: l('feat2Title'), desc: l('feat2Desc') },
              { icon: <IconChart />, title: l('feat3Title'), desc: l('feat3Desc') },
              { icon: <IconGlobe />, title: l('feat4Title'), desc: l('feat4Desc') },
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
            <p className="text-xs font-medium tracking-widest uppercase text-emerald-400 mb-3">{l('pricingLabel')}</p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight">{l('pricingTitle')}</h2>
            <p className="text-white/50 mt-4 text-base">{l('pricingDesc')}</p>
          </Reveal>

          <Reveal delay={100}>
            <div className="relative bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] rounded-3xl p-8 md:p-10 overflow-hidden">
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-emerald-500/[0.08] rounded-full blur-[60px] pointer-events-none" />
              <div className="relative z-10 text-center">
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-6xl md:text-7xl font-heading font-bold tracking-tight">$0.10</span>
                  <span className="text-white/40 text-lg">{l('pricingUnit')}</span>
                </div>
                <p className="text-white/50 text-sm mb-8">{l('pricingCredit')}</p>
                <div className="max-w-sm mx-auto space-y-3 mb-10 text-left">
                  {[l('pricingItem1'), l('pricingItem2'), l('pricingItem3'), l('pricingItem4'), l('pricingItem5'), l('pricingItem6')].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <IconCheck />
                      <span className="text-sm text-white/70">{item}</span>
                    </div>
                  ))}
                </div>
                <Link href="/signup" onClick={handleCtaClick} className="inline-flex items-center gap-2 bg-white text-[#060606] font-medium px-8 py-3.5 rounded-full text-sm hover:bg-white/90 transition-colors">
                  {l('pricingCta')}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <p className="text-xs text-white/30 mt-4">{l('pricingFree')}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 md:py-28 px-5 bg-white/[0.02]">
        <div className="max-w-2xl mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-xs font-medium tracking-widest uppercase text-emerald-400 mb-3">{l('faqLabel')}</p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight">{l('faqTitle')}</h2>
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
              <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight mb-5">{l('ctaTitle')}</h2>
              <p className="text-white/50 text-base mb-8 max-w-lg mx-auto">{l('ctaDesc')}</p>
              <Link href="/signup" onClick={handleCtaClick} className="inline-flex items-center gap-2 bg-white text-[#060606] font-medium px-8 py-3.5 rounded-full text-sm hover:bg-white/90 transition-colors shadow-[0_0_40px_rgba(16,185,129,0.12)]">
                {l('ctaButton')}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
            <a href="#" className="hover:text-white/60 transition-colors">{l('privacyPolicy')}</a>
            <a href="#" className="hover:text-white/60 transition-colors">{l('termsOfService')}</a>
            <span>&copy; {new Date().getFullYear()} SendThem. {l('allRightsReserved')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
