import type { Metadata } from "next";
import { SITE } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Reserve Your Stay — House of Hulda | Naggar Heritage Homestay",
  description:
    "Check availability and reserve your stay at House of Hulda, Naggar. Choose from private kathkuni rooms, the attic-loft, or the whole heritage home. Best rates guaranteed direct.",
  alternates: { canonical: "/book" },
  openGraph: {
    title: "Reserve Your Stay — House of Hulda | Naggar Heritage Homestay",
    description: "Reserve your stay at House of Hulda, Naggar. Choose from private kathkuni rooms, the attic-loft, or the whole heritage home. Best rates guaranteed direct.",
    url: `${SITE.url}/book`,
    images: [{ url: "/images/arrival-golden-hour.jpg", width: 1200, height: 630, alt: "Arrival at House of Hulda during golden hour" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reserve Your Stay — House of Hulda | Naggar Heritage Homestay",
    description: "Reserve your stay at House of Hulda, Naggar. Choose from private kathkuni rooms, the attic-loft, or the whole heritage home. Best rates guaranteed direct.",
    images: ["/images/arrival-golden-hour.jpg"],
  },
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
