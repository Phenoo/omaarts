export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <div hidden aria-hidden="true"><script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: json }} /></div>;
}
