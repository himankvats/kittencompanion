/**
 * Root layout for the Kitten Companion Next.js app.
 * Wraps all pages with the shared HTML/body structure and global metadata.
 * See TDD Section 12.1 for frontend architecture overview.
 */

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kitten Companion',
  description: 'Track your new cat\'s health during their first 4 months at home.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {/* TODO: Add navigation bar component once auth state is available */}
        <main>{children}</main>
        {/* TODO: Add footer component */}
      </body>
    </html>
  );
}
