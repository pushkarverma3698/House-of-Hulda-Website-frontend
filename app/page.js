import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Rooms from '@/components/Rooms';
import Experience from '@/components/Experience';
import ParallaxDivider from '@/components/ParallaxDivider';
import Testimonials from '@/components/Testimonials';
import Gallery from '@/components/Gallery';
import BookingCTA from '@/components/BookingCTA';
import Footer from '@/components/Footer';
import MountainParallax from '@/components/MountainParallax';

export default function Home() {
  return (
    <>
      <Navbar />
      <MountainParallax>
        {/* Hero text overlays the mountain scene (position: absolute inside scene) */}
        <Hero />
      </MountainParallax>

      {/* Content sections flow normally below the scene */}
      <main>
        <About />
        <Rooms />
        <Experience />
        <ParallaxDivider />
        <Testimonials />
        <Gallery />
        <BookingCTA />
      </main>

      <Footer />
    </>
  );
}
