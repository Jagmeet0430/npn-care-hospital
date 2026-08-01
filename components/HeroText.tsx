"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Award, CalendarCheck } from "lucide-react";

type HeroTextProps = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryButton: string;
  };
};

const easeOut = [0.16, 1, 0.3, 1] as const;

export function HeroText({ hero }: HeroTextProps) {
  const reduceMotion = useReducedMotion();

  return (
    <>
      <motion.div
        className="hero-image-layer"
        aria-hidden="true"
        initial={reduceMotion ? false : { opacity: 0, x: 56, scale: 1.03 }}
        animate={reduceMotion ? undefined : { opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: easeOut }}
      />
      <div className="hero-content">
        <motion.span
          className="eyebrow hero-certification-badge"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.46, ease: easeOut, delay: 0.08 }}
        >
          <Award size={16} />
          {hero.eyebrow}
        </motion.span>
        <motion.h1
          className="hero-title"
          initial={reduceMotion ? false : { opacity: 0, y: 34 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.64, ease: easeOut, delay: 0.18 }}
        >
          {hero.title}
        </motion.h1>
        <motion.p
          className="lead hero-lead"
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.58, ease: easeOut, delay: 0.3 }}
        >
          {hero.subtitle}
        </motion.p>
        <motion.div
          className="hero-actions"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
          animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.48, ease: easeOut, delay: 0.42 }}
        >
          <Link className="button button-primary hero-cta-button" href="#appointment">
            <CalendarCheck size={22} />
            {hero.primaryButton}
          </Link>
        </motion.div>
      </div>
    </>
  );
}
