import { createFileRoute } from "@tanstack/react-router";
import Widget from "@/site/Widget";

export const Route = createFileRoute("/widget")({
  head: () => ({ meta: [{ title: "minicaptcha challenge" }] }),
  component: Widget,
});
