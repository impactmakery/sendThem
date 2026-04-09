'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { trackStep } from '@/lib/tracking';
import { useLanguage } from '@/lib/language-context';
import { lt, getLandingFaqs } from '@/lib/landing-i18n';
import { LanguageToggle } from '@/components/ui/language-toggle';
import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useTransform,
  useScroll,
  useSpring,
  animate,
  type MotionValue,
} from 'framer-motion';

/* ───────────────── Easing ───────────────── */

type Ease4 = [number, number, number, number];
const smooth: Ease4 = [0.16, 1, 0.3, 1];
const snappy: Ease4 = [0.22, 0.68, 0, 1.04];

/* ───────────────── Variants ───────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (d: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.8, delay: d, ease: smooth },
  }),
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (d: number = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.8, delay: d, ease: smooth },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ───────────────── Word-by-word text reveal ───────────────── */

function WordReveal({ text, className = '', delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', rotateX: 40 }}
            animate={{ y: 0, rotateX: 0 }}
            transition={{
              duration: 0.7,
              delay: delay + i * 0.06,
              ease: smooth,
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && '\u00A0'}
        </span>
      ))}
    </span>
  );
}

/* ───────────────── Magnetic button ───────────────── */

function MagneticWrap({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 20 });
  const sy = useSpring(y, { stiffness: 250, damping: 20 });

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    x.set((e.clientX - cx) * 0.25);
    y.set((e.clientY - cy) * 0.25);
  }, [x, y]);

  const reset = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ───────────────── Glow card (cursor-tracking border glow) ───────────────── */

function GlowCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Glow spot */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-500"
        style={{
          opacity: hovering ? 1 : 0,
          background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, rgba(16,185,129,0.12), transparent 60%)`,
        }}
      />
      {/* Border glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500"
        style={{
          opacity: hovering ? 1 : 0,
          background: `radial-gradient(300px circle at ${pos.x}px ${pos.y}px, rgba(16,185,129,0.25), transparent 60%)`,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1px',
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

/* ───────────────── Animated counter ───────────────── */

function AnimatedCounter({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => {
    if (value % 1 !== 0) return v.toFixed(value < 1 ? 2 : 1);
    return Math.round(v).toString();
  });

  useEffect(() => {
    if (isInView) animate(mv, value, { duration: 2, ease: smooth });
  }, [isInView, value, mv]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}<motion.span>{display}</motion.span>{suffix}
    </span>
  );
}

/* ───────────────── Scroll progress bar ───────────────── */

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div
      style={{ scaleX, transformOrigin: '0%' }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 z-[60]"
    />
  );
}

/* ───────────────── Parallax wrapper ───────────────── */

function Parallax({ children, offset = 50, className = '' }: { children: React.ReactNode; offset?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
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
      const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 1, 10000);
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
          positions.push(ix * SEPARATION - (AMOUNTX * SEPARATION) / 2, 0, iy * SEPARATION - (AMOUNTY * SEPARATION) / 2);
          colors.push(0.3, 0.85, 0.65);
        }
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({ size: 8, vertexColors: true, transparent: true, opacity: 0.7, sizeAttenuation: true });
      scene.add(new THREE.Points(geometry, material));

      let count = 0;
      let animId = 0;
      let scrollY = 0;

      const onScroll = () => { scrollY = window.scrollY; };
      window.addEventListener('scroll', onScroll, { passive: true });

      const loop = () => {
        if (destroyed) return;
        animId = requestAnimationFrame(loop);

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
            posArr[i * 3 + 1] = Math.sin((ix + count) * 0.3) * amp + Math.sin((iy + count) * 0.5) * amp;
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
      loop();

      const cleanup = () => {
        destroyed = true;
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(animId);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
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

/* ───────────────── Icons ───────────────── */

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

/* ───────────────── Animated line connector (how it works) ───────────────── */

function StepConnector() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <div ref={ref} className="hidden md:flex items-center justify-center">
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 1, ease: smooth }}
        className="h-px w-full bg-gradient-to-r from-emerald-500/40 to-transparent origin-left"
      />
    </div>
  );
}

/* ───────────────── FAQ item ───────────────── */

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={fadeUp}
      custom={index * 0.05}
      className="border-b border-white/10"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-base font-medium text-white group-hover:text-emerald-400 transition-colors pr-4">
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: snappy }}
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
            transition={{ duration: 0.4, ease: smooth }}
            className="overflow-hidden"
          >
            <p className="text-white/60 text-sm leading-relaxed pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ───────────────── Floating badge ───────────────── */

function FloatingBadge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ───────────────── Page ───────────────── */

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
      if (scrollPct > 0.5) { trackStep('scroll_50'); tracked50.current = true; }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleCtaClick() { trackStep('cta_click'); }

  return (
    <div dir={dir} className="bg-[#060606] text-white min-h-screen font-sans selection:bg-emerald-500/30">
      <ScrollProgress />

      {/* ─── Navbar ─── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: smooth }}
        className={`fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b transition-all duration-500 ${
          scrolled ? 'bg-[#060606]/90 border-white/[0.08]' : 'bg-transparent border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 8 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-heading font-bold text-sm shadow-lg shadow-emerald-500/20"
            >
              S
            </motion.div>
            <span className="font-heading font-bold text-lg tracking-tight">SendThem</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {(['howItWorks', 'features', 'pricing', 'faq'] as const).map((key) => (
              <motion.a
                key={key}
                href={`#${key === 'howItWorks' ? 'how-it-works' : key}`}
                className="text-sm text-white/60 hover:text-white transition-colors relative"
                whileHover="hover"
              >
                {l(key)}
                <motion.span
                  variants={{ hover: { scaleX: 1 } }}
                  initial={{ scaleX: 0 }}
                  className="absolute -bottom-1 left-0 right-0 h-px bg-emerald-400 origin-left"
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle />
            <Link href="/login" className="text-sm text-white/70 hover:text-white px-4 py-2 transition-colors">{l('login')}</Link>
            <MagneticWrap>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/checkout" onClick={handleCtaClick} className="text-sm font-medium bg-white text-[#060606] px-5 py-2 rounded-full hover:bg-white/90 transition-colors inline-block shadow-lg shadow-white/10">{l('getStarted')}</Link>
              </motion.div>
            </MagneticWrap>
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
              transition={{ duration: 0.4, ease: smooth }}
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

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-5 overflow-hidden min-h-[90vh] flex items-center">
        <HeroCanvas />

        {/* Parallax gradient orbs */}
        <Parallax offset={80} className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="w-[600px] h-[600px] bg-emerald-500/[0.07] rounded-full blur-[120px]" />
        </Parallax>
        <Parallax offset={40} className="absolute top-40 left-1/4 pointer-events-none">
          <div className="w-[300px] h-[300px] bg-teal-600/[0.05] rounded-full blur-[80px]" />
        </Parallax>
        <Parallax offset={60} className="absolute top-60 right-1/4 pointer-events-none">
          <div className="w-[200px] h-[200px] bg-cyan-500/[0.04] rounded-full blur-[60px]" />
        </Parallax>

        <div className="max-w-4xl mx-auto text-center relative z-10 w-full">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: smooth }}
          >
            <FloatingBadge className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-white/60 font-medium tracking-wide uppercase">{l('heroBadge')}</span>
            </FloatingBadge>
          </motion.div>

          {/* Title — word by word */}
          <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.1] mb-6">
            <WordReveal text={l('heroTitle1')} delay={0.3} />
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              <WordReveal text={l('heroTitle2')} delay={0.6} />
            </span>
          </h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: smooth }}
            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {l('heroDesc')}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1, ease: smooth }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <MagneticWrap>
              <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/checkout"
                  onClick={handleCtaClick}
                  className="group relative inline-flex items-center gap-2.5 bg-white text-[#060606] font-medium px-7 py-3.5 rounded-full text-sm transition-all shadow-[0_0_40px_rgba(16,185,129,0.2)] hover:shadow-[0_0_60px_rgba(16,185,129,0.3)]"
                >
                  {/* Shimmer effect */}
                  <span className="absolute inset-0 rounded-full overflow-hidden">
                    <span className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </span>
                  <span className="relative">{l('heroCta')}</span>
                  <svg className="w-4 h-4 relative group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </motion.div>
            </MagneticWrap>
            <motion.a
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 px-5 py-3.5 transition-colors"
              whileHover={{ x: 0, gap: '12px' }}
            >
              {l('heroSecondary')}
              <motion.svg
                animate={{ y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </motion.svg>
            </motion.a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="text-xs text-white/30 mt-6"
          >
            {l('heroSmall')}
          </motion.p>
        </div>
      </section>

      {/* ─── Stats bar ─── */}
      <section className="border-y border-white/[0.06] py-10 px-5 relative overflow-hidden">
        {/* Subtle moving gradient behind stats */}
        <motion.div
          animate={{ x: ['-50%', '50%'] }}
          transition={{ repeat: Infinity, repeatType: 'reverse', duration: 10, ease: 'linear' }}
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.03), transparent)', width: '200%' }}
        />
        <div className="max-w-5xl mx-auto relative">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { value: 99.2, suffix: '%', label: l('statDelivery') },
              { value: 0.10, prefix: '$', label: l('statPrice') },
              { value: 5, prefix: '<', suffix: ' min', label: l('statSetup') },
              { value: 100, suffix: '%', label: l('statCompliant') },
            ].map((stat) => (
              <motion.div key={stat.label} variants={fadeUp}>
                <div className="text-3xl font-heading font-bold text-white">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                </div>
                <div className="text-sm text-white/40 mt-1">{stat.label}</div>
              </motion.div>
            ))}
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
            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.3em' }}
              whileInView={{ opacity: 1, letterSpacing: '0.15em' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-xs font-medium uppercase text-emerald-400 mb-3"
            >
              {l('howItWorksLabel')}
            </motion.p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight">{l('howItWorksTitle')}</h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              { icon: <IconUpload />, num: '01', title: l('step1Title'), desc: l('step1Desc') },
              { icon: <IconEdit />, num: '02', title: l('step2Title'), desc: l('step2Desc') },
              { icon: <IconSend />, num: '03', title: l('step3Title'), desc: l('step3Desc') },
            ].map((step, i) => (
              <motion.div key={step.num} variants={scaleUp}>
                <GlowCard className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 h-full">
                  {/* Step number */}
                  <motion.span
                    initial={{ opacity: 0, scale: 3 }}
                    whileInView={{ opacity: 0.04, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: snappy }}
                    className="absolute top-5 right-6 text-[72px] font-heading font-bold text-white leading-none select-none"
                  >
                    {step.num}
                  </motion.span>
                  <motion.div
                    whileHover={{ rotate: -10, scale: 1.15 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-5"
                  >
                    {step.icon}
                  </motion.div>
                  <h3 className="font-heading font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
                </GlowCard>
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
            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.3em' }}
              whileInView={{ opacity: 1, letterSpacing: '0.15em' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-xs font-medium uppercase text-emerald-400 mb-3"
            >
              {l('featuresLabel')}
            </motion.p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight">{l('featuresTitle')}</h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid sm:grid-cols-2 gap-5"
          >
            {[
              { icon: <IconShield />, title: l('feat1Title'), desc: l('feat1Desc') },
              { icon: <IconBolt />, title: l('feat2Title'), desc: l('feat2Desc') },
              { icon: <IconChart />, title: l('feat3Title'), desc: l('feat3Desc') },
              { icon: <IconGlobe />, title: l('feat4Title'), desc: l('feat4Desc') },
            ].map((feat) => (
              <motion.div key={feat.title} variants={fadeUp}>
                <GlowCard className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 flex gap-4 h-full">
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.2 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5"
                  >
                    {feat.icon}
                  </motion.div>
                  <div>
                    <h3 className="font-semibold mb-1.5">{feat.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{feat.desc}</p>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </motion.div>
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
            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.3em' }}
              whileInView={{ opacity: 1, letterSpacing: '0.15em' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-xs font-medium uppercase text-emerald-400 mb-3"
            >
              {l('pricingLabel')}
            </motion.p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight">{l('pricingTitle')}</h2>
            <p className="text-white/50 mt-4 text-base">{l('pricingDesc')}</p>
          </motion.div>

          <motion.div
            variants={scaleUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            custom={0.1}
          >
            <GlowCard className="bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] rounded-3xl p-8 md:p-10">
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-emerald-500/[0.08] rounded-full blur-[60px] pointer-events-none" />
              <div className="relative z-10 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: snappy }}
                  className="flex items-baseline justify-center gap-1 mb-2"
                >
                  <span className="text-6xl md:text-7xl font-heading font-bold tracking-tight">$0.10</span>
                  <span className="text-white/40 text-lg">{l('pricingUnit')}</span>
                </motion.div>
                <p className="text-white/50 text-sm mb-8">{l('pricingCredit')}</p>
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="max-w-sm mx-auto space-y-3 mb-10 text-left"
                >
                  {[l('pricingItem1'), l('pricingItem2'), l('pricingItem3'), l('pricingItem4'), l('pricingItem5'), l('pricingItem6')].map((item) => (
                    <motion.div key={item} variants={fadeUp} className="flex items-center gap-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 500, delay: 0.1 }}
                      >
                        <IconCheck />
                      </motion.div>
                      <span className="text-sm text-white/70">{item}</span>
                    </motion.div>
                  ))}
                </motion.div>
                <MagneticWrap className="inline-block">
                  <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}>
                    <Link href="/checkout" onClick={handleCtaClick} className="inline-flex items-center gap-2 bg-white text-[#060606] font-medium px-8 py-3.5 rounded-full text-sm transition-all shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:shadow-[0_0_60px_rgba(16,185,129,0.25)]">
                      {l('pricingCta')}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  </motion.div>
                </MagneticWrap>
                <p className="text-xs text-white/30 mt-4">{l('pricingFree')}</p>
              </div>
            </GlowCard>
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
            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.3em' }}
              whileInView={{ opacity: 1, letterSpacing: '0.15em' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-xs font-medium uppercase text-emerald-400 mb-3"
            >
              {l('faqLabel')}
            </motion.p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight">{l('faqTitle')}</h2>
          </motion.div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {faqs.map((faq, i) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-20 md:py-28 px-5 relative overflow-hidden">
        {/* Animated background glow */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          className="absolute inset-0 bg-emerald-500 rounded-full blur-[150px] pointer-events-none mx-auto w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
        <motion.div
          variants={scaleUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          custom={0}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <h2 className="font-heading font-bold text-3xl md:text-4xl tracking-tight mb-5">{l('ctaTitle')}</h2>
          <p className="text-white/50 text-base mb-8 max-w-lg mx-auto">{l('ctaDesc')}</p>
          <MagneticWrap className="inline-block">
            <motion.div
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              animate={{ y: [0, -5, 0] }}
              transition={{ y: { repeat: Infinity, duration: 3, ease: 'easeInOut' } }}
            >
              <Link href="/checkout" onClick={handleCtaClick} className="inline-flex items-center gap-2 bg-white text-[#060606] font-medium px-8 py-3.5 rounded-full text-sm transition-all shadow-[0_0_50px_rgba(16,185,129,0.15)] hover:shadow-[0_0_70px_rgba(16,185,129,0.3)]">
                {/* Shimmer */}
                <span className="absolute inset-0 rounded-full overflow-hidden">
                  <span className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent" />
                </span>
                <span className="relative">{l('ctaButton')}</span>
                <svg className="w-4 h-4 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </motion.div>
          </MagneticWrap>
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
