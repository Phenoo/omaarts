import Link from 'next/link';
import HeroCanvas from '../components/home/HeroCanvas';
import VerticalGallery from '../components/archive/VerticalGallery';
import AboutSnippet from '../components/home/AboutSnippet';
import ServicesSection from '../components/home/ServicesSection';
import VideoReel from '../components/home/VideoReel';
import Testimonials from '../components/home/Testimonials';
import ShopCTA from '../components/home/ShopCTA';
import CTASection from '../components/home/CTASection';
import EventsTicker from '../components/events/EventsTicker';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <main>
      <HeroCanvas />
      <div className="relative z-10">
        <VerticalGallery />
        <AboutSnippet />
        <VideoReel />
        <ServicesSection />
        <Testimonials />
        <EventsTicker />
        <ShopCTA />
        <CTASection />
      </div>
      <Footer />
    </main>
  );
}
