'use client';

import React from 'react';
import GenericCourse from '@/features/course/components/GenericCourse';

export default function WeatherPage() {
  return (
    <GenericCourse 
      courseId="phrases-weather"
      courseTitle="Weather & Seasons"
      courseDescription="Georgian phrases about weather, seasons, and climate"
    />
  );
}