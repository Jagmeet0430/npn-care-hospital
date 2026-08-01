import type { ReactNode } from "react";
import clsx from "clsx";
import { Reveal } from "@/components/Motion";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  text?: string;
  className?: string;
  children: ReactNode;
};

export function Section({ id, eyebrow, title, text, className, children }: SectionProps) {
  return (
    <section id={id} className={clsx("section", className)}>
      <Reveal className="section-heading">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        {title ? <h2>{title}</h2> : null}
        {text ? <p>{text}</p> : null}
      </Reveal>
      <Reveal className="section-body-reveal" delay={0.08}>
        {children}
      </Reveal>
    </section>
  );
}
