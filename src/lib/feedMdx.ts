import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeMathjax from "rehype-mathjax";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";

type MdastNode = {
  type: string;
  children?: MdastNode[];
};

type HastNode = {
  type: string;
  tagName?: string;
  children?: HastNode[];
};

const MDX_DROP_NODES = new Set([
  "mdxjsEsm",
  "mdxFlowExpression",
  "mdxTextExpression",
]);

const MDX_UNWRAP_NODES = new Set([
  "mdxJsxFlowElement",
  "mdxJsxTextElement",
]);

const BLOCKED_TAGS = new Set(["script", "template"]);

const stripMdx = () => {
  return (tree: MdastNode) => {
    visit(tree, (node: MdastNode, index, parent) => {
      if (!parent || typeof index !== "number") {
        return;
      }

      if (MDX_DROP_NODES.has(node.type)) {
        parent.children?.splice(index, 1);
        return [visit.SKIP, index];
      }

      if (MDX_UNWRAP_NODES.has(node.type)) {
        const replacement = node.children ?? [];
        parent.children?.splice(index, 1, ...replacement);
        return [visit.SKIP, index];
      }
    });
  };
};

const rehypeFeedSanitize = () => {
  return (tree: HastNode) => {
    visit(tree, "element", (node: HastNode, index, parent) => {
      if (!parent || typeof index !== "number" || !node.tagName) {
        return;
      }

      const tag = node.tagName.toLowerCase();
      if (BLOCKED_TAGS.has(tag)) {
        parent.children?.splice(index, 1);
        return [visit.SKIP, index];
      }
    });
  };
};

const processor = unified()
  .use(remarkParse)
  .use(remarkMdx)
  .use(remarkGfm)
  .use(remarkMath)
  .use(stripMdx)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeMathjax)
  .use(rehypeFeedSanitize)
  .use(rehypeStringify, { allowDangerousHtml: true });

export const renderMdxForFeed = async (source: string): Promise<string> => {
  const file = await processor.process(source);
  return String(file);
};
