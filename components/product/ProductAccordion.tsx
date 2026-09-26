'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface AccordionSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface ProductAccordionProps {
  sections: AccordionSection[];
}

export function ProductAccordion({ sections }: ProductAccordionProps) {
  // Each starts collapsed, only one section open at a time
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setOpenSectionId((current) => (current === id ? null : id));
  };

  return (
    <div
      className="rounded-2xl divide-y divide-terracotta/15 overflow-hidden transition-all duration-300"
      style={{
        background: 'rgba(253, 248, 240, 0.6)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
      }}
    >
      {sections.map((section) => {
        const isOpen = openSectionId === section.id;

        return (
          <div key={section.id} className="transition-colors">
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              aria-expanded={isOpen}
              className="w-full py-5 px-6 sm:px-8 flex items-center justify-between text-left group transition-all"
            >
              <span className="font-serif text-lg sm:text-xl font-medium text-terracotta-dark group-hover:text-terracotta transition-colors duration-200">
                {section.title}
              </span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`p-1.5 rounded-full ${
                  isOpen
                    ? 'bg-terracotta/10 text-terracotta'
                    : 'text-terracotta-dark/60 group-hover:text-terracotta-dark group-hover:bg-cream-100'
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </button>

            {/* Smooth AnimatePresence height auto expansion */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: 'auto',
                    opacity: 1,
                    transition: {
                      height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.25, delay: 0.05, ease: 'easeOut' },
                    },
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                    transition: {
                      height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.2, ease: 'easeIn' },
                    },
                  }}
                  className="overflow-hidden"
                >
                  <div className="px-6 sm:px-8 pb-6 pt-1 text-sm leading-relaxed text-terracotta-dark/85">
                    {section.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
