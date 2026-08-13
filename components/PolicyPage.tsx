import Link from 'next/link';
import Footer from '@/components/Footer';

export default function PolicyPage({ title, label, intro, sections }: { title: string; label: string; intro: string; sections: { heading: string; body: string }[] }) {
  return <main id="main-content" className="site-main"><div className="page-shell"><header className="page-intro"><p className="eyebrow">{label}</p><h1>{title}</h1><p>{intro}</p></header><article className="prose-block max-w-3xl">{sections.map((section) => <section key={section.heading} className="mb-10"><h2>{section.heading}</h2><p>{section.body}</p></section>)}<p className="form-note">These pages include clearly marked operating-policy placeholders where Artsy by Oma needs to confirm business decisions with its owner or legal adviser before launch.</p><Link href="/contact" className="text-link">Ask the studio a question</Link></article></div><Footer /></main>;
}
