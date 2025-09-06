import { Header } from "@/components/header"
import { ItemDetails } from "@/components/item-details"
import { Footer } from "@/components/footer"
import {
  generateSEOMetadata,
  generateProductStructuredData,
  generateBreadcrumbStructuredData,
} from "@/components/seo-head"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // In a real app, you would fetch the item data here
  const itemId = params.id

  // Mock item data - replace with actual API call
  const mockItem = {
    id: itemId,
    title: "Professional DSLR Camera",
    description:
      "High-quality Canon EOS R5 camera perfect for photography and videography. Includes lens kit and accessories.",
    price: 45,
    image: "/camera-rental.jpg",
    category: "Electronics & Cameras",
    location: "San Francisco, CA",
    condition: "Like New",
    brand: "Canon",
  }

  return generateSEOMetadata({
    title: `${mockItem.title} - Rent for $${mockItem.price}/day`,
    description: `${mockItem.description} Available for rent in ${mockItem.location}. Book now on Krili.`,
    keywords: [
      mockItem.title.toLowerCase(),
      mockItem.category.toLowerCase(),
      mockItem.brand?.toLowerCase(),
      "rental",
      "rent",
      mockItem.location.toLowerCase(),
    ],
    image: mockItem.image,
    url: `/item/${itemId}`,
    type: "product",
  })
}

export default function ItemPage({ params }: { params: { id: string } }) {
  // Mock item data - replace with actual API call
  const mockItem = {
    id: params.id,
    title: "Professional DSLR Camera",
    description:
      "High-quality Canon EOS R5 camera perfect for photography and videography. Includes lens kit and accessories.",
    price: 45,
    currency: "USD",
    image: "/camera-rental.jpg",
    category: "Electronics & Cameras",
    location: "San Francisco, CA",
    condition: "Used",
    availability: "InStock",
    brand: "Canon",
  }

  return (
    <div className="min-h-screen bg-background">
      {generateProductStructuredData({
        name: mockItem.title,
        description: mockItem.description,
        image: `https://krili.com${mockItem.image}`,
        price: mockItem.price,
        currency: mockItem.currency,
        availability: mockItem.availability,
        condition: mockItem.condition,
        brand: mockItem.brand,
        category: mockItem.category,
        location: mockItem.location,
      })}

      {generateBreadcrumbStructuredData([
        { name: "Home", url: "/" },
        { name: "Browse", url: "/browse" },
        { name: mockItem.category, url: `/browse?category=${encodeURIComponent(mockItem.category)}` },
        { name: mockItem.title, url: `/item/${params.id}` },
      ])}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RentAction",
            object: {
              "@type": "Product",
              name: mockItem.title,
              description: mockItem.description,
            },
            price: mockItem.price,
            priceCurrency: mockItem.currency,
            availability: `https://schema.org/${mockItem.availability}`,
            location: {
              "@type": "Place",
              name: mockItem.location,
            },
          }),
        }}
      />

      <Header />
      <main>
        <ItemDetails itemId={params.id} />
      </main>
      <Footer />
    </div>
  )
}
