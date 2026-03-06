'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQAccordion({ faqs }: { faqs: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-wiki-border border border-wiki-border rounded-lg">
      {faqs.map((faq, i) => (
        <div key={i}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-wiki-text hover:bg-wiki-bg-alt transition-colors"
          >
            <span>{faq.question}</span>
            <ChevronDown
              className={`w-4 h-4 shrink-0 ml-2 text-wiki-text-muted transition-transform ${
                openIndex === i ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openIndex === i && (
            <div className="px-4 pb-3 text-sm text-wiki-text-muted leading-relaxed">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
