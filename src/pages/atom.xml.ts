import { XMLBuilder } from "fast-xml-parser";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { SITE_META } from "../constants/siteMeta";
import { renderFeedEntry } from "../lib/feedMdx";

export const prerender = true;

const toDate = (value: string) => new Date(`${value}T00:00:00Z`);

export async function GET(context: APIContext): Promise<Response> {
  const site = context.site ?? new URL("https://ayman.eldidi.org");
  const posts = (await getCollection("articles")).sort((a, b) =>
    b.data.date.localeCompare(a.data.date),
  );

  const feedUpdated =
    posts.length > 0
      ? posts.reduce((latest, post) => {
          const updated = toDate(post.data.updated ?? post.data.date);
          return updated > latest ? updated : latest;
        }, new Date(0))
      : new Date();

  const entries = await Promise.all(
    posts.map(async (post) => {
      const entryUrl = new URL(`/articles/${post.data.slug}/`, site);
      const content = escapeCdata(
        await renderFeedEntry(post, { site, url: entryUrl }),
      );
      const summary = post.data.summary ?? post.data.description;

      const entry = {
        id: entryUrl.toString(),
        title: post.data.title,
        link: {
          "@_href": entryUrl.toString(),
          "@_rel": "alternate",
          "@_type": "text/html",
        },
        published: toDate(post.data.date).toISOString(),
        updated: toDate(post.data.updated ?? post.data.date).toISOString(),
        content: {
          "@_type": "html",
          __cdata: content,
        },
        ...(summary ? { summary } : {}),
      };

      return entry;
    }),
  );

  const xml = new XMLBuilder({
    cdataPropName: "__cdata",
    ignoreAttributes: false,
    suppressEmptyNode: true,
  }).build({
    "?xml": { "@_version": "1.0", "@_encoding": "UTF-8" },
    feed: {
      "@_xmlns": "http://www.w3.org/2005/Atom",
      id: site.toString(),
      title: `${SITE_META.name}'s Blog`,
      subtitle: SITE_META.bio,
      updated: feedUpdated.toISOString(),
      link: [
        {
          "@_href": new URL("/atom.xml", site).toString(),
          "@_rel": "self",
          "@_type": "application/atom+xml",
        },
        {
          "@_href": site.toString(),
          "@_rel": "alternate",
          "@_type": "text/html",
        },
      ],
      author: {
        name: SITE_META.name,
        email: SITE_META.email,
      },
      entry: entries,
    },
  });

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
    },
  });
}

function escapeCdata(value: string): string {
  return value.replace(/]]>/g, "]]]]><![CDATA[>");
}
