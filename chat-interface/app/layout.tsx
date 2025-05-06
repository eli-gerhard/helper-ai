import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LLM Chat Interface',
  description: 'A modular chat interface for LLMs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[var(--background)] text-[var(--foreground)]">{children}</body>
    </html>
  );
}