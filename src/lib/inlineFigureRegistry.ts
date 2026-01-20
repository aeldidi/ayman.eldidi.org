export type InlineFigureRegistry = {
  register: (id: string) => number;
  get: (id: string) => number;
  has: (id: string) => boolean;
};

// Create a per-article registry to keep figure numbers stable and reusable.
export function createInlineFigureRegistry(): InlineFigureRegistry {
  let counter = 0;
  const ids = new Map<string, number>();

  return {
    register: (id) => {
      const existing = ids.get(id);
      if (existing !== undefined) {
        return existing;
      }

      counter += 1;
      ids.set(id, counter);
      return counter;
    },
    get: (id) => {
      const value = ids.get(id);
      if (value === undefined) {
        throw new Error(
          `InlineFigure registry has no entry for "${id}". ` +
            "Ensure the figure renders before referencing it, or call " +
            `registry.register("${id}") first.`
        );
      }
      return value;
    },
    has: (id) => ids.has(id),
  };
}
