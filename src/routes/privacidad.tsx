import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/components/Legal";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Política de privacidad · Radio Patio Las Américas" },
      { name: "description", content: "Qué datos trata Radio Patio Las Américas y cómo ejercer tus derechos." },
      { property: "og:title", content: "Política de privacidad · Radio Patio Las Américas" },
      { property: "og:description", content: "Qué datos trata Radio Patio Las Américas y cómo ejercer tus derechos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});
