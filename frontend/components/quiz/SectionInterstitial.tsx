'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

type InterstitialTrigger = 'personality-to-preferences' | 'preferences-to-accessibility';

interface Props {
  trigger: InterstitialTrigger;
  onComplete: () => void;
}

const content: Record<InterstitialTrigger, { title: string; subtext: string }> = {
  'personality-to-preferences': {
    title: "Now, let's talk practicalities.",
    subtext: 'A few quick questions about your living preferences.',
  },
  'preferences-to-accessibility': {
    title: 'Almost done.',
    subtext: 'One last thing before we wrap up.',
  },
};

export default function SectionInterstitial({ trigger, onComplete }: Props) {
  const { title, subtext } = content[trigger];

  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-cream-base flex flex-col items-center justify-center px-6 cursor-pointer"
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '-100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onClick={onComplete}
    >
      <p
        className="text-[1.75rem] italic text-ink-primary text-center mb-3"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </p>
      <p className="text-sm text-ink-muted text-center" style={{ fontFamily: 'var(--font-body)' }}>
        {subtext}
      </p>
    </motion.div>
  );
}
