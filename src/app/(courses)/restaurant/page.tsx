'use client';

import React from 'react';
import PhrasesCourse from '@/components/PhrasesCourse/PhrasesCourse';

export default function RestaurantPage() {
  return (
    <PhrasesCourse 
      courseId="phrases-restaurant"
      courseTitle="Restaurant & Food"
      courseDescription="Georgian phrases for dining, ordering food, and restaurants"
    />
  );
}