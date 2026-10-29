import { createFileRoute } from "@tanstack/react-router";
import { LegalNoticePage } from "@/components/Legal";

export const Route = createFileRoute("/aviso-legal")({
  head: () => ({
    meta: [
      { title: "Aviso legal · Radio Patio Las Américas" },
      { name: "description", content: "Titularidad y condiciones de uso del buzón de Radio Patio Las Américas." },
      { property: "og:title", content: "Aviso legal · Radio Patio Las Américas" },
      { property: "og:description", content: "Titularidad y condiciones de uso del buzón de Radio Patio Las Américas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LegalNoticePage,
});
