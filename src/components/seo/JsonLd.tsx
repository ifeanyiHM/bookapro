/** Renders a schema.org JSON-LD block. Server component, so it adds no client JavaScript. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // "<" is escaped so content can never close the script tag early.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
