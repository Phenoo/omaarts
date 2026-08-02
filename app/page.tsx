import Image from 'next/image';
import Link from 'next/link';
import HeroCanvas from '../components/home/HeroCanvas';
import FeaturedActivities from '../components/home/FeaturedActivities';
import Footer from '../components/Footer';
import { SELECTED_WORKS } from '@/lib/selectedWorks';

const PRACTICE_AREAS = [
  {
    title: 'Original Works',
    description:
      'Paintings and studies for collectors, homes, hospitality spaces, and exhibitions.',
  },
  {
    title: 'Studio Experiences',
    description:
      'Paint-and-sip sessions, guided workshops, and private group bookings in Awka.',
  },
  {
    title: 'Commissions',
    description:
      'Custom pieces for interiors, gifting, launches, and brand-led collaborations.',
  },
];

const STUDIO_NOTES = [
  'Acrylic and mixed media',
  'Based in Awka, Nigeria',
  'Private commissions open',
  'Studio bookings available',
];

const EVENT_GALLERY = [
  '/images/events/IMG_6954.JPG',
  '/images/events/IMG_1305.JPG',
  '/images/events/IMG_4524.PNG',
  '/images/events/IMG_1376.JPG',
];

const PRIVATE_EVENT_FORMATS = [
  {
    title: 'Birthdays',
    description: 'Hosted paint sessions with room for food, cake, photos, and a full group setup.',
  },
  {
    title: 'Team Sessions',
    description: 'Creative bonding for teams, communities, schools, and brand-led gatherings.',
  },
  {
    title: 'Private Hire',
    description: 'Date nights, bridal groups, girls’ nights, and studio bookings tailored to your plan.',
  },
];

const PRIVATE_EVENT_STEPS = [
  'Share your date, group size, and event type.',
  'Choose your activity mix, timing, and setup.',
  'Receive confirmation and studio preparation details.',
];

