# Article Formatting

This guide covers common patterns for writing articles in this repo. Articles are
MDX files under `articles/` and are rendered by Astro.

## Frontmatter

Frontmatter supports the following fields (required: `title`, `date`, `slug`):

```yaml
title: "Unicode Identifiers in 2.5 KiB"
date: 2025-07-21
description: "Optional summary shown in listings."
tags: ["unicode", "rust"]
draft: false
heroImage: "/images/unicode-hero.png"
slug: "unicode-identifiers"
```

Notes:

- `title`, `date`, and `slug` are required.
- `description`, `tags`, `draft`, and `heroImage` are optional.
- `date` must be a valid calendar date.

## Headings and text

```md
# H1 is used for the page title only

## H2 for sections

### H3 for subsections

Use _italics_, **bold**, and `inline code` as needed.
```

## Links and images

```md
Here is a link to [Rust](https://www.rust-lang.org/).

![Alt text](/images/example.png)
```

## Inline figures

Use `InlineFigure` for captioned images with automatic numbering and a
click-to-open link.

```mdx
import InlineFigure, {
  createInlineFigureRegistry,
} from "../src/components/InlineFigure";
import DiagramUrl from "../src/assets/diagram.svg?url";
import Diagram from "../src/assets/diagram.svg";

export const figures = createInlineFigureRegistry();
export const diagramFigure = figures.register("diagram-overview");

<InlineFigure
  registry={figures}
  id="diagram-overview"
  src={Diagram}
  href={DiagramUrl}
  caption="Distribution of XID properties across Unicode."
  width="500px"
  height="500px"
/>

As shown in Figure {diagramFigure}, the ranges cluster by script.
```

Notes:

- `caption` is required and is also used as the image alt text.
- `id` must be unique per article.
- `figures.register(id)` returns the assigned number (store it in a variable).
- Keep `register` calls in the same order as the figures for consistent numbering.
- If you prefer not to store a variable, import `FigureNumber` and use
  `Figure <FigureNumber registry={figures} id="diagram-overview" />` inline.
- `src` accepts a URL string or an `astro:assets` image metadata import.
- `href` defaults to `src` if you omit it.
- If `width`/`height` are omitted, the image keeps its intrinsic size and
  shrinks to fit the article width while preserving its aspect ratio.
- Set `showNumber={false}` to hide numbering and render only the caption text.

### Custom figures

Use `CustomFigure` when you need captioned, numbered content that is not a
simple image (charts, diagrams, composed layouts).

```mdx
import { CustomFigure } from "../src/components/InlineFigure";
import UnicodeBenchmarkChart from "../src/components/UnicodeBenchmarkChart";

<CustomFigure
  registry={figures}
  id="benchmark-chart"
  caption="Benchmark results across input sizes."
>
  <UnicodeBenchmarkChart
    client:load
    showDeltaToggle={false}
    implementations={["baseline", "unicodeIdStart"]}
  />
</CustomFigure>
```

Notes:
- `CustomFigure` does not add any click-to-open behavior.
- Use the same `figures` registry from `InlineFigure` so numbering is shared.
- Set `showNumber={false}` to hide numbering and render only the caption text.
- Use `implementationNames` on `UnicodeBenchmarkChart` to override legend names.

## Lists

```md
- Unordered item
- Another item

1. Ordered item
2. Another item
```

## Math

Inline math and display math are supported:

```md
Inline math: $a^2 + b^2 = c^2$.

Display math:

$$
\int_0^1 x^2 dx = \frac{1}{3}
$$
```

## Code blocks

Basic fenced code blocks:

````md
```rust
fn main() {
    println!("hello");
}
```
````

### Code block metadata

You can pass key-value metadata after the language tag to control rendering.
This is parsed and validated at build time.

````md
```ts filename="src/identifiers.ts" fileurl="https://github.com/org/repo/blob/main/src/identifiers.ts" lineNumbers=true lineStart=120 highlightLines="122,124" highlightCols="121:16-23;124:12-17"
const source = readFileSync(path, "utf8");
const tokens = tokenize(source);
```
````

Supported metadata keys:

- `filename`: string shown in the header above the code block.
- `fileurl`: optional link target for the filename. Requires `filename`.
- `lineNumbers`: `true` or `false` to toggle line numbers.
- `lineStart`: 1-based starting line number. Also enables line numbers.
- `highlightLines`: line ranges, using displayed line numbers.
  Example: `"1,3-5,10"`.
- `highlightCols`: column ranges per line. Format is
  `"line:colStart-colEnd[,colStart-colEnd];line:colStart-colEnd"`.
  Example: `"2:4-8,12-15;5:1-3"`.

Notes:

- Line and column numbers are 1-based and inclusive.
- `highlightLines` and `highlightCols` can be used together.
- Ranges are validated, and invalid metadata will fail the build.
