import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinguaPlan — Inglizchani A1 → C1 kosmik reja bilan",
  description:
    "Darajani aniqlaydi, maqsad + muddat realligini halol hisoblaydi, har kuni unikal interaktiv vazifalar beradi. Zeriksangiz — o'yin taklif qiladi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="cosmos-bg min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
