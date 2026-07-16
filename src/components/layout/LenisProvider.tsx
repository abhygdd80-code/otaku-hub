'use client';

import { useLenis } from '@/hooks/useLenis';
import React from 'react';

interface LenisProviderProps {
  children: React.ReactNode;
}

const LenisProvider: React.FC<LenisProviderProps> = ({ children }) => {
  useLenis(); // Initialize lenis

  return <>{children}</>;
};

export default LenisProvider;
