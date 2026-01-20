import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { zPlainDate } from "./lib/zPlainDate";

const articleSchema = z.object({
  title: z.string(),
  date: zPlainDate,
  description: z.string().min(1).optional(),
  tags: z.array(z.string()).default([]),
  heroImage: z.string().optional(),
  slug: z.string(),
  showAvailabilityNotice: z.boolean().default(true),
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
