"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { CmsContent } from "@/lib/cms";

type FaqAccordionProps = {
  faqs: CmsContent["faqs"];
};

export function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [open, setOpen] = useState(0);

  return (
    <div className="faq-accordion">
      {faqs.map((faq, index) => (
        <article className={open === index ? "faq-row open" : "faq-row"} key={faq.q}>
          <button type="button" onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}>
            <span>{faq.q}</span>
            <ChevronDown size={20} />
          </button>
          <div className="faq-answer">
            <p>{faq.a}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
