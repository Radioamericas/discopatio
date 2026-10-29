import { createFileRoute } from "@tanstack/react-router";
import { CookiesPage } from "@/components/Legal";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Política de cookies · Radio Patio Las Américas" },
      { name: "description", content: "Cómo usa Radio Patio Las Américas las cookies y la analítica opcional." },
      { property: "og:title", content: "Política de cookies · Radio Patio Las Américas" },
      { property: "og:description", content: "Cómo usa Radio Patio Las Américas las cookies y la analítica opcional." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CookiesPage,
});
