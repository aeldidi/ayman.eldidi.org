import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import type { APIContext } from "astro";
import { SITE_META } from "../constants/siteMeta";
import { renderMdxForFeed } from "../lib/feedMdx";

export const prerender = true;

const toRfc3339 = (date: string) => `${date}T00:00:00Z`;
const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const author = {
  name: SITE_META.name,
  email: SITE_META.email,
};

const renderContent = async (post: CollectionEntry<"articles">) => {
  const html = await renderMdxForFeed(post.body);
  return escapeXml(html);
};

export async function GET(context: APIContext): Promise<Response> {
  const site = context.site ?? new URL("https://ayman.eldidi.org");

  const posts = (await getCollection("articles")).sort((a, b) =>
    b.data.date.localeCompare(a.data.date),
  );

  const entries = await Promise.all(
    posts.map(async (post) => {
      const url = new URL(`/articles/${post.data.slug}/`, site).href;
      const published = toRfc3339(post.data.date);
      const updated = toRfc3339(post.data.updated ?? post.data.date);
      const summary = post.data.summary
        ? escapeXml(post.data.summary)
        : null;
      const content = await renderContent(post);

      return {
        post,
        url,
        published,
        updated,
        summary,
        content,
      };
    }),
  );

  const feedUpdated = entries.reduce<string | null>((latest, entry) => {
    if (!latest || entry.updated > latest) {
      return entry.updated;
    }
    return latest;
  }, null);

  const resolvedFeedUpdated = feedUpdated ?? new Date().toISOString();
  const feedUrl = new URL("/atom.xml", site).href;

  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="utf-8"?>');
  lines.push('<feed xmlns="http://www.w3.org/2005/Atom">');
  lines.push(`  <title>ayman.eldidi.org</title>`);
  lines.push(`  <subtitle>Ayman El Didi's Blog</subtitle>`);
  lines.push(`  <id>${escapeXml(site.href)}</id>`);
  lines.push(`  <link rel="alternate" href="${escapeXml(site.href)}" />`);
  lines.push(
    `  <link rel="self" type="application/atom+xml" href="${escapeXml(
      feedUrl,
    )}" />`,
  );
  lines.push(`  <updated>${resolvedFeedUpdated}</updated>`);

  for (const entry of entries) {
    lines.push(`  <entry>`);
    lines.push(`    <title>${escapeXml(entry.post.data.title)}</title>`);
    lines.push(`    <id>${escapeXml(entry.url)}</id>`);
    lines.push(`    <link rel="alternate" href="${escapeXml(entry.url)}" />`);
    lines.push(`    <published>${entry.published}</published>`);
    lines.push(`    <updated>${entry.updated}</updated>`);
    lines.push(`    <author>`);
    lines.push(`      <name>${escapeXml(author.name)}</name>`);
    lines.push(`      <email>${escapeXml(author.email)}</email>`);
    lines.push(`    </author>`);
    if (entry.summary) {
      lines.push(`    <summary>${entry.summary}</summary>`);
    }
    lines.push(`    <content type="html">${entry.content}</content>`);
    lines.push(`  </entry>`);
  }

  lines.push(`</feed>`);

  return new Response(lines.join("\n"));
}
