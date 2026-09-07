import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAppStore } from '../../store/useAppStore';
import { SUPPORTED_LOCALES } from '../../i18n/translations';
import { setAppLanguage } from '../../i18n';
import { useTranslation } from 'react-i18next';
import { Globe, Volume2, ArrowRight } from 'lucide-react';
import { audioEngine } from '../../audio/AudioEngine';

export const IntroSplash: React.FC = () => {
  const { t, i18n } = useTranslation();
  const setIntroCompleted = useAppStore((s) => s.setIntroCompleted);
  const containerRef = useRef<HTMLDivElement>(null);
  const staffLinesRef = useRef<SVGGElement>(null);
  const notesRef = useRef<SVGGElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Progress counter simulation
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.floor(Math.random() * 12) + 4;
      });
    }, 90);

    if (prefersReducedMotion) {
      setProgress(100);
      return () => clearInterval(timer);
    }

    const tl = gsap.timeline({
      onComplete: () => {
        // Auto-complete or stay until user clicks / skip
      },
    });

    if (staffLinesRef.current && notesRef.current && titleRef.current && taglineRef.current) {
      const lines = staffLinesRef.current.querySelectorAll('line');
      const notes = notesRef.current.querySelectorAll('.music-note');

      tl.fromTo(
        lines,
        { strokeDasharray: 800, strokeDashoffset: 800, opacity: 0 },
        { strokeDashoffset: 0, opacity: 0.8, duration: 1.4, stagger: 0.12, ease: 'power2.out' }
      )
        .fromTo(
          notes,
          { scale: 0, opacity: 0, y: 20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: 'back.out(1.7)' },
          '-=0.4'
        )
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 30, letterSpacing: '0.4em' },
          { opacity: 1, y: 0, letterSpacing: '0.15em', duration: 1.2, ease: 'power3.out' },
          '-=0.3'
        )
        .fromTo(
          taglineRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
          '-=0.5'
        );
    }

    return () => {
      clearInterval(timer);
      tl.kill();
    };
  }, []);

  const handleEnterStudio = () => {
    // Initialize audio context on user action
    audioEngine.ensureContext();
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 1.04,
        duration: 0.6,
        ease: 'power2.inOut',
        onComplete: () => setIntroCompleted(true),
      });
    } else {
      setIntroCompleted(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-[#070A0F] text-[#EAF0FF] select-none"
    >
      {/* Top Header: Language Selector + Skip */}
      <div className="w-full flex items-center justify-between max-w-6xl">
        {/* Language selector */}
        <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-[#F2C14E]/40 transition-colors">
          <Globe className="w-3.5 h-3.5 text-[#F2C14E]" />
          <select
            value={i18n.language}
            onChange={(e) => setAppLanguage(e.target.value)}
            className="bg-transparent text-xs text-white/90 outline-none cursor-pointer pr-1"
          >
            {Object.entries(SUPPORTED_LOCALES).map(([code, meta]) => (
              <option key={code} value={code} className="bg-[#0C111B] text-white">
                {meta.nativeName} ({meta.name})
              </option>
            ))}
          </select>
        </div>

        {/* Skip button */}
        <button
          onClick={handleEnterStudio}
          className="text-xs uppercase tracking-widest text-white/50 hover:text-[#F2C14E] transition-colors px-4 py-2 rounded-full border border-white/10 hover:border-[#F2C14E]/40"
        >
          {t('skipIntro', 'Skip Intro')}
        </button>
      </div>

      {/* Center: Music Staff & Animated Title */}
      <div className="flex flex-col items-center justify-center text-center max-w-2xl">
        {/* Animated SVG Staff Lines & Notes */}
        <div className="relative w-72 sm:w-96 h-36 mb-6">
          <svg
            viewBox="0 0 400 120"
            className="w-full h-full stroke-[#F2C14E] fill-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 5-line staff */}
            <g ref={staffLinesRef} stroke="#F2C14E" strokeWidth="1.5" strokeOpacity="0.5">
              <line x1="20" y1="20" x2="380" y2="20" />
              <line x1="20" y1="40" x2="380" y2="40" />
              <line x1="20" y1="60" x2="380" y2="60" />
              <line x1="20" y1="80" x2="380" y2="80" />
              <line x1="20" y1="100" x2="380" y2="100" />
            </g>

            {/* Treble clef hint & flowing notes */}
            <g ref={notesRef}>
              {/* Note 1: Quarter note on line 2 */}
              <g className="music-note">
                <ellipse cx="120" cy="80" rx="9" ry="7" fill="#FFD36A" stroke="none" transform="rotate(-20 120 80)" />
                <line x1="128" y1="80" x2="128" y2="35" stroke="#FFD36A" strokeWidth="2.5" />
              </g>

              {/* Note 2: Eighth note on space 3 */}
              <g className="music-note">
                <ellipse cx="200" cy="50" rx="9" ry="7" fill="#F2C14E" stroke="none" transform="rotate(-20 200 50)" />
                <line x1="208" y1="50" x2="208" y2="12" stroke="#F2C14E" strokeWidth="2.5" />
                <path d="M208 12 Q225 18 220 32" stroke="#F2C14E" strokeWidth="2.5" fill="none" />
              </g>

              {/* Note 3: Connected double eighth notes */}
              <g className="music-note">
                <ellipse cx="280" cy="60" rx="9" ry="7" fill="#F2C14E" stroke="none" transform="rotate(-20 280 60)" />
                <line x1="288" y1="60" x2="288" y2="22" stroke="#F2C14E" strokeWidth="2.5" />

                <ellipse cx="330" cy="40" rx="9" ry="7" fill="#FFD36A" stroke="none" transform="rotate(-20 330 40)" />
                <line x1="338" y1="40" x2="338" y2="10" stroke="#FFD36A" strokeWidth="2.5" />

                {/* Beam */}
                <line x1="288" y1="22" x2="338" y2="10" stroke="#FFD36A" strokeWidth="4" />
              </g>
            </g>
          </svg>
        </div>

        {/* Wordmark */}
        <h1
          ref={titleRef}
          className="text-4xl sm:text-6xl font-heading font-light tracking-[0.18em] gold-gradient-text uppercase"
        >
          {t('appName', 'HARMONA')}
        </h1>

        {/* Tagline */}
        <p
          ref={taglineRef}
          className="mt-3 text-sm sm:text-base text-[#EAF0FF]/75 font-light tracking-wider"
        >
          {t('tagline', 'Explore the World of Sound')}
        </p>

        {/* Enter / Loading Action */}
        <div ref={loaderRef} className="mt-10 flex flex-col items-center gap-4">
          {progress < 100 ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#D6A73D] to-[#FFD36A] transition-all duration-150"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
              <span className="text-[11px] font-mono tracking-widest text-white/50">
                {t('loadingStudio', 'Loading Acoustic Studio...')} {Math.min(100, progress)}%
              </span>
            </div>
          ) : (
            <button
              onClick={handleEnterStudio}
              className="group flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#F2C14E] text-[#070A0F] font-medium text-xs tracking-wider uppercase shadow-lg shadow-[#F2C14E]/25 hover:bg-[#FFD36A] hover:scale-105 active:scale-95 transition-all"
            >
              <span>Enter 3D Studio</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Footer subtle attribution */}
      <div className="text-[10px] text-white/30 tracking-widest uppercase">
        Dark-Premium Acoustic Interaction Engine
      </div>
    </div>
  );
};
