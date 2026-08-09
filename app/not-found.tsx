import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/layout/Container';

export const metadata: Metadata = {
  title: '404 — Page Not Found',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Container>
        <div className="max-w-md mx-auto text-center space-y-6">
          <span className="text-8xl font-display font-extrabold text-accent block">
            404
          </span>
          <h1 className="text-2xl font-bold text-primary">LOST IN THE VOID</h1>
          <p className="text-sm text-secondary-text leading-relaxed">
            This page doesn&apos;t exist. It may have been discontinued or the
            link you followed is broken.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold text-sm tracking-wider uppercase transition-all"
          >
            Return Home
          </Link>
        </div>
      </Container>
    </div>
  );
}
