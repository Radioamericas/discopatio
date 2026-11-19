import { createFileRoute } from "@tanstack/react-router";
import { AvisosPage } from "@/components/radio/AvisosPage";

export const Route = createFileRoute("/avisos")({
  head: () => ({
    meta: [
      { title: "Avisos y biblioteca de audios · Radio Patio Las Américas" },
      { name: "description", content: "Avisos del equipo de Radio Patio Las Américas y audios provisionales de los programas ya emitidos. En fase beta." },
      { property: "og:title", content: "Avisos y biblioteca de audios · Radio Patio Las Américas" },
      { property: "og:description", content: "Avisos del equipo y audios de programas pasados de Discopatio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AvisosPage,
});
