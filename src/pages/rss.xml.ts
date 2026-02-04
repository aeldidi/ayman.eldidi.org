import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { SITE_META } from "../constants/siteMeta";

export const prerender = true;

const toDate = (value: string) => new Date(`${value}T00:00:00Z`);

export async function GET(context: APIContext): Promise<Response> {
  const site = context.site ?? new URL("https://ayman.eldidi.org");

  const posts = (await getCollection("articles")).sort((a, b) =>
    b.data.date.localeCompare(a.data.date),
  );

  const items = posts.map((post) => ({
    title: post.data.title,
    link: `/articles/${post.data.slug}/`,
    description: post.data.summary ?? post.data.description ?? "",
    pubDate: toDate(post.data.date),
  }));

  return rss({
    title: site.hostname,
    description: `${SITE_META.name}'s Blog`,
    site,
    items,
  });
}
