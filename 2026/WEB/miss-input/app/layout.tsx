import type { Metadata } from 'next';
import { Orbitron } from 'next/font/google';
import './globals.css';

const orbitron = Orbitron({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TACTICAL INPUT SYSTEM',
  description: 'AUTHORIZATION REQUIRED. DO NOT MISINPUT.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${orbitron.className} bg-black text-red-600 overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
