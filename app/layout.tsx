import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'سیستەمی جەردی کەل و پەل',
  description: 'Inventory Evaluation System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ckb" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
