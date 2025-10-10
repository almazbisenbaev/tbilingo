'use client';

import React from 'react';
import GenericCourse from '@/features/course/components/GenericCourse';

export default function BusinessPage() {
  return (
    <GenericCourse 
      courseId="phrases-business"
      courseTitle="Business Georgian"
      courseDescription="Essential Georgian phrases for business and professional settings"
    />
  );
}