import { render, type CollectionEntry } from "astro:content";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import mdxRenderer from "@astrojs/mdx/server.js";
import svelteRenderer from "@astrojs/svelte/server.js";
import { cleanFeedHtml } from "./feedHtml";

type FeedRenderOptions = {
  site: URL;
  url: URL;
};

let containerPromise: Promise<AstroContainer> | null = null;

export async function renderFeedEntry(
  entry: CollectionEntry<"articles">,
  options: FeedRenderOptions,
): Promise<string> {
  const { Content } = await render(entry);
  const container = await getContainer();
  const html = await container.renderToString(Content, {
    request: new Request(options.url),
    partial: true,
  });

  return cleanFeedHtml(html, { site: options.site });
}

async function getContainer(): Promise<AstroContainer> {
  if (!containerPromise) {
    containerPromise = createContainer();
  }

  return containerPromise;
}

async function createContainer(): Promise<AstroContainer> {
  const container = await AstroContainer.create();

  container.addServerRenderer({ renderer: mdxRenderer });
  container.addServerRenderer({ renderer: svelteRenderer });
  container.addClientRenderer({
    name: "@astrojs/svelte",
    entrypoint: "@astrojs/svelte/client.js",
  });

  return container;
}
