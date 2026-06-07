import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinWel — Controle Financeiro",
  description: "Seu painel de controle financeiro pessoal",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '512x512', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full" style={{ background: '#0a0f1e' }}>{children}</body>
    </html>
  );
}
