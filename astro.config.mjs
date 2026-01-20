// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import remarkMath from "remark-math";
import rehypeMathjax from "rehype-mathjax";
// import astroTypeset from "./src/integrations/typeset";
import { remarkReadingTime } from "./src/remarkPlugins/readingTime";
import { codeMetaTransformer } from "./src/shiki/codeMetaTransformer";

// https://astro.build/config
export default defineConfig({
  output: "static",
  site: "https://ayman.eldidi.org",
  vite: {
    server: {
      allowedHosts: ['3800x-pc'],
    }
  },
  markdown: {
    remarkPlugins: [remarkReadingTime, remarkMath],
    rehypePlugins: [rehypeMathjax],
    shikiConfig: {
      theme: "github-light",
      transformers: [codeMetaTransformer()],
    },
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => {
        const path = page.startsWith("http")
          ? new URL(page).pathname
          : page;
        return !path.startsWith("/drafts/");
      },
    }),
    svelte(),
    // astroTypeset({
    //   include: ["**/articles/**/*.html"],
    //   onlySelector: "article",
    // }),
  ],
});
