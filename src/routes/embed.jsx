import { createFileRoute } from "@tanstack/react-router";
import Embed from "@/site/Embed";

export const Route = createFileRoute("/embed")({
  head: () => ({
    meta: [
      { title: "Embed minicaptcha — integration guide" },
      { name: "description", content: "Add minicaptcha to any site with one script tag and a data-sitekey, then verify tokens on your server." },
    ],
  }),
  component: Embed,
});
