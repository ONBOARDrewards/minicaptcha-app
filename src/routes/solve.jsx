import { createFileRoute } from "@tanstack/react-router";
import Solve from "@/site/Solve";

export const Route = createFileRoute("/solve")({
  head: () => ({
    meta: [
      { title: "Solve a challenge — minicaptcha" },
      { name: "description", content: "Try a live minicaptcha challenge: twelve spatial puzzle families, one solve per visitor." },
    ],
  }),
  component: Solve,
});
