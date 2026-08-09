import { useContext } from 'react';
import { LenisContext } from '@/components/providers/LenisProvider';

export const useLenis = () => useContext(LenisContext);
