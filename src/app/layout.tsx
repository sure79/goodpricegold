import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Chatbot from "@/components/common/Chatbot";
import KakaoSDKInit from "@/components/common/KakaoSDKInit";
import StructuredData from "@/components/seo/StructuredData";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://goodgeumni.vercel.app'),
  title: {
    default: "착한금니 - 대한민국 NO.1 금니 매입 전문",
    template: "%s | 착한금니"
  },
  description: "정확한 감정, 최고가 매입, 당일 입금. 15년 전통 금니매입 전문 업체 착한금니",
  keywords: ["금니매입", "금니", "금이빨", "금니시세", "금니가격", "금니매입업체", "금니매매", "치과금니", "금니팔기", "금니매입가격", "금니감정", "금니현금화", "중고금니", "금니업체", "금니전문", "착한금니"],
  authors: [{ name: "착한금니" }],
  creator: "착한금니",
  publisher: "착한금니",
  formatDetection: {
    telephone: true,
    email: false,
    address: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://goodgeumni.vercel.app',
    siteName: '착한금니',
    title: '착한금니 - 대한민국 NO.1 금니 매입 전문',
    description: '정확한 감정, 최고가 매입, 당일 입금. 15년 전통 금니매입 전문 업체 착한금니',
    images: [
      {
        url: '/logo3.png',
        width: 1200,
        height: 630,
        alt: '착한금니 로고',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '착한금니 - 대한민국 NO.1 금니 매입 전문',
    description: '정확한 감정, 최고가 매입, 당일 입금. 15년 전통 금니매입 전문 업체 착한금니',
    images: ['/logo3.png'],
  },
  verification: {
    // 구글 서치 콘솔 인증 코드
    google: 'O8cGyGYX28dEqMLB-hnF64sjV1-7cKYg-7lRqyIjRH4',
    // 네이버 웹마스터 인증 코드
    other: {
      'naver-site-verification': 'eb08f22b058526ddb90c357d6dc3840cd87d1915',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: '/favicon.svg'
  },
  alternates: {
    canonical: 'https://goodgeumni.vercel.app',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <StructuredData />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        {/* Google Ads (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17676135432"
          strategy="afterInteractive"
        />
        <Script id="google-ads" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17676135432');
          `}
        </Script>

        {children}
        <Chatbot />
        <KakaoSDKInit />
      </body>
    </html>
  );
}
// Build: 1761264377
