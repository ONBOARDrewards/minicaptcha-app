import { createFileRoute } from "@tanstack/react-router";
import Home from "@/site/Home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "minicaptcha — Stop the bots. Keep the humans." },
      {
        name: "description",
        content:
          "minicaptcha replaces blurry image grids with short spatial puzzles — tracing, aligning and sorting tasks that take a person two seconds and leave automation with nothing to train on.",
      },
    ],
  }),
  component: Home,
});