export default function Home() {
  return (
    <main className="relative isolate overflow-hidden">
      <HeroCanvas />

      <div className="relative z-10">
        <section className="relative -mt-14 pb-8 md:-mt-20">
          <div className="section-shell max-w-[90vw] mx-auto p-6 md:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent-orange)]">
                  Practice
                </p>
                <h2 className="mt-4 max-w-xl font-serif text-4xl leading-[0.95] tracking-tight md:text-6xl">
                  One studio. Three clear ways to engage the work.
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {PRACTICE_AREAS.map((area) => (
                  <article
                    key={area.title}
                    className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/90 p-5"
                  >
                    <div className="mb-5 h-1.5 w-14 rounded-full bg-[var(--accent-orange)]" />
                    <h3 className="font-serif text-2xl tracking-tight text-[var(--foreground)]">
                      {area.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                      {area.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24">
          <div className="max-w-[90vw] mx-auto">
            <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent-orange)]">
                  Selected Works
                </p>
                <h2 className="mt-3 max-w-2xl font-serif text-4xl leading-[0.95] tracking-tight md:text-6xl">
                  A sharper look at the current body of work.
                </h2>
              </div>

              <Link
                href="/work"
                className="w-fit rounded-full border border-[var(--accent-primary)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent-primary)] transition-colors hover:bg-[var(--accent-primary)] hover:text-white"
              >
                View Full Collection
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {SELECTED_WORKS.slice(0, 4).map((work) => (
                <article
                  key={work.id}
                  className="group rounded-[1.75rem] border border-[var(--border-soft)] bg-white/90 p-4 shadow-[var(--shadow-soft)]"
                >
                  <Link href={`/work/${work.id}`} className="block">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-[var(--surface-soft)]">
                      <Image
                        src={work.image}
                        alt={work.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  </Link>

                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-2xl leading-tight tracking-tight">
                        {work.title}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        {work.medium}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                      {work.year}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-6 md:py-10">
          <div className="max-w-[90vw] mx-auto grid gap-6 lg:grid-cols-[1fr_1.05fr]">
            <article className="section-shell flex h-full flex-col justify-between p-8 md:p-10">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent-orange)]">
                  Studio Practice
                </p>
                <h2 className="mt-4 max-w-xl font-serif text-4xl leading-[0.95] tracking-tight md:text-6xl">
                  Built in Awka, shaped by memory, ritual, and daily life.
                </h2>
                <div className="mt-6 max-w-2xl space-y-4 text-base leading-relaxed text-[var(--text-muted)] md:text-lg">
                  <p>
                    Oma Achebe works in acrylic and mixed media, building each piece through layered colour,
                    texture, and movement.
                  </p>
                  <p>
                    The same studio also opens up for guided experiences, private paint sessions, and group
                    bookings that bring people into the work.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <div className="flex flex-wrap gap-3">
                  {STUDIO_NOTES.map((note) => (
                    <span
                      key={note}
                      className="rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--foreground)]"
                    >
                      {note}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/about"
                    className="rounded-full bg-[var(--accent-primary)] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--accent-orange)]"
                  >
                    Read the Story
                  </Link>
                  <Link
                    href="/contact"
                    className="rounded-full border border-[var(--border-soft)] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--foreground)] transition-colors hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
                  >
                    Start an Enquiry
                  </Link>
                </div>
              </div>
            </article>

            <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
              <div className="relative min-h-[24rem] overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-soft)]">
                <Image
                  src="/images/about-me.jpg"
                  alt="Oma Achebe in the studio"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="grid gap-6">
                <article className="rounded-[1.75rem] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-6 text-white">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent-orange)]">
                    For Spaces
                  </p>
                  <p className="mt-3 font-serif text-3xl leading-tight">
                    Collect work that changes the tone of a room.
                  </p>
                </article>

                <article className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/90 p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent-orange)]">
                    For People
                  </p>
                  <p className="mt-3 font-serif text-3xl leading-tight text-[var(--foreground)]">
                    Book sessions that feel social, hands-on, and well hosted.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <FeaturedActivities />

        <section className="py-20 md:py-24">
          <div className="max-w-[90vw] mx-auto overflow-hidden rounded-[2.25rem] border border-[var(--accent-primary)]/12 bg-[var(--surface-strong)] text-white shadow-[0_30px_90px_rgba(58,30,112,0.22)]">
            <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[0.92fr_1.08fr] lg:p-12">
              <article className="flex flex-col justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent-orange)]">
                    Private Events
                  </p>
                  <h2 className="mt-4 max-w-xl font-serif text-4xl leading-[0.95] tracking-tight md:text-6xl">
                    Book the studio for groups, celebrations, and hosted paint sessions.
                  </h2>
                  <p className="mt-6 max-w-lg text-base leading-relaxed text-white/80 md:text-lg">
                    Birthdays, team bonding, date sessions, bridal groups, and private studio hire are all planned around your group.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/82">
                    Awka studio
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/82">
                    Guided session
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/82">
                    Private booking
                  </span>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/events"
                    className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--surface-strong)] transition-colors hover:bg-[var(--accent-orange)] hover:text-white"
                  >
                    Plan a Private Event
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/8 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/14"
                  >
                    Ask About Availability
                  </Link>
                </div>
              </article>

              <div className="grid grid-cols-2 gap-4 md:gap-5">
                <div className="relative col-span-2 aspect-[16/9] overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/10">
                  <Image
                    src={EVENT_GALLERY[0]}
                    alt="Arts by Oma private event setup"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-4 left-4 rounded-[1.25rem] border border-white/15 bg-black/30 px-4 py-3 backdrop-blur-md">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent-orange)]">
                      Hosted Format
                    </p>
                    <p className="mt-1 font-serif text-2xl tracking-tight">
                      Paint, music, photos, and time together.
                    </p>
                  </div>
                </div>

                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/10">
                  <Image
                    src={EVENT_GALLERY[1]}
                    alt="Guests during a private paint session"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="grid gap-4">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/10">
                    <Image
                      src={EVENT_GALLERY[2]}
                      alt="Private event painting activity"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="rounded-[1.75rem] border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent-orange)]">
                      Best For
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-white/80">
                      Birthdays, teams, bridal groups, couples, and private celebrations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-0 border-t border-white/10 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="grid gap-4 p-6 md:grid-cols-3 md:p-8 lg:p-10">
                {PRIVATE_EVENT_FORMATS.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-[1.5rem] border border-white/12 bg-white/8 p-5 backdrop-blur-sm"
                  >
                    <p className="font-serif text-2xl tracking-tight text-white">
                      {item.title}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-white/78">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>

              <div className="border-t border-white/10 p-6 md:p-8 lg:border-l lg:border-t-0 lg:p-10">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent-orange)]">
                  Booking Flow
                </p>
                <div className="mt-5 space-y-5">
                  {PRIVATE_EVENT_STEPS.map((step, index) => (
                    <div key={step} className="flex gap-4">
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 font-mono text-[11px] uppercase tracking-[0.14em] text-white">
                        0{index + 1}
                      </span>
                      <p className="pt-1 text-sm leading-relaxed text-white/80 md:text-base">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-24">
          <div className="max-w-[90vw] mx-auto rounded-[2rem] border border-[var(--border-soft)] bg-white/90 p-8 shadow-[var(--shadow-soft)] md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent-orange)]">
                  Enquiries
                </p>
                <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-[0.95] tracking-tight md:text-6xl">
                  Commissions, collaborations, collection enquiries, and private bookings all start here.
                </h2>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="rounded-full bg-[var(--accent-primary)] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--accent-orange)]"
                >
                  Contact Studio
                </Link>
                <Link
                  href="/shop"
                  className="rounded-full border border-[var(--border-soft)] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--foreground)] transition-colors hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
                >
                  Shop Available Pieces
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
