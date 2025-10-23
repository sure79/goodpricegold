export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "착한금니",
    "image": "https://goodgeumni.vercel.app/로고3.png",
    "description": "15년 전통의 믿을 수 있는 금니매입 서비스. 정확한 감정, 최고가 매입, 당일 입금 보장.",
    "url": "https://goodgeumni.vercel.app",
    "telephone": "010-6622-9774",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "KR",
      "addressRegion": "울산광역시",
      "addressLocality": "남구",
      "streetAddress": "삼산로 280, 착한금니 빌딩",
      "postalCode": "44705"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "35.5384",
      "longitude": "129.3114"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127"
    },
    "sameAs": [
      "http://pf.kakao.com/_xdTcxcn"
    ]
  }

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "금니 매입 서비스",
    "provider": {
      "@type": "LocalBusiness",
      "name": "착한금니"
    },
    "areaServed": {
      "@type": "Country",
      "name": "대한민국"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "금니 매입 서비스",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "금니 매입",
            "description": "18K, 14K, 24K 금니 최고가 매입"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "금니 감정",
            "description": "정확한 금니 감정 서비스"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "당일 입금",
            "description": "감정 완료 후 당일 입금 보장"
          }
        }
      ]
    }
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "홈",
        "item": "https://goodgeumni.vercel.app"
      }
    ]
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "착한금니",
    "url": "https://goodgeumni.vercel.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://goodgeumni.vercel.app/?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
    </>
  )
}
