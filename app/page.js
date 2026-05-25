import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Rooms from '@/components/Rooms';
import Experience from '@/components/Experience';
import ParallaxDivider from '@/components/ParallaxDivider';
import Marketplace from '@/components/Marketplace';
import Testimonials from '@/components/Testimonials';
import Gallery from '@/components/Gallery';
import Story from '@/components/Story';
import Blog from '@/components/Blog';
import BookingForm from '@/components/BookingForm';
import Footer from '@/components/Footer';
import MountainParallax from '@/components/MountainParallax';

export default function Home() {
  return (
    <>
      <Navbar />
      <MountainParallax>
        <Hero />
      </MountainParallax>

      <main>
        <About />
        <Story />
        <Rooms />
        <Experience />
        <ParallaxDivider />
        <Marketplace />
        <Testimonials />
        <Gallery />
        <Blog />
        <BookingForm />
      </main>

      <Footer />
    </>
  );
}
