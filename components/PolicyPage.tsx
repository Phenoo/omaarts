import Link from 'next/link';
import Footer from '@/components/Footer';
import { SITE } from '@/lib/site';

type PolicySection = { heading: string; body: string | string[] };

export default function PolicyPage({ title, label, intro, sections, updated = '15 August 2026' }: { title: string; label: string; intro: string; sections: PolicySection[]; updated?: string }) {
  return (
    <main id="main-content" className="site-main">
      <div className="page-shell">
        <header className="page-intro">
          <p className="eyebrow">{label}</p>
          <h1>{title}</h1>
          <p>{intro}</p>
          <p className="form-note">Last updated: {updated}</p>
        </header>
        <article className="prose-block max-w-3xl">
          {sections.map((section) => (
            <section key={section.heading} className="mb-10">
              <h2>{section.heading}</h2>
              {Array.isArray(section.body)
                ? section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                : <p>{section.body}</p>}
            </section>
          ))}
          <p className="form-note">Questions about this policy? Contact {SITE.name} at {SITE.email} or {SITE.phoneDisplay}.</p>
          <Link href="/contact" className="text-link">Ask the studio a question</Link>
        </article>
      </div>
      <Footer />
    </main>
  );
}
