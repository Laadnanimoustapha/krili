import type { Metadata } from "next"

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: "website" | "article" | "product"
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
}

export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  image = "/og-image.jpg",
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
}: SEOProps): Metadata {
  const baseUrl = "https://krili.com"
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl
  const fullTitle = title ? `${title} | Krili` : "Krili - Rent Anything, Anytime"
  const defaultDescription =
    "The ultimate peer-to-peer rental marketplace. Rent or list anything from tools to electronics, vehicles to equipment."

  return {
    title: fullTitle,
    description: description || defaultDescription,
    keywords: [...keywords, "rental marketplace", "peer-to-peer rental", "krili"],
    openGraph: {
      type: type as any,
      locale: "en_US",
      url: fullUrl,
      title: fullTitle,
      description: description || defaultDescription,
      siteName: "Krili",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title || "Krili - Peer-to-Peer Rental Marketplace",
        },
      ],
      ...(type === "article" && {
        publishedTime,
        modifiedTime,
        authors: author ? [author] : undefined,
        section,
        tags,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: description || defaultDescription,
      images: [image],
      creator: "@krili_app",
    },
    alternates: {
      canonical: fullUrl,
    },
  }
}

// Utility function for generating structured data
export function generateStructuredData(type: string, data: any) {
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(baseStructuredData),
      }}
    />
  )
}

// Common structured data generators
export const generateProductStructuredData = (product: {
  name: string
  description: string
  image: string
  price: number
  currency: string
  availability: string
  condition: string
  brand?: string
  category?: string
  location?: string
}) => {
  return generateStructuredData("Product", {
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`,
      itemCondition: `https://schema.org/${product.condition}Condition`,
    },
    brand: product.brand
      ? {
          "@type": "Brand",
          name: product.brand,
        }
      : undefined,
    category: product.category,
    locationCreated: product.location
      ? {
          "@type": "Place",
          name: product.location,
        }
      : undefined,
  })
}

export const generateBreadcrumbStructuredData = (breadcrumbs: Array<{ name: string; url: string }>) => {
  return generateStructuredData("BreadcrumbList", {
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `https://krili.com${crumb.url}`,
    })),
  })
}

export const generateLocalBusinessStructuredData = () => {
  return generateStructuredData("LocalBusiness", {
    name: "Krili",
    description: "Peer-to-peer rental marketplace",
    url: "https://krili.com",
    telephone: "+1-555-KRILI",
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Rental Street",
      addressLocality: "San Francisco",
      addressRegion: "CA",
      postalCode: "94102",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "37.7749",
      longitude: "-122.4194",
    },
    openingHours: "Mo-Su 00:00-23:59",
    sameAs: ["https://twitter.com/krili_app", "https://facebook.com/krili", "https://instagram.com/krili_app"],
  })
}
