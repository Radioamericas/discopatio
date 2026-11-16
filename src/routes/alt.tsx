import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/radio/HomePage";

export const Route = createFileRoute("/alt")({
  head: () => ({
    meta: [
      { title: "Buzón alternativo · Radio Patio Las Américas" },
      { name: "description", content: "Buzón alternativo para pedir canciones a Radio Patio Las Américas, con límite semanal por dispositivo." },
      { property: "og:title", content: "Buzón alternativo · Radio Patio Las Américas" },
      { property: "og:description", content: "Pide tu canción aunque el buzón principal esté cerrado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AltPage,
});

function AltPage() {
  return <HomePage alt />;
}
