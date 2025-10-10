'use client';

import React from 'react';
import GenericCourse from '@/features/course/components/GenericCourse';

export default function CulturePage() {
  return (
    <GenericCourse 
      courseId="phrases-culture"
      courseTitle="Culture & Traditions"
      courseDescription="Georgian phrases about culture, traditions, and customs"
    />
  );
}