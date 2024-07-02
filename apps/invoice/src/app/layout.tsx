import type { ReactNode } from 'react';

import { goodFont } from 'src/fonts';

import '../globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className={goodFont.className} lang="en">
      <body>{children}</body>
    </html>
  );
}
