import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Streamline — Development Dashboard',
  description: 'Browser-based live video streaming platform development foundation'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
