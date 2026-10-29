import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/radio/AdminPage";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel del equipo · Radio Patio Las Américas" },
      { name: "description", content: "Acceso privado del equipo de Radio América para gestionar las peticiones." },
      { property: "og:title", content: "Panel del equipo · Radio Patio Las Américas" },
      { property: "og:description", content: "Acceso privado del equipo de Radio América." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});
