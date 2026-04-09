'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { trackStep } from '@/lib/tracking';
import { useLanguage } from '@/lib/language-context';
import { lt, getLandingFaqs } from '@/lib/landing-i18n';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate } from 'framer-motion';

/* ───────────────── Animation variants ───────────────── */

const smoothEase = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: smoothEase as unknown as [number, number, number, number] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.6, delay },
  }),
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, delay, ease: smoothEase as unknown as [number, number, number, number] },
  }),
};

const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, delay, ease: smoothEase as unknown as [number, number, number, number] },
  }),
};

const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, delay, ease: smoothEase as unknown as [number, number, number, number] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

/* ───────────────── Animated counter ───────────────── */

function AnimatedCounter({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => {
    if (value % 1 !== 0) return v.toFixed(1);
    return Math.round(v).toString();
  });

  useEffect(() => {
    if (isInView) {
      animate(motionVal, value, { duration: 2, ease: [0.16, 1, 0.3, 1] });
    }
  }, [isInView, value, motionVal]);

  return (
    <span ref={ref}>
      {prefix}<motion.span>{rounded}</motion.span>{suffix}
    </span>
  );
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

      const anim = () => {
        if (destroyed) return;
        animId = requestAnimationFrame(anim);

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
      anim();

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

/* ───────────────── FAQ item with AnimatePresence ───────────────── */

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
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/40 flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="text-white/60 text-sm leading-relaxed pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    trackStep('page_view');

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
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
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${
          scrolled ? 'bg-[#060606]/90 border-white/[0.08]' : 'bg-transparent border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-heading font-bold text-sm"
            >
              S
            </motion.div>
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
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link href="/checkout" onClick={handleCtaClick} className="text-sm font-medium bg-white text-[#060606] px-5 py-2 rounded-full hover:bg-white/90 transition-colors inline-block">{l('getStarted')}</Link>
            </motion.div>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-white/60">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />}
            </svg>
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-white/[0.06] bg-[#060606]/95 backdrop-blur-xl px-5 pb-5 pt-3 space-y-3 overflow-hidden"
            >
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-white/60 py-2">{l('howItWorks')}</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-white/60 py-2">{l('features')}</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-white/60 py-2">{l('pricing')}</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-white/60 py-2">{l('faq')}</a>
              <div className="pt-2 flex flex-col gap-2">
                <LanguageToggle />
                <Link href="/login" className="text-sm text-center text-white/70 border border-white/20 px-4 py-2.5 rounded-full">{l('login')}</Link>
                <Link href="/checkout" onClick={handleCtaClick} className="text-sm text-center font-medium bg-white text-[#060606] px-4 py-2.5 rounded-full">{l('getStarted')}</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ─── Hero with Three.js background ─── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-5 overflow-hidden min-h-[90vh] flex items-center">
        <HeroCanvas />

        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/[0.07] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-teal-600/[0.05] rounded-full blur-[80px] pointer-events-none" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center relative z-10 w-full"
        >
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/60 font-medium tracking-wide uppercase">{l('heroBadge')}</span>
          </motion.div>

          <motion.h1 variants={fadeUp} custom={0.1} className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.1] mb-6">
            {l('heroTitle1')}
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              {l('heroTitle2')}
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={0.2} className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            {l('heroDesc')}
          </motion.p>

          <motion.div variants={fadeUp} custom={0.3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/checkout"
                onClick={handleCtaClick}
                className="group relative inline-flex items-center gap-2.5 bg-white text-[#060606] font-medium px-7 py-3.5 rounded-full text-sm hover:bg-white/90 transition-all shadow-[0_0_32px_rgba(16,185,129,0.15)]"
              >
                {l('heroCta')}
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </motion.div>
            <a href="#how-it-works" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 px-5 py-3.5 transition-colors">
              {l('heroSecondary')}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
            </a>
          </motion.div>

          <motion.p variants={fadeIn} custom={0.5} className="text-xs text-white/30 mt-6">{l('heroSmall')}</motion.p>
        </motion.div>
      </section>

      {/* ─── Stats bar ─── */}
      <section className="border-y border-white/[0.06] py-10 px-5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            <motion.div variants={fadeUp}>
              <div className="text-3xl font-heading font-bold text-white">
                <AnimatedCounter value={99.2} suffix="%" />
              </div>
              <div className="text-sm text-white/40 mt-1">{l('statDelivery')}</div>
            </motion.div>
            <motion.div variants={fadeUp}>
              <div className="text-3xl font-heading font-bold text-white">
                <AnimatedCounter value={0.10} prefix="$" />
              </div>
              <div className="text-sm text-white/40 mt-1">{l('statPrice')}</div>
            </motion.div>
            <motion.div variants={fadeUp}>
              <div className="text-3xl font-heading font-bold text-white">
                &lt;<AnimatedCounter value={5} /> min
              </div>
              <div className="text-sm text-white/40 mt-1">{l('statSetup')}</div>
            </motion.div>
            <motion.div variants={fadeUp}>
              <div className="text-3xl font-heading font-bold text-white">
                <AnimatedCounter value={100} suffix="%" />
              </div>
              <div className="text-sm text-white/40 mt-1">{l('statCompliant')}</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how-it-works" className="py-20 md:py-28 px-5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            custom={0}
            className="text-center mb-16"
          >
            <p className="text-xs font-medium tracking-widest uppercase text-emerald-400 mb-3">{l('howItWorksLabel')}</p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight">{l('howItWorksTitle')}</h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              { icon: <IconUpload />, num: '1', title: l('step1Title'), desc: l('step1Desc') },
              { icon: <IconEdit />, num: '2', title: l('step2Title'), desc: l('step2Desc') },
              { icon: <IconSend />, num: '3', title: l('step3Title'), desc: l('step3Desc') },
            ].map((step) => (
              <motion.div
                key={step.num}
                variants={scaleUp}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 hover:border-emerald-500/20 transition-colors duration-300 h-full"
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 0.03 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="absolute top-6 right-6 text-[64px] font-heading font-bold text-white leading-none select-none"
                >
                  {step.num}
                </motion.div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-5">{step.icon}</div>
                <h3 className="font-heading font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-20 md:py-28 px-5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            custom={0}
            className="text-center mb-16"
          >
            <p className="text-xs font-medium tracking-widest uppercase text-emerald-400 mb-3">{l('featuresLabel')}</p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight">{l('featuresTitle')}</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { icon: <IconShield />, title: l('feat1Title'), desc: l('feat1Desc') },
              { icon: <IconBolt />, title: l('feat2Title'), desc: l('feat2Desc') },
              { icon: <IconChart />, title: l('feat3Title'), desc: l('feat3Desc') },
              { icon: <IconGlobe />, title: l('feat4Title'), desc: l('feat4Desc') },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                variants={i % 2 === 0 ? slideInLeft : slideInRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                custom={i * 0.1}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 flex gap-4 h-full hover:border-emerald-500/20 transition-colors duration-300"
              >
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5"
                >
                  {feat.icon}
                </motion.div>
                <div>
                  <h3 className="font-semibold mb-1.5">{feat.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-20 md:py-28 px-5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            custom={0}
            className="text-center mb-16"
          >
            <p className="text-xs font-medium tracking-widest uppercase text-emerald-400 mb-3">{l('pricingLabel')}</p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight">{l('pricingTitle')}</h2>
            <p className="text-white/50 mt-4 text-base">{l('pricingDesc')}</p>
          </motion.div>

          <motion.div
            variants={scaleUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            custom={0.1}
            className="relative bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] rounded-3xl p-8 md:p-10 overflow-hidden"
          >
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-emerald-500/[0.08] rounded-full blur-[60px] pointer-events-none" />
            <div className="relative z-10 text-center">
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-6xl md:text-7xl font-heading font-bold tracking-tight">$0.10</span>
                <span className="text-white/40 text-lg">{l('pricingUnit')}</span>
              </div>
              <p className="text-white/50 text-sm mb-8">{l('pricingCredit')}</p>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="max-w-sm mx-auto space-y-3 mb-10 text-left"
              >
                {[l('pricingItem1'), l('pricingItem2'), l('pricingItem3'), l('pricingItem4'), l('pricingItem5'), l('pricingItem6')].map((item) => (
                  <motion.div key={item} variants={fadeUp} className="flex items-center gap-3">
                    <IconCheck />
                    <span className="text-sm text-white/70">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link href="/checkout" onClick={handleCtaClick} className="inline-flex items-center gap-2 bg-white text-[#060606] font-medium px-8 py-3.5 rounded-full text-sm hover:bg-white/90 transition-colors">
                  {l('pricingCta')}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </motion.div>
              <p className="text-xs text-white/30 mt-4">{l('pricingFree')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 md:py-28 px-5 bg-white/[0.02]">
        <div className="max-w-2xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            custom={0}
            className="text-center mb-12"
          >
            <p className="text-xs font-medium tracking-widest uppercase text-emerald-400 mb-3">{l('faqLabel')}</p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight">{l('faqTitle')}</h2>
          </motion.div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            custom={0.1}
          >
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-20 md:py-28 px-5">
        <motion.div
          variants={scaleUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          custom={0}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/[0.05] rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight mb-5">{l('ctaTitle')}</h2>
              <p className="text-white/50 text-base mb-8 max-w-lg mx-auto">{l('ctaDesc')}</p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                animate={{ y: [0, -4, 0] }}
                transition={{ y: { repeat: Infinity, duration: 3, ease: 'easeInOut' } }}
                className="inline-block"
              >
                <Link href="/checkout" onClick={handleCtaClick} className="inline-flex items-center gap-2 bg-white text-[#060606] font-medium px-8 py-3.5 rounded-full text-sm hover:bg-white/90 transition-colors shadow-[0_0_40px_rgba(16,185,129,0.12)]">
                  {l('ctaButton')}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
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
