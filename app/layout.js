import './globals.css';
import LenisProvider from '../components/LenisProvider';
import CustomCursor from '../components/CustomCursor';
import ColorMorphProvider from '../components/ColorMorphProvider';
import CartDrawer from '../components/CartDrawer';
import { CartProvider } from '../context/CartContext';

export const metadata = {
  metadataBase: new URL('https://houseofhulda.com'),
  title: 'House of Hulda — Luxury Himalayan Homestay in Naggar, Himachal Pradesh',
  description: 'Award-winning mountain homestay nestled in Naggar, Himachal Pradesh. Experience luxury in a handcrafted wooden home at 6000 ft with modern amenities. Book your Himalayan retreat today.',
  keywords: 'Naggar homestay, Himachal Pradesh accommodation, luxury mountain retreat, Kullu Valley homestay, Himalayan stay, trekking base camp, Manali nearby, House of Hulda',
  authors: [{ name: 'House of Hulda' }],
  creator: 'House of Hulda',
  publisher: 'House of Hulda',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'House of Hulda — Luxury Himalayan Homestay in Naggar',
    description: 'Experience the magic of the Himalayas. Award-winning homestay with modern amenities, trekking access, and mountain views in Naggar.',
    type: 'website',
    locale: 'en_IN',
    url: 'https://houseofhulda.com',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1200',
        width: 1200,
        height: 630,
        alt: 'House of Hulda - Mountain Homestay in Naggar',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'House of Hulda — Himalayan Homestay',
    description: 'Luxury mountain retreat in Naggar. Book your mountain escape today.',
    creator: '@houseofhulda',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1200'],
  },
  alternates: {
    canonical: 'https://houseofhulda.com',
  },
};

export default function RootLayout({ children }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': 'https://houseofhulda.com/#business',
        name: 'House of Hulda',
        description: 'Award-winning luxury Himalayan homestay in Naggar, Himachal Pradesh',
        url: 'https://houseofhulda.com',
        telephone: '+91-828-408-8838',
        email: 'hello@houseofhulda.com',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'IN',
          addressRegion: 'Himachal Pradesh',
          addressLocality: 'Naggar',
          postalCode: '175201',
          streetAddress: 'Naggar, Kullu Valley',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 32.2099,
          longitude: 77.1857,
          elevation: '6000m',
        },
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=600',
        priceRange: '₹₹₹',
        areaServed: 'Naggar, Kullu Valley, Himachal Pradesh',
        amenityFeature: ['WiFi', 'Kitchen', 'Heating', 'Mountain View', 'Trekking Access'],
      },
      {
        '@type': 'Organization',
        '@id': 'https://houseofhulda.com/#organization',
        name: 'House of Hulda',
        url: 'https://houseofhulda.com',
        logo: 'https://houseofhulda.com/logo.png',
        description: 'Luxury Himalayan homestay offering curated mountain retreats',
        sameAs: ['https://www.instagram.com/houseofhulda', 'https://www.facebook.com/houseofhulda'],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://houseofhulda.com/#website',
        url: 'https://houseofhulda.com',
        name: 'House of Hulda',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://houseofhulda.com/?s={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="canonical" href="https://houseofhulda.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="theme-color" content="#1a1410" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <CartProvider>
          <LenisProvider>
            <CustomCursor />
            <ColorMorphProvider />
            <CartDrawer />
            {children}
          </LenisProvider>
        </CartProvider>
      </body>
    </html>
  );
}
