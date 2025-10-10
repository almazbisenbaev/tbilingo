'use client';

import React from 'react';
import GenericCourse from '@/features/course/components/GenericCourse';

export default function MedicalPage() {
  return (
    <GenericCourse 
      courseId="phrases-medical"
      courseTitle="Medical & Health"
      courseDescription="Important Georgian phrases for medical situations and health"
    />
  );
}