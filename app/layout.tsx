import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'India Release & Royalty Advance Simulator',
  description: 'Model advance asks, required performance, and launch spend for Indian music releases.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
