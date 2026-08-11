import type { Metadata } from "next";
import { SITE } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Book Your Stay — House of Hulda",
  description:
    "Check availability and reserve your stay at House of Hulda, Naggar. Choose from private kathkuni rooms, the attic-loft, or the whole heritage home.",
  alternates: { canonical: "/book" },
  openGraph: {
    title: "Book Your Stay — House of Hulda",
    description: "Reserve your stay at House of Hulda, Naggar. Choose from private kathkuni rooms, the attic-loft, or the whole heritage home.",
    url: `${SITE.url}/book`,
    images: [{ url: "/images/arrival-golden-hour.jpg", width: 1200, height: 630, alt: "Arrival at House of Hulda during golden hour" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book Your Stay — House of Hulda",
    description: "Reserve your stay at House of Hulda, Naggar. Choose from private kathkuni rooms, the attic-loft, or the whole heritage home.",
    images: ["/images/arrival-golden-hour.jpg"],
  },
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
