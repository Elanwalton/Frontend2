'use client';

import React, { Suspense } from 'react';
import CategoryProducts from '@/components/CategoryProducts';

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoryProducts />
    </Suspense>
  );
}
