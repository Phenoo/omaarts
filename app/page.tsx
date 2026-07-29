import Link from 'next/link';
import HeroCanvas from '../components/home/HeroCanvas';
import VerticalGallery from '../components/archive/VerticalGallery';
import AboutSnippet from '../components/home/AboutSnippet';
import FeaturedActivities from '../components/home/FeaturedActivities';
import FeaturedArtworks from '../components/home/FeaturedArtworks';
import VideoReel from '../components/home/VideoReel';
import Testimonials from '../components/home/Testimonials';
import ShopCTA from '../components/home/ShopCTA';
import CTASection from '../components/home/CTASection';
import EventsTicker from '../components/events/EventsTicker';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <main className="relative isolate">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-20 h-96 w-96 rounded-full bg-[var(--accent-purple)]/15 blur-3xl" />
        <div className="absolute top-[38%] -right-24 h-80 w-80 rounded-full bg-[var(--accent-orange)]/15 blur-3xl" />
      </div>
      <HeroCanvas />
      <div className="relative z-10">
        <VerticalGallery />
        <AboutSnippet />
        <VideoReel />
        <FeaturedActivities />
        <Testimonials />
        <EventsTicker />
        <FeaturedArtworks />
        <ShopCTA />
        <CTASection />
      </div>
      <Footer />
    </main>
  );
}
