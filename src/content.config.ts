import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { zPlainDate } from "./lib/zPlainDate";

const articleSchema = z.object({
  title: z.string(),
  date: zPlainDate,
  description: z.string().min(1).optional(),
  summary: z.string().min(1).optional(),
  updated: zPlainDate.optional(),
  tags: z.array(z.string()).default([]),
  heroImage: z.string().optional(),
  ogImage: z.string().min(1).optional(),
  slug: z.string(),
  showAvailabilityNotice: z.boolean().default(true),
}).refine((data) => Boolean(data.description || data.summary), {
  message: "Article frontmatter must include either description or summary.",
});

const articles = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./articles" }),
  schema: articleSchema,
});

const drafts = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./drafts" }),
  schema: articleSchema,
});

export const collections = { articles, drafts };
