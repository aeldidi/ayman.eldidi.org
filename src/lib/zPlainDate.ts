import { z } from "astro:content";
import { Temporal } from "temporal-polyfill";

// Allows getting and validating a Temporal.PlainDate out of a frontmatter.
// Returns a string in YYYY-MM-DD format, which can be given to
// Temporal.PlainDate.from. I can't just store it as a Temporal.PlainDate
// object, since you get the error 'Cannot stringify arbitrary non‑POJOs'.
export const zPlainDate = z
  .union([z.string(), z.date()])
  .transform((arg, ctx) => {
    if (arg instanceof Date) {
      return Temporal.Instant.from(arg.toISOString())
        .toZonedDateTimeISO("UTC")
        .toPlainDate()
        .toJSON();
    }

    try {
      return Temporal.PlainDate.from(arg).toJSON();
    } catch {
      try {
        return Temporal.Instant.from(arg)
          .toZonedDateTimeISO("UTC")
          .toPlainDate()
          .toJSON();
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_date,
          message: "date must be in YYYY-MM-DD, ISO-8601 or JS Date object",
        });
        return z.NEVER;
      }
    }
  });
