import type { Metadata } from 'next';
import './styles/globals.css';

export const metadata: Metadata = {
  title: 'AI Knowledge Copilot',
  description: 'A modern document-grounded assistant with dark, focused knowledge workflows',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
