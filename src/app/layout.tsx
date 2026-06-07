import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinWel — Controle Financeiro",
  description: "Seu painel de controle financeiro pessoal",
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
