// Schema.org JSON-LD helper. Server component. Inserts a single <script>
// tag with the structured data Google reads for rich results.

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
