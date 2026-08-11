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
};

export function lodgingBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LodgingBusiness", "BedAndBreakfast", "TouristAttraction"],
        "@id": `${SITE.url}/#lodging`,
        name: SITE.name,
        legalName: SITE.legalName,
        description: SITE.description,
        url: SITE.url,
        telephone: SITE.telephone,
        email: SITE.email,
        priceRange: SITE.priceRange,
        numberOfRooms: 2,
        checkinTime: "14:00",
        checkoutTime: "11:00",
        petsAllowed: false,
        additionalType: "https://en.wikipedia.org/wiki/Kath-Kuni",
        knowsAbout: [
          "Kathkuni Architecture",
          "Naggar Heritage & History",
          "Himachali Cuisine & Siddu",
          "Kullu Valley Stargazing",
          "Deodar Wood Architecture",
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
          "Kathkuni heritage architecture",
          "On-site café",
          "Himachali home-cooked meals",
          "Apple orchard",
          "Mountain valley views",
          "Bonfire & stargazing",
          "Creative work corner",
          "Whole-home & private-room stays",
        ].map((name) => ({ "@type": "LocationFeatureSpecification", name })),
      },
      {
        "@type": ["CafeOrCoffeeShop", "FoodEstablishment"],
        "@id": `${SITE.url}/#cafe`,
        name: "House of Hulda Café",
        servesCuisine: "Himachali",
        url: `${SITE.url}/#the-table`,
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
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE.url}${item.url}`,
    })),
  };
}
