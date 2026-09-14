import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AUTOMEGA | Seguridad y control vial",
  description:
    "Conificación, señalización vial temporal y control del tránsito en Concepción y la Región del Biobío.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
