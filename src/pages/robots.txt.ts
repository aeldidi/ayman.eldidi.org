export const prerender = true;

export async function GET({ site }: { site?: URL }) {
  const sitemapLine = site
    ? `Sitemap: ${new URL("/sitemap-index.xml", site).href}\n`
    : "";
  const body = `User-agent: *\nAllow: /\nDisallow: /drafts/\n${sitemapLine}`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
