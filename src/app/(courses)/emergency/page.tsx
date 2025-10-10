'use client';

import React from 'react';
import GenericCourse from '@/features/course/components/GenericCourse';

export default function EmergencyPage() {
  return (
    <GenericCourse 
      courseId="phrases-emergency"
      courseTitle="Emergency Situations"
      courseDescription="Critical Georgian phrases for emergency and urgent situations"
    />
  );
}