import Image from "next/image";
import Link from "next/link";
import { SELECTED_WORKS } from "@/lib/selectedWorks";

export default function WorksPage() {
  return (
    <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="max-w-[90vw] mx-auto pb-24">
        <div className="section-shell p-8 md:p-10 mb-14">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--accent-orange)] mb-4">
            Works
          </p>
          <h1 className="font-serif text-5xl md:text-7xl tracking-tight leading-[0.9]">
            Interior Artworks
          </h1>
          <p className="mt-5 max-w-2xl text-[var(--text-muted)] text-base md:text-lg leading-relaxed">
            A full selection of available interior artworks. Open any piece to view details and make an inquiry.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {SELECTED_WORKS.map((art) => (
            <article
              key={art.id}
              className="section-shell p-4 md:p-5 flex flex-col gap-4"
            >
              <Link href={`/work/${art.id}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--surface-soft)]">
                  <Image
                    src={art.image}
                    alt={art.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </Link>

              <div className="flex items-center justify-between gap-4">
                <h2 className="font-serif text-2xl leading-tight">{art.title}</h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  {art.year}
                </span>
              </div>

              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                {art.medium}
              </p>

              <Link
                href={`/work/${art.id}`}
                className="mt-1 w-fit px-5 py-2 rounded-full border border-[var(--accent-primary)] text-[var(--accent-primary)] font-mono text-xs uppercase tracking-[0.14em] hover:bg-[var(--accent-primary)] hover:text-white transition-colors"
              >
                View Work
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
