import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Mulish } from "next/font/google";
import { lodgingBusinessJsonLd, SITE } from "@/lib/schema";
import { Analytics } from "@/components/Analytics";
import { WhatsappFab } from "@/components/ui/WhatsappFab";
import { Providers } from "@/app/providers";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-mulish",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "House of Hulda — Heritage Homestay & Café in Naggar, Manali",
    template: "%s · House of Hulda Manali",
  },
  description: SITE.description,
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
    description: SITE.description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "House of Hulda at golden hour, Naggar, Manali" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "House of Hulda Manali",
    description: SITE.description,
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0f17",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
  booking,
}: {
  children: React.ReactNode
  booking: React.ReactNode
}) {
  return (
    <html lang="en-IN" className={`${cormorant.variable} ${mulish.variable}`}>
      <body className="font-body bg-[#0a0f17] text-cream">
        <div className="film-grain" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(lodgingBusinessJsonLd()) }}
        />
        <Providers>
          <main id="scroll-wrapper" className="h-[100dvh] w-[100dvw] overflow-y-auto overflow-x-hidden relative">
            <div id="scroll-content">
              {children}
              {booking}
            </div>
          </main>
          <WhatsappFab />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
