import type { Metadata } from 'next';
import Image from 'next/image';
import Footer from '@/components/Footer';
import PrivateEventForm from '@/components/forms/PrivateEventForm';
import JsonLd from '@/components/JsonLd';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Private Events | Hosted Creative Sessions in Awka',
  description: 'Plan birthdays, date nights, bridal groups, girls’ nights, team sessions, school groups, and private studio hire with Artsy by Oma in Awka.',
  alternates: { canonical: '/private-events' },
  openGraph: { title: 'Private Events | Artsy by Oma', description: 'Hosted creative gatherings in Awka for celebrations, teams, and private groups.', url: '/private-events', images: [{ url: '/images/studio/IMG_0887.png', alt: 'Paint-and-sip tables inside the Artsy by Oma studio' }] },
};

const eventFormats = ['Birthdays', 'Date nights', "Bridal groups", "Girls' nights", 'Team and corporate sessions', 'Community and school groups', 'Private studio hire'];

export default function PrivateEventsPage() {
  const localBusiness = { '@context': 'https://schema.org', '@type': 'LocalBusiness', name: SITE.name, url: SITE.url, email: SITE.email, telephone: SITE.phoneDisplay, areaServed: { '@type': 'City', name: 'Awka' }, address: { '@type': 'PostalAddress', addressLocality: 'Awka', addressRegion: 'Anambra', addressCountry: 'NG' } };
  const breadcrumb = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` }, { '@type': 'ListItem', position: 2, name: 'Private events', item: `${SITE.url}/private-events` }] };
  return <main id="main-content" className="site-main"><JsonLd data={localBusiness} /><JsonLd data={breadcrumb} /><div className="page-shell"><header className="page-intro page-intro--wide"><p className="eyebrow">Private events</p><h1>Make room for a good kind of mess.</h1><p>Artsy by Oma hosts creative gatherings that feel personal, relaxed, and thoughtfully prepared — from birthdays and date nights to team sessions and private studio hire in Awka.</p></header><div className="event-page-grid"><div><div className="event-photo-grid"><div className="event-photo event-photo--wide"><Image src="/images/studio/IMG_0887.png" alt="Paint-and-sip tables inside the Artsy by Oma studio" fill sizes="(max-width: 900px) 92vw, 60vw" className="object-cover" priority /></div><div className="event-photo"><Image src="/images/studio/IMG_0889.png" alt="Seating and artwork inside the Artsy by Oma studio" fill sizes="30vw" className="object-cover" /></div><div className="event-photo"><Image src="/images/studio/IMG_0890.png" alt="The colorful mural and creative setup inside the studio" fill sizes="30vw" className="object-cover" /></div></div><section className="content-section"><p className="eyebrow">Formats</p><h2>Choose the shape of the day.</h2><div className="format-list">{eventFormats.map((item, index) => <div key={item}><span>0{index + 1}</span><strong>{item}</strong></div>)}</div></section><section className="content-section"><p className="eyebrow">How it works</p><h2>From first message to studio day.</h2><ol className="steps-list"><li><span>01</span><p>Share your preferred date, group size, and what you have in mind.</p></li><li><span>02</span><p>We suggest an activity mix, timing, and setup that fits your group.</p></li><li><span>03</span><p>Once details are confirmed, we prepare the studio and send your booking notes.</p></li></ol></section></div><aside className="form-panel"><PrivateEventForm /></aside></div></div><Footer /></main>;
}
