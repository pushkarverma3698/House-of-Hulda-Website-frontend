import type { Metadata } from "next";
import { SITE, lodgingBusinessJsonLd } from "@/lib/schema";
import { CinematicExperience } from "@/components/film/CinematicExperience";

export const metadata: Metadata = {
  title: "House of Hulda — Heritage Homestay & Café in Naggar, Manali",
  description:
    "Stay in a century-old kathkuni stone-and-deodar home in Naggar, near Manali. Private rooms, an attic café, Himachali home-cooked meals & valley views at 2,000m. Book direct.",
  keywords: [
    "House of Hulda",
    "homestay in Naggar",
    "Naggar Manali homestay",
    "kathkuni heritage stay",
    "café in Naggar",
    "Himachali food Naggar",
    "workation Himachal",
    "budget stay near Manali",
    "creative retreat Manali",
    "things to do in Naggar",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE.url,
    siteName: SITE.name,
    title: "House of Hulda Manali — Somewhere above the noise, a light is on.",
    description:
      "Stay in a century-old kathkuni stone-and-deodar home in Naggar, near Manali. Private rooms, an attic café, Himachali home-cooked meals & valley views at 2,000m.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "House of Hulda at golden hour, Naggar, Manali" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "House of Hulda Manali — Heritage Homestay & Café in Naggar",
    description:
      "Stay in a century-old kathkuni stone-and-deodar home in Naggar, near Manali. Private rooms, an attic café, Himachali home-cooked meals & valley views at 2,000m.",
    images: ["/og.jpg"],
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(lodgingBusinessJsonLd()) }}
      />
      <CinematicExperience />
    </>
  );
}
