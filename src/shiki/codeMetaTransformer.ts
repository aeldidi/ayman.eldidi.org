import { z } from "zod";
import type {
  CodeToHastOptions,
  ShikiTransformer,
  ShikiTransformerContext,
} from "@shikijs/types";
import type { Element, Root, Text, Properties } from "hast";

type Range = { start: number; end: number };

type ParsedCodeMeta = {
  filename: string | undefined;
  fileUrl: string | undefined;
  lineNumbers: boolean;
  lineStart: number;
  highlightLineRanges: Range[];
  highlightColumnRanges: Map<number, Range[]>;
};

const META_PAIR_RE =
  /([A-Za-z][A-Za-z0-9_-]*)=("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^\s]+)/g;

const booleanSchema = z.string().transform((value, ctx) => {
  if (value === "true") return true;
  if (value === "false") return false;
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: 'Expected "true" or "false".',
  });
  return z.NEVER;
});

const intSchema = z.string().transform((value, ctx) => {
  if (!/^\d+$/.test(value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Expected a positive integer.",
    });
    return z.NEVER;
  }
  const parsed = Number(value);
  if (parsed < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Expected a positive integer.",
    });
    return z.NEVER;
  }
  return parsed;
});

const codeMetaSchema = z
  .object({
    filename: z.string().min(1).optional(),
    fileurl: z.string().min(1).optional(),
    lineNumbers: booleanSchema.optional(),
    lineStart: intSchema.optional(),
    highlightLines: z.string().min(1).optional(),
    highlightCols: z.string().min(1).optional(),
  })
  .strict();

type CodeMetaInput = z.infer<typeof codeMetaSchema>;

