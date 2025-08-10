import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My AI Project',
  description: 'Next.js + OpenAI + Pinecone',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}