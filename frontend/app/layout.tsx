import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: '共有カレンダー',
  description: '共有カレンダー Web アプリ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
