import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { Categories } from "@/components/categories"
import { Testimonials } from "@/components/testimonials"
import { ScrollReveal } from "@/components/scroll-reveal"
import { FloatingElements } from "@/components/floating-elements"
import { generateLocalBusinessStructuredData } from "@/components/seo-head"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "KRILI by Laadnani Mustapha | Rent Anything, Anytime",
  description:
    "Rent Anything, Anytime. The ultimate peer-to-peer rental marketplace. From power tools to party equipment, cameras to cars - find what you need or earn money from what you own.",
  keywords: [
    "rental marketplace",
    "peer-to-peer rental",
    "rent tools",
    "rent electronics",
    "equipment rental",
    "sharing economy",
    "rent anything",
    "local rentals",
    "community sharing",
    "earn money renting",
    "tool rental",
    "camera rental",
    "bike rental",
  ],
  openGraph: {
    title: "KRILI by Laadnani Mustapha",
    description:
      "Rent Anything, Anytime. The ultimate peer-to-peer rental marketplace. From power tools to party equipment, cameras to cars - find what you need or earn money from what you own.",
    images: [
      {
        url: "/og-preview.png",
        width: 1200,
        height: 630,
        alt: "KRILI - Rent Anything, Anytime",
      },
    ],
  },
  alternates: {
    canonical: "/",
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative">
      {generateLocalBusinessStructuredData()}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Krili",
            url: "https://krili.com",
            description: "The ultimate peer-to-peer rental marketplace",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://krili.com/browse?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
            sameAs: ["https://twitter.com/krili_app", "https://facebook.com/krili", "https://instagram.com/krili_app"],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Krili Rental Marketplace",
            description: "Peer-to-peer rental platform connecting renters with item owners",
            provider: {
              "@type": "Organization",
              name: "Krili",
            },
            serviceType: "Rental Marketplace",
            areaServed: "Worldwide",
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Rental Items",
              itemListElement: [
                {
                  "@type": "OfferCatalog",
                  name: "Tools & Equipment",
                },
                {
                  "@type": "OfferCatalog",
                  name: "Electronics & Cameras",
                },
                {
                  "@type": "OfferCatalog",
                  name: "Sports & Recreation",
                },
                {
                  "@type": "OfferCatalog",
                  name: "Vehicles & Transportation",
                },
              ],
            },
          }),
        }}
      />

      <FloatingElements />
      <Hero />
      <ScrollReveal direction="up" delay={100}>
        <Categories />
      </ScrollReveal>
      <ScrollReveal direction="up" delay={200}>
        <Features />
      </ScrollReveal>
      <ScrollReveal direction="up" delay={300}>
        <Testimonials />
      </ScrollReveal>
    </div>
  )
}
