import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'STAMP — AI Provenance on Monad',
  description:
    'A creator platform where every AI-generated file carries a verifiable, tamper-proof origin stored on Monad and indexed by Envio.',
  openGraph: {
    title: 'STAMP',
    description: 'Invisible watermarks. On-chain provenance. Verify AI content anywhere.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased min-h-screen bg-black text-[#ededed]`}>
        <Navbar />
        <main>{children}</main>
        <footer className="border-t border-zinc-900 py-12 px-6 text-center text-xs text-zinc-500">
          <p>
            STAMP · Built for{' '}
            <a
              href="https://monad.xyz/developers/hackathons/metropolis"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-300 hover:text-white transition-colors"
            >
              Monad Metropolis
            </a>{' '}
            · Track 04 + Envio
          </p>
        </footer>
      </body>
    </html>
  );
}
