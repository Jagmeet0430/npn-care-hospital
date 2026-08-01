"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, animate, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness } from "lucide-react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function Reveal({
  children,
  className,
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCounter({ value }: { value: string }) {
  const canAnimate = /^[\d,]+(?:\.\d+)?(?:[KkMm+%]+)?$/.test(value);
  const numeric = Number(value.replace(/[^\d.]/g, ""));
  const suffix = value.replace(/[\d.,]/g, "");
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!canAnimate || !Number.isFinite(numeric) || numeric <= 0) {
      setDisplay(value);
      return;
    }

    const controls = animate(motionValue, numeric, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(`${Math.round(latest).toLocaleString("en-IN")}${suffix}`)
    });

    return controls.stop;
  }, [canAnimate, motionValue, numeric, suffix, value]);

  return <>{display}</>;
}

export function HeroParallax({ children }: { children: React.ReactNode }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, 70]);

  return (
    <motion.div className="hero-parallax" style={{ y }}>
      {children}
    </motion.div>
  );
}

export function FloatingCareerCta() {
  return (
    <motion.div
      className="floating-career-cta"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.45 }}
    >
      <Link href="/careers">
        <BriefcaseBusiness size={18} />
        Apply Now
      </Link>
    </motion.div>
  );
}

export function PageLoadingBar() {
  return <motion.div className="page-loading-bar" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.65, ease: "easeOut" }} />;
}

const introParticles = [
  { left: "12%", top: "18%", size: 5, delay: 0 },
  { left: "24%", top: "72%", size: 3, delay: 0.15 },
  { left: "41%", top: "28%", size: 4, delay: 0.3 },
  { left: "58%", top: "62%", size: 6, delay: 0.05 },
  { left: "74%", top: "22%", size: 3, delay: 0.22 },
  { left: "86%", top: "76%", size: 5, delay: 0.12 },
  { left: "50%", top: "84%", size: 3, delay: 0.38 },
  { left: "7%", top: "52%", size: 4, delay: 0.26 }
];

export function IntroAnimation({ brandName, tagline }: { brandName: string; tagline: string }) {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const letters = brandName.split("");

  useEffect(() => {
    if (reduceMotion) return;

    const alreadyPlayed = window.sessionStorage.getItem("npn-intro-played") === "true";
    if (alreadyPlayed) return;

    setVisible(true);
    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem("npn-intro-played", "true");
      setVisible(false);
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="intro-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          aria-label="N.P.N. Care Hospital opening animation"
        >
          <div className="intro-particles" aria-hidden="true">
            {introParticles.map((particle) => (
              <motion.span
                key={`${particle.left}-${particle.top}`}
                style={{ left: particle.left, top: particle.top, width: particle.size, height: particle.size }}
                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                animate={{ opacity: [0, 0.55, 0.2], y: [-6, 8, -4], scale: [0.6, 1, 0.8] }}
                transition={{ duration: 2.4, delay: particle.delay, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
              />
            ))}
          </div>
          <motion.div
            className="intro-logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          >
            N
          </motion.div>
          <motion.div className="intro-brand" aria-label={brandName}>
            {letters.map((letter, index) => (
              <motion.span
                key={`${letter}-${index}`}
                initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.34, delay: 0.66 + index * 0.035, ease: "easeOut" }}
              >
                {letter === " " ? "\u00a0" : letter}
              </motion.span>
            ))}
          </motion.div>
          <motion.p className="intro-tagline" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 1.35 }}>
            {tagline}
          </motion.p>
          <motion.div className="intro-progress" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 2.35, ease: [0.22, 1, 0.36, 1] }} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
