import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
// import '../styles/globals.css';
import { Providers } from './provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PeerSync',
  description:
    'A smart platform for mentor-guided growth, AI-powered mock interviews, and peer-to-peer interactions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
