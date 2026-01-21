# Personal Website Design System — “Workshop / Blueprint” Theme

This document defines the visual and structural design system for the website.  
Its goal is to preserve clarity, readability, and maintainability while introducing
a restrained workshop / blueprint atmosphere through texture, color, and layout logic.

This is **not** a skeuomorphic theme.  
Materials are referenced abstractly, never represented as objects.

---

## 1. Core Design Principles

### 1.1 Materials Without Objects

- Use _material cues_ (paper, blueprint, wood) without depicting physical objects.
- No shadows, elevation, torn edges, or realism.
- Everything lies on a flat plane.

### 1.2 Flat Over Depth

- Structure is expressed through spacing, rules, and alignment.
- Never through drop shadows, cards, or floating layers.

### 1.3 Scalable by Default

- Any new article, image, chart, or code block must fit naturally
  without requiring custom styling or assets.

---

## 2. Color System

### 2.1 Primary Colors

- Blueprint Blue: `#0066ff`
- Accent Orange: `#e67e22`

### 2.2 Supporting Neutrals

- Blueprint Background: `#f4f7fb`
- Paper Background: `#fafafa` (or equivalent off-white)
- Primary Text: `#1f2937`
- Secondary Text: `#4b5563`
- Rule / Divider: `#dbe3f0`

### 2.3 Usage Rules

- Blue is structural and environmental.
- Orange is _annotation only_.
- Orange must never be used for large text fills or backgrounds.
- If orange is removed, the design must still function visually.

---

## 3. Typography

### 3.1 Fonts

- Primary: **Open Sans**
- Monospace: **Inconsolata**

### 3.2 Usage

- Headings, body, navigation: Open Sans
- Metadata, labels, captions, annotations: Inconsolata

### 3.3 Emphasis

- Use weight, spacing, and rules for hierarchy.
- Do **not** introduce additional fonts for emphasis.
- Do **not** use italics for structural meaning.

---

## 4. Page Structure

### 4.1 Global Layout

- Body background: blueprint-style surface
- Content column: flat paper surface
- Footer: grounded base at bottom of viewport

No part of the content should appear elevated above another.

---

## 5. Header (Navigation)

### 5.1 Visual Treatment

- Blueprint blue background touches the top of the viewport.
- No top or side borders.
- Single horizontal rule at the bottom only.

### 5.2 Texture

- Blueprint texture is subtle and large-scale.
- Grid lines must be low contrast and barely perceptible.

### 5.3 Navigation

- Active link is indicated by an orange underline.
- No background fills for active states.

---

## 6. Background Textures

### 6.1 Blueprint Background

- Large grid (48px–64px).
- Grid opacity: extremely low (≈3–5%).
- Purpose: environmental depth, not decoration.

### 6.2 Paper Background (Content Area)

- Very subtle noise or fiber texture.
- No visible grain patterns.
- No shadows, bevels, or edge effects.

Rule:

> Texture should disappear at reading distance.

---

## 7. Content Area

### 7.1 General Rules

- Flat surface.
- No elevation.
- Separation via spacing and thin rules only.

### 7.2 Article Header Block

- Use dashed or thin solid outlines.
- Light background tint allowed.
- Metadata in Inconsolata.
- Status tags (e.g. “Open to work”) are annotations, not badges.

Status tag rules:

- Orange outline
- Transparent background
- Monospace text
- No rotation or stamping effects

---

## 8. Figures, Charts, and Media

### 8.1 Framing

- No cards.
- No shadows.
- No heavy backgrounds.

### 8.2 Structure

- Use thin rules or dashed outlines.
- Figures sit directly on the paper surface.

### 8.3 Captions

- Inconsolata
- Smaller size
- Neutral color

Figures should feel _drafted_, not displayed.

---

## 9. Links and Interaction

### 9.1 Links

- Default: blue text
- Hover / focus: orange underline
- Underlines preferred over color changes

### 9.2 Interaction Feedback

- Subtle only
- No animations that imply physical movement or depth

---

## 10. Footer

### 10.1 Placement

- Always at the bottom of the page.
- Never float or overlap content.

### 10.2 Visual Treatment

- Muted wood texture
- Heavily desaturated
- Overlaid with light neutral to preserve text contrast

### 10.3 Content

- Minimal
- Neutral text color
- No accent color usage unless for links

---

## 11. What to Avoid (Hard Rules)

- No drop shadows
- No elevated cards
- No realistic paper edges
- No taped, clipped, or pinned elements
- No serif typography
- No heavy or high-contrast textures
- No decorative icons unrelated to function

---

## 12. Mental Model for Future Design Decisions

When unsure, ask:

> “Would this make sense in a technical notebook or engineering drawing?”

If the answer is no, do not include it.

---

## 13. Favicon Updates

To update the favicon, replace `public/favicon.svg` and run:

```
npm run generate:favicon
```

This regenerates `public/favicon.ico` plus the PNG sizes referenced in the
layout head tags.

## 14. Summary

This design system aims to communicate:

- Precision
- Craft
- Technical clarity
- Intentional restraint

The aesthetic supports the content; it never competes with it.
