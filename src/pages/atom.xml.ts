import { getCollection, render } from "astro:content";
import type { CollectionEntry } from "astro:content";
import type { APIContext } from "astro";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import svelteRenderer from "@astrojs/svelte/server.js";
import mdxRenderer from "@astrojs/mdx/server.js";
import { SITE_META } from "../constants/siteMeta";
import FeedContent from "../components/FeedContent.astro";

export const prerender = true;

const container = await AstroContainer.create();
container.addServerRenderer({ renderer: mdxRenderer });
container.addServerRenderer({ renderer: svelteRenderer });
container.addClientRenderer({
  name: "@astrojs/svelte",
  entrypoint: "@astrojs/svelte/client.js",
});

const toRfc3339 = (date: string) => `${date}T00:00:00Z`;
const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sanitizeHtml = (value: string) => {
  let html = value;
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, "");
  html = html.replace(/<astro-island\b[^>]*>/gi, "");
  html = html.replace(/<\/astro-island>/gi, "");
  html = html.replace(/<astro-slot\b[^>]*>/gi, "");
  html = html.replace(/<\/astro-slot>/gi, "");
  html = html.replace(/<!--[^>]*?-->/g, "");
  return html.trim();
};

const stripTags = (value: string) => value.replace(/<\/?[^>]+>/g, "");

const formatCodeBlocks = (html: string) =>
  html.replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, (block) => {
    const innerMatch = block.match(/^<pre\b[^>]*>([\s\S]*?)<\/pre>$/i);
    const inner = innerMatch ? innerMatch[1] : block;
    const lines: string[] = [];
    const lineRegex =
      /<span[^>]*class=(["'])line\1[^>]*>([\s\S]*?)<\/span>/gi;
    let match = lineRegex.exec(inner);
    while (match) {
      lines.push(stripTags(match[2]));
      match = lineRegex.exec(inner);
    }

    const rawText = lines.length > 0 ? lines.join("\n") : stripTags(inner);
    const normalized = rawText.replace(/\r\n/g, "\n");
    const formatted = normalized
      .split("\n")
      .map((line) => {
        const indentMatch = line.match(/^[ \t]+/);
        if (!indentMatch) {
          return line;
        }
        const indent = indentMatch[0].replace(/\t/g, "  ");
        const nbspIndent = indent.replace(/ /g, "&nbsp;");
        return `${nbspIndent}${line.slice(indentMatch[0].length)}`;
      })
      .join("\n");

    return `<pre>${formatted}</pre>`;
  });

const stripChartControls = (html: string) =>
  html.replace(
    /<div[^>]*class=(["'])chart-controls\1[^>]*>[\s\S]*?<\/div>/gi,
    "",
  );

const replaceInlineSvgs = (html: string) =>
  html.replace(/<svg\b[\s\S]*?<\/svg>/gi, (svg) => {
    const encoded = encodeURIComponent(svg);
    return `<img src="data:image/svg+xml;utf8,${encoded}" alt="Chart" style="max-width:100%;height:auto;" />`;
  });

const prepareFeedHtml = (value: string) => {
  let html = sanitizeHtml(value);
  html = stripChartControls(html);
  html = replaceInlineSvgs(html);
  html = formatCodeBlocks(html);
  return html;
};

const author = {
  name: SITE_META.name,
  email: SITE_META.email,
};

const renderContent = async (post: CollectionEntry<"articles">) => {
  const { Content } = await render(post);
  const html = await container.renderToString(FeedContent, {
    props: { Content },
  });
  return escapeXml(prepareFeedHtml(html));
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
