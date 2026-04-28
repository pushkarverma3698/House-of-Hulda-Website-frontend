import './globals.css';
import LenisProvider from '../components/LenisProvider';

export const metadata = {
  title: 'House of Hulda — A Mountain Retreat in Naggar, Himachal Pradesh',
  description: 'A handcrafted mountain homestay nestled in the ancient village of Naggar, Himachal Pradesh. Where the Himalayas meet warmth, wood and wonder.',
  keywords: 'homestay, naggar, himachal pradesh, mountain retreat, kullu valley, himalayan stay, house of hulda',
  openGraph: {
    title: 'House of Hulda — Mountain Retreat in Naggar',
    description: 'Experience the magic of the Kullu Valley from a handcrafted wooden home in the clouds.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
