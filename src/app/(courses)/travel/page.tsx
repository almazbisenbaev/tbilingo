'use client';

import React from 'react';
import GenericCourse from '@/features/course/components/GenericCourse';

export default function TravelPage() {
  return (
    <GenericCourse 
      courseId="phrases-travel"
      courseTitle="Travel Georgian"
      courseDescription="Useful phrases for traveling and tourism in Georgia"
    />
  );
}