declare module "typeset" {
  export type TypesetModule =
    | "quotes"
    | "hyphenate"
    | "ligatures"
    | "smallCaps"
    | "punctuation"
    | "hangingPunctuation"
    | "spaces";
  export interface TypesetOptions {
    // array of features to enable.
    enable?: TypesetModule[];
    // array of features to disable.
    disable?: TypesetModule[];
    // string of CSS selector(s) to ignore.
    ignore?: string;
    // string of CSS selector(s) to exclusively apply typesetting to.
    only?: string;
  }
  export default function (html: string, options: TypesetOptions): string;
}
