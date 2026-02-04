import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import { toHtml } from "hast-util-to-html";
import { toText } from "hast-util-to-text";
import type { Element, Parent, Root } from "hast";

type FeedHtmlOptions = {
  site: URL;
};

const REMOVE_TAGS = new Set(["script", "style", "link"]);
const UNWRAP_TAGS = new Set(["astro-island", "astro-slot", "astro-static-slot"]);
const CHART_SECTION_CLASS = "chart-section";
const CHART_SVG_CLASS = "chart-svg";
const FEED_ASSETS_DIR = "feed-assets";
const FEED_ASSET_PREFIX = `/${FEED_ASSETS_DIR}`;
const assetCache = new Map<string, string>();

export async function cleanFeedHtml(
  html: string,
  options: FeedHtmlOptions,
): Promise<string> {
  const tree = unified()
    .use(rehypeParse, { fragment: true })
    .parse(html) as Root;

  await transformTree(tree, options.site);

  return unified().use(rehypeStringify).stringify(tree);
}

async function transformTree(node: Parent, site: URL): Promise<void> {
  const nextChildren: Parent["children"] = [];

  for (const child of node.children) {
    if (child.type === "comment") {
      continue;
    }

    if (child.type !== "element") {
      nextChildren.push(child);
      continue;
    }

    const tagName = child.tagName;

    if (REMOVE_TAGS.has(tagName)) {
      continue;
    }

    if (
      tagName === "template" &&
      (child.properties?.["data-astro-template"] ||
        child.properties?.dataAstroTemplate)
    ) {
      continue;
    }

    if (UNWRAP_TAGS.has(tagName)) {
      await transformTree(child, site);
      nextChildren.push(...(child.children ?? []));
      continue;
    }

    if (isChartSection(child)) {
      const replacement = await rasterizeChartSection(child, site);
      if (replacement) {
        nextChildren.push(replacement);
        continue;
      }
    }

    if (isCodeBlockFigure(child)) {
      const replacement = simplifyCodeFigure(child);
      if (replacement) {
        nextChildren.push(replacement);
      }
      continue;
    }

    if (isShikiPre(child)) {
      nextChildren.push(simplifyCodePre(child));
      continue;
    }

    await transformTree(child, site);
    absolutizeElementUrls(child, site);
    nextChildren.push(child);
  }

  node.children = nextChildren;
}

function isCodeBlockFigure(node: Element): boolean {
  return node.tagName === "figure" && hasClass(node, "code-block");
}

function isChartSection(node: Element): boolean {
  return node.tagName === "section" && hasClass(node, CHART_SECTION_CLASS);
}

function isShikiPre(node: Element): boolean {
  if (node.tagName !== "pre") {
    return false;
  }

  return (
    hasClass(node, "astro-code") ||
    hasClass(node, "code-block__pre") ||
    hasClass(node, "shiki")
  );
}

function simplifyCodeFigure(node: Element): Element | null {
  const pre = findFirstPre(node);
  if (!pre) {
    return null;
  }
  return simplifyCodePre(pre);
}

function simplifyCodePre(pre: Element): Element {
  const codeText = toText(pre, { whitespace: "pre" });
  const language = getCodeLanguage(pre);
  const codeProperties = language
    ? { className: [`language-${language}`] }
    : {};

  return {
    type: "element",
    tagName: "pre",
    properties: {},
    children: [
      {
        type: "element",
        tagName: "code",
        properties: codeProperties,
        children: [{ type: "text", value: codeText }],
      },
    ],
  };
}

function findFirstPre(node: Element): Element | null {
  const queue: Element[] = [node];

  while (queue.length) {
    const current = queue.shift();
    if (!current) continue;

    if (current.tagName === "pre") {
      return current;
    }

    for (const child of current.children ?? []) {
      if (child.type === "element") {
        queue.push(child);
      }
    }
  }

  return null;
}

async function rasterizeChartSection(
  section: Element,
  site: URL,
): Promise<Element | null> {
  const svg = findFirstSvg(section);
  if (!svg) {
    return null;
  }

  const altText = getSvgAlt(svg);
  const url = await writeSvgPngAsset(svg, site);

  return {
    type: "element",
    tagName: "img",
    properties: {
      src: url,
      alt: altText,
      loading: "lazy",
    },
    children: [],
  };
}

function findFirstSvg(node: Element): Element | null {
  const queue: Element[] = [node];

  while (queue.length) {
    const current = queue.shift();
    if (!current) continue;

    if (current.tagName === "svg" && hasClass(current, CHART_SVG_CLASS)) {
      return current;
    }

    for (const child of current.children ?? []) {
      if (child.type === "element") {
        queue.push(child);
      }
    }
  }

  return null;
}

function getSvgAlt(svg: Element): string {
  const ariaLabel = svg.properties?.["aria-label"];
  if (typeof ariaLabel === "string" && ariaLabel.trim()) {
    return ariaLabel.trim();
  }

  return "Unicode benchmark chart";
}

