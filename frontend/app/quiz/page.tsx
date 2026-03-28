'use client';

import { useState } from 'react';
import AuthScreen            from '@/components/quiz/AuthScreen';
import ConfirmDetailsScreen  from '@/components/quiz/ConfirmDetailsScreen';
import QuizForm              from '@/components/quiz/QuizForm';

interface Confirmed {
  nusId:   string;
  faculty: string;
  race:    string;
}

export default function QuizPage() {
  const [nusId,     setNusId]     = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);

  if (!nusId) {
    return <AuthScreen onAuth={setNusId} />;
  }

  if (!confirmed) {
    return (
      <ConfirmDetailsScreen
        nusId={nusId}
        onConfirm={(faculty, race) => setConfirmed({ nusId, faculty, race })}
      />
    );
  }

  return <QuizForm nusId={confirmed.nusId} faculty={confirmed.faculty} race={confirmed.race} />;
}
