import type { Metadata } from 'next';
import './globals.css';
import LenisProvider from '@/components/layout/LenisProvider';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'Otaku Hub',
  description: 'Premium anime streetwear e-commerce',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <Navbar />
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
