import { Helmet } from "react-helmet-async";

/**
 * Inject a JSON-LD structured-data block into <head>.
 * Pass any schema.org-shaped object as `data`.
 */
const JsonLd = ({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) => {
  const json = JSON.stringify(data);
  return (
    <Helmet>
      <script type="application/ld+json">{json}</script>
    </Helmet>
  );
};

export default JsonLd;