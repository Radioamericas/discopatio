import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/radio/HomePage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Radio Patio Las Américas · Pide tu canción" },
      { name: "description", content: "Manda tu canción para el próximo Radio Patio Las Américas: cada jueves en el recreo del IES Las Américas." },
      { property: "og:title", content: "Radio Patio Las Américas · Pide tu canción" },
      { property: "og:description", content: "Tú eliges. Nosotros le damos play. Buzón de peticiones musicales del IES Las Américas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});
