import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import { toText } from "hast-util-to-text";
import type { Element, Parent, Root } from "hast";

type FeedHtmlOptions = {
  site: URL;
};

const REMOVE_TAGS = new Set(["script", "style", "link"]);
const UNWRAP_TAGS = new Set(["astro-island", "astro-slot", "astro-static-slot"]);

export function cleanFeedHtml(html: string, options: FeedHtmlOptions): string {
  const tree = unified()
    .use(rehypeParse, { fragment: true })
    .parse(html) as Root;

  transformTree(tree, options.site);

  return unified().use(rehypeStringify).stringify(tree);
}

function transformTree(node: Parent, site: URL): void {
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
      transformTree(child, site);
      nextChildren.push(...(child.children ?? []));
      continue;
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

    transformTree(child, site);
    absolutizeElementUrls(child, site);
    nextChildren.push(child);
  }

  node.children = nextChildren;
}

function isCodeBlockFigure(node: Element): boolean {
  return node.tagName === "figure" && hasClass(node, "code-block");
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
