/**
 * JSON-LD for the REAL product: a kathkuni heritage homestay AND a daytime café.
 * Emitted as an @graph so both the LodgingBusiness and the CafeOrCoffeeShop get
 * structured-data signal, plus an FAQPage for rich results.
 * NAP must match the Google Business Profile byte-for-byte at launch.
 * Real values live in ONE place — lib/site-config.ts — and flow in here.
 */
import { BUSINESS, COMMON_FAQ } from "@/lib/site-config";

export const SITE = {
  name: BUSINESS.name,
  legalName: BUSINESS.legalName,
  description:
    "Stay in a century-old kathkuni stone-and-deodar home in Naggar, near Manali. Private rooms, an attic café, Himachali home-cooked meals & valley views at 2,000m. Book direct.",
  url: BUSINESS.url,
  // E.164 form derived from the single source of truth.
  telephone: `+${BUSINESS.whatsappNumber}`,
  email: BUSINESS.email,
  address: {
    locality: BUSINESS.address.locality,
    region: BUSINESS.address.region,
    country: BUSINESS.address.country,
    postalCode: BUSINESS.address.postalCode,
  },
  geo: BUSINESS.geo,
  // ₹₹ = mid-range — accurate (private rooms + budget attic), avoids scaring budget search.
  priceRange: "₹₹",
} as const;

const postalAddress = {
  "@type": "PostalAddress",
  streetAddress: BUSINESS.address.line,
  addressLocality: SITE.address.locality,
  addressRegion: SITE.address.region,
  postalCode: SITE.address.postalCode,
  addressCountry: SITE.address.country,
};

const geoCoordinates = {
  "@type": "GeoCoordinates",
  latitude: SITE.geo.lat,
  longitude: SITE.geo.lng,
  elevation: 2180,
};

export function lodgingBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LodgingBusiness", "BedAndBreakfast", "TouristAttraction", "TouristDestination"],
        "@id": `${SITE.url}/#lodging`,
        name: SITE.name,
        legalName: SITE.legalName,
        description: SITE.description,
        url: SITE.url,
        telephone: SITE.telephone,
        email: SITE.email,
        priceRange: SITE.priceRange,
        currenciesAccepted: "INR",
        paymentAccepted: "Cash, UPI, Credit Card, Bank Transfer",
        numberOfRooms: 2,
        checkinTime: "14:00",
        checkoutTime: "11:00",
        petsAllowed: false,
        additionalType: "https://en.wikipedia.org/wiki/Kath-Kuni",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "48",
          bestRating: "5",
          worstRating: "1",
        },
        potentialAction: {
          "@type": "ReserveAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE.url}/book`,
            inLanguage: "en-IN",
            actionPlatform: [
              "http://schema.org/DesktopWebPlatform",
              "http://schema.org/MobileWebPlatform",
            ],
          },
          result: {
            "@type": "LodgingReservation",
            name: "House of Hulda Heritage Stay Reservation",
          },
        },
        knowsAbout: [
          "Kathkuni Architecture & Himalayan Masonry",
          "Naggar Heritage & Roerich Estate History",
          "Himachali Vernacular Cuisine & Siddu",
          "Kullu Valley Stargazing & Astrotourism",
          "Bortle Class 1 Dark Sky Astrophotography",
          "Chandrakhani Pass & Rumsu Alpine Trails",
          "Organic Himalayan Apple Orchard Farming",
          "Deodar Wood Vernacular Architecture",
          "Sharan Handloom Village Traditions",
        ],
        address: postalAddress,
        geo: geoCoordinates,
        hasMap: BUSINESS.mapsUrl,
        sameAs: [
          BUSINESS.social.instagram,
          BUSINESS.social.airbnb,
          BUSINESS.mapsUrl,
        ].filter(Boolean),
        amenityFeature: [
          "Kathkuni heritage architecture (stone and deodar wood, zero cement)",
          "200mm refractor balcony telescope & Bortle Class 1 dark sky stargazing",
          "Private organic apple orchard",
          "On-site café serving Himachali home-cooked meals & pour-overs",
          "High-speed fiber WiFi (100+ Mbps) throughout property",
          "Wood-fired bukhari heating & electric bed warmers",
          "Himalayan mountain & Kullu Valley view cedar balconies",
          "Creative work retreat spaces & ergonomic reading corners",
          "Evening fire-pit & stargazing circle",
          "Guided alpine trails to Rumsu village & Chandrakhani Pass",
          "Whole-home buyouts & private heritage room stays",
        ].map((name) => ({
          "@type": "LocationFeatureSpecification",
          name,
          value: true,
        })),
      },
      {
        "@type": ["CafeOrCoffeeShop", "FoodEstablishment"],
        "@id": `${SITE.url}/#cafe`,
        name: "House of Hulda Café",
        servesCuisine: "Himachali",
        url: `${SITE.url}/cafe`,
        priceRange: "₹",
        // TODO[launch]: set real café hours
        openingHours: "Mo-Su 09:00-18:00",
        address: postalAddress,
        geo: geoCoordinates,
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE.url}/#faq`,
        mainEntity: COMMON_FAQ.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE.url}${item.url}`,
    })),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: a,
      },
    })),
  };
}

export interface BlogPostingSchemaProps {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  keywords?: string;
  wordCount?: number;
  image?: string;
}

export function blogPostingJsonLd({
  slug,
  title,
  description,
  datePublished,
  dateModified,
  author,
  keywords,
  wordCount,
  image,
}: BlogPostingSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished: datePublished || undefined,
    dateModified: dateModified || datePublished || undefined,
    inLanguage: "en-IN",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE.url}/blog/${slug}`,
    },
    image: image || `${SITE.url}/og.jpg`,
    keywords,
    wordCount,
    articleSection: "Himalayan Travel, Heritage & Astrotourism",
    author: {
      "@type": "Person",
      name: author || "House of Hulda Heritage Host",
      jobTitle: "Heritage Host, Naturalist & Resident Field Guide",
      worksFor: {
        "@type": "LodgingBusiness",
        name: SITE.name,
        url: SITE.url,
      },
      description:
        "Local Himalayan heritage host, conservationist, and resident field guide at House of Hulda, Rumsu, Naggar (2,180m).",
      knowsAbout: [
        "Kathkuni Vernacular Architecture & Seismic Design",
        "Himalayan Dark Sky Astrophotography & Telescope Observations",
        "Rumsu Village & Chandrakhani Pass Alpine Trails",
        "Himachali Culinary Traditions & Apple Farming",
      ],
      sameAs: [BUSINESS.social.instagram, SITE.url].filter(Boolean),
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      logo: {
        "@type": "ImageObject",
        url: `${SITE.url}/og.jpg`,
        width: 1200,
        height: 630,
      },
      sameAs: [
        BUSINESS.social.instagram,
        BUSINESS.social.airbnb,
        BUSINESS.mapsUrl,
      ].filter(Boolean),
    },
  };
}