async function writeSvgPngAsset(svg: Element, site: URL): Promise<string> {
  ensureSvgDimensions(svg);
  const svgMarkup = toHtml(svg);
  const hash = createHash("sha256").update(svgMarkup).digest("hex").slice(0, 12);

  const cached = assetCache.get(hash);
  if (cached) {
    return cached;
  }

  const fileName = `chart-${hash}.png`;
  const publicUrl = new URL(`${FEED_ASSET_PREFIX}/${fileName}`, site).toString();

  const buffer = await sharp(Buffer.from(svgMarkup))
    .png({ compressionLevel: 9 })
    .toBuffer();

  await writeFeedAsset(fileName, buffer);
  assetCache.set(hash, publicUrl);

  return publicUrl;
}

function ensureSvgDimensions(svg: Element): void {
  const props = ensureProperties(svg);
  if (!props.xmlns) {
    props.xmlns = "http://www.w3.org/2000/svg";
  }
  const viewBox = getViewBox(props);
  if (!viewBox) return;

  const [, , width, height] = viewBox;
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    return;
  }

  if (!isNumericSize(props.width)) {
    props.width = String(width);
  }

  if (!isNumericSize(props.height)) {
    props.height = String(height);
  }
}

function getViewBox(props: Record<string, unknown>): number[] | null {
  const raw = typeof props.viewBox === "string" ? props.viewBox : props.viewbox;
  if (typeof raw !== "string") {
    return null;
  }

  const parts = raw.split(/[\s,]+/).map((part) => Number(part));
  if (parts.length !== 4 || parts.some((value) => !Number.isFinite(value))) {
    return null;
  }

  return parts;
}

function isNumericSize(value: unknown): boolean {
  if (typeof value === "number") return true;
  if (typeof value !== "string") return false;
  return /^\\d+(\\.\\d+)?$/.test(value);
}

function ensureProperties(node: Element): Record<string, unknown> {
  if (!node.properties) {
    node.properties = {};
  }

  return node.properties as Record<string, unknown>;
}

async function writeFeedAsset(fileName: string, buffer: Buffer): Promise<void> {
  const root = process.cwd();
  const publicDir = path.join(root, "public", FEED_ASSETS_DIR);
  const distDir = path.join(root, resolveOutDir(), FEED_ASSETS_DIR);

  await fs.mkdir(publicDir, { recursive: true });
  const publicPath = path.join(publicDir, fileName);
  if (!(await pathExists(publicPath))) {
    await fs.writeFile(publicPath, buffer);
  }

  if (await pathExists(distDir)) {
    await fs.mkdir(distDir, { recursive: true });
    const distPath = path.join(distDir, fileName);
    if (!(await pathExists(distPath))) {
      await fs.writeFile(distPath, buffer);
    }
  }
}

function resolveOutDir(): string {
  if (process.env.ASTRO_OUT_DIR && process.env.ASTRO_OUT_DIR.trim()) {
    return process.env.ASTRO_OUT_DIR.trim();
  }

  return "dist";
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

function getCodeLanguage(pre: Element): string | null {
  const dataLanguage = pre.properties?.dataLanguage;
  if (typeof dataLanguage === "string" && dataLanguage.trim()) {
    return dataLanguage.trim();
  }

  const classList = getClassList(pre);
  const languageClass = classList.find((value) => value.startsWith("language-"));
  if (languageClass) {
    return languageClass.slice("language-".length);
  }

  return null;
}

function hasClass(node: Element, className: string): boolean {
  return getClassList(node).includes(className);
}

function getClassList(node: Element): string[] {
  const classValue = node.properties?.className;

  if (Array.isArray(classValue)) {
    return classValue.map((value) => String(value)).filter(Boolean);
  }

  if (typeof classValue === "string") {
    return classValue.split(/\s+/).filter(Boolean);
  }

  return [];
}

function absolutizeElementUrls(node: Element, site: URL): void {
  if (!node.properties) {
    return;
  }

  const props = node.properties as Record<string, unknown>;

  const urlAttributes = ["href", "src", "poster"];
  for (const attr of urlAttributes) {
    const value = props[attr];
    if (typeof value === "string") {
      props[attr] = absolutizeUrl(value, site);
    }
  }

  const srcset = props.srcset;
  if (typeof srcset === "string") {
    props.srcset = absolutizeSrcset(srcset, site);
  }
}

function absolutizeUrl(value: string, site: URL): string {
  if (!shouldAbsolutize(value)) {
    return value;
  }

  try {
    return new URL(value, site).toString();
  } catch {
    return value;
  }
}

function shouldAbsolutize(value: string): boolean {
  if (!value) return false;
  if (value.startsWith("#")) return false;
  if (value.startsWith("//")) return false;
  if (/^[a-zA-Z][a-zA-Z\\d+.-]*:/.test(value)) return false;
  return true;
}

function absolutizeSrcset(value: string, site: URL): string {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [url, ...rest] = part.split(/\\s+/);
      if (!url) {
        return part;
      }
      const absolute = absolutizeUrl(url, site);
      return [absolute, ...rest].join(" ");
    })
    .join(", ");
}