function unquote(value: string): string {
  const quote = value[0];
  if ((quote === '"' || quote === "'") && value[value.length - 1] === quote) {
    return value.slice(1, -1).replace(/\\(["'\\])/g, "$1");
  }
  return value;
}

function parseMetaString(rawMeta?: string): Record<string, string> {
  const meta = rawMeta?.trim();
  if (!meta) return {};
  META_PAIR_RE.lastIndex = 0;
  const result: Record<string, string> = {};
  let match: RegExpExecArray | null = null;
  let lastIndex = 0;
  while ((match = META_PAIR_RE.exec(meta))) {
    if (match.index !== lastIndex) {
      const gap = meta.slice(lastIndex, match.index).trim();
      if (gap) {
        throw new Error(`Unable to parse code block metadata near "${gap}".`);
      }
    }
    const key = match[1];
    if (!key || Object.prototype.hasOwnProperty.call(result, key)) {
      throw new Error(`Duplicate code block metadata key "${key}".`);
    }
    result[key] = match[2]? unquote(match[2]) : 'true';
    lastIndex = META_PAIR_RE.lastIndex;
  }
  const remainder = meta.slice(lastIndex).trim();
  if (remainder) {
    throw new Error(`Unable to parse code block metadata near "${remainder}".`);
  }
  return result;
}

function normalizeMetaKeys(meta: Record<string, string>): Record<string, string> {
  const normalized = { ...meta };
  const hasFileUrl = Object.prototype.hasOwnProperty.call(normalized, "fileUrl");
  const hasFileurl = Object.prototype.hasOwnProperty.call(normalized, "fileurl");
  if (hasFileUrl && hasFileurl) {
    throw new Error('Use either "fileurl" or "fileUrl", not both.');
  }
  if (hasFileUrl) {
    const value = normalized["fileUrl"];
    if (value !== undefined) {
      normalized["fileurl"] = value;
    }
    delete normalized["fileUrl"];
  }
  return normalized;
}

function parsePositiveInt(value: string, label: string): number {
  if (!/^\d+$/.test(value)) {
    throw new Error(`${label} expects positive integers, got "${value}".`);
  }
  const parsed = Number(value);
  if (parsed < 1) {
    throw new Error(`${label} expects positive integers, got "${value}".`);
  }
  return parsed;
}

function parseRangeToken(token: string, label: string): Range {
  const trimmed = token.trim();
  if (!trimmed) {
    throw new Error(`${label} contains an empty range.`);
  }
  const parts = trimmed.split("-");
  if (parts.length === 1 && parts[0]) {
    const value = parsePositiveInt(parts[0], label);
    return { start: value, end: value };
  }
  if (parts.length === 2 && parts[0] && parts[1]) {
    const start = parsePositiveInt(parts[0], label);
    const end = parsePositiveInt(parts[1], label);
    if (end < start) {
      throw new Error(`${label} range "${trimmed}" is inverted.`);
    }
    return { start, end };
  }
  throw new Error(`${label} range "${trimmed}" is invalid.`);
}

function parseRangeList(value: string, label: string): Range[] {
  const tokens = value
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);
  if (tokens.length === 0) return [];
  return tokens.map((token) => parseRangeToken(token, label));
}

function parseColumnHighlights(value: string): Map<number, Range[]> {
  const entries = value
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (entries.length === 0) return new Map();
  const result = new Map<number, Range[]>();
  for (const entry of entries) {
    const separatorIndex = entry.indexOf(":");
    if (separatorIndex === -1) {
      throw new Error(
        `highlightCols expects "line:cols" entries, got "${entry}".`
      );
    }
    const linePart = entry.slice(0, separatorIndex).trim();
    const rangesPart = entry.slice(separatorIndex + 1).trim();
    if (!linePart || !rangesPart) {
      throw new Error(
        `highlightCols expects "line:cols" entries, got "${entry}".`
      );
    }
    const lineNumber = parsePositiveInt(linePart, "highlightCols line");
    const ranges = parseRangeList(rangesPart, "highlightCols");
    if (ranges.length === 0) {
      throw new Error(
        `highlightCols expects column ranges for line ${lineNumber}.`
      );
    }
    const existing = result.get(lineNumber) ?? [];
    existing.push(...ranges);
    result.set(lineNumber, existing);
  }
  return result;
}

function formatZodError(error: z.ZodError, rawMeta: string): string {
  const details = error.issues
    .map((issue) => {
      const path = issue.path.join(".");
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join("; ");
  return `Invalid code block metadata "${rawMeta}": ${details}`;
}

function parseCodeMeta(rawMeta?: string): ParsedCodeMeta | null {
  const parsed = parseMetaString(rawMeta);
  if (Object.keys(parsed).length === 0) return null;
  const normalized = normalizeMetaKeys(parsed);
  const result = codeMetaSchema.safeParse(normalized);
  if (!result.success) {
    throw new Error(formatZodError(result.error, rawMeta ?? ""));
  }
  const data: CodeMetaInput = result.data;
  if (data.fileurl && !data.filename) {
    throw new Error('The "fileurl" field requires "filename".');
  }
  const lineNumbers = data.lineNumbers ?? data.lineStart !== undefined;
  const lineStart = data.lineStart ?? 1;
  const highlightLineRanges = data.highlightLines
    ? parseRangeList(data.highlightLines, "highlightLines")
    : [];
  const highlightColumnRanges = data.highlightCols
    ? parseColumnHighlights(data.highlightCols)
    : new Map();
  return {
    filename: data.filename,
    fileUrl: data.fileurl,
    lineNumbers,
    lineStart,
    highlightLineRanges,
    highlightColumnRanges,
  };
}

function getParsedMeta(options?: CodeToHastOptions): ParsedCodeMeta | null {
  if (!options || typeof options !== "object") return null;
  const meta = options.meta;
  if (!meta || typeof meta !== "object") return null;
  return (meta["_codeMeta"] as ParsedCodeMeta | undefined) ?? null;
}

function isLineHighlighted(value: number, ranges: Range[]): boolean {
  for (const range of ranges) {
    if (value >= range.start && value <= range.end) {
      return true;
    }
  }
  return false;
}

function validateHighlightRanges(meta: ParsedCodeMeta, lineCount: number): void {
  if (lineCount === 0) return;
  const minLine = meta.lineStart;
  const maxLine = meta.lineStart + lineCount - 1;
  for (const range of meta.highlightLineRanges) {
    if (range.start < minLine || range.end > maxLine) {
      throw new Error(
        `highlightLines range "${range.start}-${range.end}" is outside ${minLine}-${maxLine}.`
      );
    }
  }
  for (const line of meta.highlightColumnRanges.keys()) {
    if (line < minLine || line > maxLine) {
      throw new Error(
        `highlightCols line "${line}" is outside ${minLine}-${maxLine}.`
      );
    }
  }
}

function createColumnHighlightNode(range: Range): Element {
  const startOffset = range.start - 1;
  const width = range.end - range.start + 1;
  return {
    type: "element",
    tagName: "span",
    properties: {
      class: "code-highlight",
      style: `--highlight-start:${startOffset};--highlight-width:${width};`,
    },
    children: [],
  };
}

function ensureProperties(node: Element): Properties {
  const properties = node.properties ?? {};
  node.properties = properties;
  return properties;
}

export function codeMetaTransformer(): ShikiTransformer {
  return {
    name: "code-meta",
    preprocess(code, options) {
      const meta = options?.meta;
      if (!meta || typeof meta !== "object") {
        return code;
      }
      const rawMeta = meta.__raw;
      if (!rawMeta || !String(rawMeta).trim()) {
        return code;
      }
      const parsed = parseCodeMeta(String(rawMeta));
      if (parsed) {
        options.meta = {
          ...meta,
          _codeMeta: parsed,
        };
      }
      return code;
    },
    line(this: ShikiTransformerContext, node: Element, lineNumber: number) {
      if (!node.children || node.children.length === 0) {
        node.children = [{ type: "text", value: " " }];
      }
      const meta = getParsedMeta(this.options);
      if (!meta) return node;
      const displayLine = meta.lineStart + lineNumber - 1;
      const properties = ensureProperties(node);
      properties["dataLine"] = String(displayLine);
      if (isLineHighlighted(displayLine, meta.highlightLineRanges)) {
        this.addClassToHast(node, "is-highlighted");
      }
      const columnRanges = meta.highlightColumnRanges.get(displayLine);
      if (columnRanges && columnRanges.length > 0) {
        const originalChildren = node.children;
        const highlights = columnRanges.map(createColumnHighlightNode);
        const content: Element = {
          type: "element",
          tagName: "span",
          properties: { class: "line-content" },
          children: originalChildren,
        };
        node.children = [...highlights, content];
        this.addClassToHast(node, "has-column-highlight");
      }
      return node;
    },
    pre(this: ShikiTransformerContext, node: Element) {
      const meta = getParsedMeta(this.options);
      if (!meta) return node;
      validateHighlightRanges(meta, this.lines.length);
      const properties = ensureProperties(node);
      if (meta.lineNumbers) {
        properties["dataLineNumbers"] = "true";
      }
      if (meta.lineStart !== 1) {
        properties["dataLineStart"] = String(meta.lineStart);
      }
      if (meta.filename) {
        properties["dataFilename"] = meta.filename;
      }
      if (meta.fileUrl) {
        properties["dataFileUrl"] = meta.fileUrl;
      }
      this.addClassToHast(node, "code-block__pre");
      return node;
    },
    root(this: ShikiTransformerContext, node: Root) {
      const meta = getParsedMeta(this.options);
      if (!meta || !meta.filename) return node;
      const filenameNode: Element | Text = meta.fileUrl
        ? {
            type: "element",
            tagName: "a",
            properties: {
              href: meta.fileUrl,
              class: "code-block__link",
            },
            children: [{ type: "text", value: meta.filename }],
          }
        : { type: "text", value: meta.filename };
      const header: Element = {
        type: "element",
        tagName: "figcaption",
        properties: { class: "code-block__header" },
        children: [
          {
            type: "element",
            tagName: "span",
            properties: { class: "code-block__filename" },
            children: [filenameNode],
          },
        ],
      };
      const figure: Element = {
        type: "element",
        tagName: "figure",
        properties: {
          class: "code-block",
          dataCodeFilename: meta.filename,
          ...(meta.fileUrl ? { dataCodeFileUrl: meta.fileUrl } : {}),
        },
        children: [header, this.pre],
      };
      node.children = [figure];
      return node;
    },
  };
}
