import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Plus_Jakarta_Sans, Noto_Sans } from "next/font/google";
import { AuthSessionHandler } from "@/components/auth-session-handler";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const notoSans = Noto_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lonchi - Lonches saludables para tu pequeño",
  description: "Comidas saludables listas en minutos para niños de kinder y primaria",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let messages;
  try {
    messages = await getMessages();
  } catch {
    messages = {};
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${plusJakarta.variable} ${notoSans.variable} font-[family-name:var(--font-display)] antialiased`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        <NextIntlClientProvider messages={messages}>
          <AuthSessionHandler />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
