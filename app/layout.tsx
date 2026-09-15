import type { Metadata } from "next";
import "./globals.css";
import "./design-upgrade.css";
import MotionEnhancements from "@/components/motion-enhancements";

export const metadata: Metadata = {
  title: "AUTOMEGA SpA | Seguridad y control vial",
  description:
    "AUTOMEGA SpA: conificación, señalización vial temporal y control del tránsito en Concepción y la Región del Biobío.",
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
      <body className="antialiased">{children}<MotionEnhancements /></body>
    </html>
  );
}
