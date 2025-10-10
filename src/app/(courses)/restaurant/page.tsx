'use client';

import React from 'react';
import GenericCourse from '@/features/course/components/GenericCourse';

export default function RestaurantPage() {
  return (
    <GenericCourse 
      courseId="phrases-restaurant"
      courseTitle="Restaurant & Food"
      courseDescription="Georgian phrases for dining, ordering food, and restaurants"
    />
  );
}