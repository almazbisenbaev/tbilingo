'use client';

import React from 'react';
import PhrasesCourse from '@/components/PhrasesCourse/PhrasesCourse';

export default function MedicalPage() {
  return (
    <PhrasesCourse 
      courseId="phrases-medical"
      courseTitle="Medical & Health"
      courseDescription="Important Georgian phrases for medical situations and health"
    />
  );
}