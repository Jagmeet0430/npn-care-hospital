"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { TestimonialRecord } from "@/lib/testimonials";

type TestimonialSliderProps = {
  testimonials: TestimonialRecord[];
};

export function TestimonialSlider({ testimonials }: TestimonialSliderProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const touchStart = useRef<number | null>(null);
  const visibleTestimonials = useMemo(() => testimonials.filter((item) => item.published && item.consent), [testimonials]);

  useEffect(() => {
    if (visibleTestimonials.length <= 1 || paused) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setActive((current) => (current + 1) % visibleTestimonials.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [paused, visibleTestimonials.length]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") goTo(active + 1, 1);
      if (event.key === "ArrowLeft") goTo(active - 1, -1);
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [active, visibleTestimonials.length]);

  function goTo(index: number, nextDirection = 1) {
    if (!visibleTestimonials.length) return;
    setDirection(nextDirection);
    setActive((index + visibleTestimonials.length) % visibleTestimonials.length);
  }

  if (!visibleTestimonials.length) {
    return (
      <article className="testimonial-placeholder">
        <h3>Patient stories will be published here soon.</h3>
        <p>Our patients&apos; experiences and recovery journeys will appear after verification.</p>
      </article>
    );
  }

  const story = visibleTestimonials[active];

  return (
    <div
      className="testimonial-slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0]?.clientX ?? null;
        setPaused(true);
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        touchStart.current = null;
        setPaused(false);
        if (start === null) return;
        const delta = (event.changedTouches[0]?.clientX ?? start) - start;
        if (Math.abs(delta) > 44) goTo(active + (delta < 0 ? 1 : -1), delta < 0 ? 1 : -1);
      }}
      tabIndex={0}
      aria-label="Patient testimonial slider"
    >
      {visibleTestimonials.length > 1 ? (
        <button className="testimonial-nav previous" type="button" aria-label="Previous testimonial" onClick={() => goTo(active - 1, -1)}>
          <ChevronLeft size={18} />
        </button>
      ) : null}

      <article className={`card testimonial-slide ${direction < 0 ? "from-left" : "from-right"}`} key={story.id}>
        <div className="quick-contact" aria-label={`${story.rating} star rating`}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} size={17} fill={index < story.rating ? "#D4AF37" : "transparent"} color="#D4AF37" />
          ))}
        </div>
        <div className="testimonial-profile">
          <h3>{story.patientName}</h3>
          <span>{story.city || "N.P.N. Care Patient"}</span>
        </div>
        <strong>{story.treatment}</strong>
        <p>&quot;{story.review}&quot;</p>
      </article>

      {visibleTestimonials.length > 1 ? (
        <button className="testimonial-nav next" type="button" aria-label="Next testimonial" onClick={() => goTo(active + 1, 1)}>
          <ChevronRight size={18} />
        </button>
      ) : null}

      {visibleTestimonials.length > 1 ? (
        <div className="testimonial-dots" aria-label="Choose testimonial">
          {visibleTestimonials.map((item, index) => (
            <button
              className={index === active ? "active" : ""}
              type="button"
              key={item.id}
              aria-label={`Show testimonial ${index + 1}`}
              aria-current={index === active}
              onClick={() => goTo(index, index > active ? 1 : -1)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
