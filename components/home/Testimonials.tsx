'use client';

const QUOTES = [
    { text: "Chioma's work transformed our lobby into a sanctuary. The texture is palpable even from a distance.", author: "Elena R.", role: "Interior Architect" },
    { text: "A profound understanding of color and space. Her pieces are not just decoration; they are a presence.", author: "Marcus T.", role: "Private Collector" },
];

export default function Testimonials() {
  return (
    <section className="w-full py-32 bg-[#0a0a0a] text-[#F9F9F9]">
      <div className="max-w-[90vw] mx-auto flex flex-col md:flex-row gap-24">
         <div className="w-full md:w-1/3">
            <h2 className="font-mono text-sm uppercase tracking-widest text-[var(--accent-purple)]">Testimonials</h2>
         </div>
         
         <div className="w-full md:w-2/3 flex flex-col gap-16">
            {QUOTES.map((quote, i) => (
                <div key={i} className="border-l-2 border-[#333] pl-8">
                    <p className="font-serif text-2xl md:text-3xl leading-relaxed italic opacity-90">
                        &quot;{quote.text}&quot;
                    </p>
                    <div className="mt-6 font-mono text-xs uppercase tracking-widest text-[var(--accent-orange)]/80">
                        {quote.author} — {quote.role}
                    </div>
                </div>
            ))}
         </div>
      </div>
    </section>
  );
}
