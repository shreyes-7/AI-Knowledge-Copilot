import type { Metadata } from 'next';
import './styles/globals.css';

export const metadata: Metadata = {
  title: 'AI Knowledge Copilot',
  description: 'Production-grade RAG system with MongoDB Atlas Vector Search',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-light">
        {children}
      </body>
    </html>
  );
}
