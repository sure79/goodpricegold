import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Chatbot from "@/components/common/Chatbot";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "착한금니 - 대한민국 NO.1 금니 매입 전문",
  description: "15년 전통의 믿을 수 있는 금니매입 서비스. 정확한 감정, 최고가 매입, 당일 입금 보장.",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: '/favicon.svg'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className} suppressHydrationWarning={true}>
        {children}
        <Chatbot />
      </body>
    </html>
  );
}
