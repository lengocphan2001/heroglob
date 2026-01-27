'use client';

import { Suspense } from 'react';
import { RefCapture } from './RefCapture';

export function RefCaptureWrapper() {
  return (
    <Suspense fallback={null}>
      <RefCapture />
    </Suspense>
  );
}
