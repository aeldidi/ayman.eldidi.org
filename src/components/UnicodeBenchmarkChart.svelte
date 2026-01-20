<script lang="ts">
  type AsciiPct = 0 | 10 | 50 | 90 | 100;

  type ImplKey =
    | "baseline"
    | "bitPacked"
    | "runIndexed"
    | "unicodeIdStart"
    | "unicodeIdTrieRle";

  type Row = {
    size: number;
    baseline: number;
    bitPacked: number;
    runIndexed: number;
    unicodeIdStart: number;
    unicodeIdTrieRle: number;
  };

  type DataByAscii = Record<AsciiPct, Row[]>;

  const ASCII_STOPS: AsciiPct[] = [0, 10, 50, 90, 100];

  const DATA: DataByAscii = {
    0: [
      {
        size: 32,
        baseline: 126.69,
        bitPacked: 25954,
        runIndexed: 700.87,
        unicodeIdStart: 142.6,
        unicodeIdTrieRle: 347.43,
      },
      {
        size: 128,
        baseline: 323.63,
        bitPacked: 109520,
        runIndexed: 2383.9,
        unicodeIdStart: 393.11,
        unicodeIdTrieRle: 1342.6,
      },
      {
        size: 512,
        baseline: 979.7,
        bitPacked: 446180,
        runIndexed: 9160.8,
        unicodeIdStart: 1208.2,
        unicodeIdTrieRle: 5449.2,
      },
    ],
    10: [
      {
        size: 32,
        baseline: 115.6,
        bitPacked: 24934,
        runIndexed: 721.7,
        unicodeIdStart: 134.69,
        unicodeIdTrieRle: 311.61,
      },
      {
        size: 128,
        baseline: 313.92,
        bitPacked: 97424,
        runIndexed: 2648.4,
        unicodeIdStart: 368.13,
        unicodeIdTrieRle: 1229.5,
      },
      {
        size: 512,
        baseline: 912.68,
        bitPacked: 399240,
        runIndexed: 10311,
        unicodeIdStart: 1202.5,
        unicodeIdTrieRle: 4901.7,
      },
    ],
    50: [
      {
        size: 32,
        baseline: 142.07,
        bitPacked: 12727,
        runIndexed: 432.53,
        unicodeIdStart: 163.22,
        unicodeIdTrieRle: 190.97,
      },
      {
        size: 128,
        baseline: 389.65,
        bitPacked: 55145,
        runIndexed: 1407.3,
        unicodeIdStart: 400.99,
        unicodeIdTrieRle: 770.27,
      },
      {
        size: 512,
        baseline: 1055.2,
        bitPacked: 228650,
        runIndexed: 5155.2,
        unicodeIdStart: 1228.9,
        unicodeIdTrieRle: 3002.5,
      },
    ],
    90: [
      {
        size: 32,
        baseline: 141.41,
        bitPacked: 891.03,
        runIndexed: 189.08,
        unicodeIdStart: 150.57,
        unicodeIdTrieRle: 65.201,
      },
      {
        size: 128,
        baseline: 318.83,
        bitPacked: 12658,
        runIndexed: 504.7,
        unicodeIdStart: 273.3,
        unicodeIdTrieRle: 262.49,
      },
      {
        size: 512,
        baseline: 917.55,
        bitPacked: 45167,
        runIndexed: 1731.1,
        unicodeIdStart: 861.07,
        unicodeIdTrieRle: 1024.6,
      },
    ],
    100: [
      {
        size: 32,
        baseline: 139.67,
        bitPacked: 196.93,
        runIndexed: 132.98,
        unicodeIdStart: 121.85,
        unicodeIdTrieRle: 33.909,
      },
      {
        size: 128,
        baseline: 255.17,
        bitPacked: 469.06,
        runIndexed: 259.59,
        unicodeIdStart: 241.08,
        unicodeIdTrieRle: 123.59,
      },
      {
        size: 512,
        baseline: 706.36,
        bitPacked: 1491.8,
        runIndexed: 669.14,
        unicodeIdStart: 642.3,
        unicodeIdTrieRle: 472.58,
      },
    ],
  };

  const LABELS: Record<ImplKey, string> = {
    baseline: "baseline",
    bitPacked: "bit-packed-rle",
    runIndexed: "run-indexed",
    unicodeIdStart: "unicode-id-start",
    unicodeIdTrieRle: "unicode-id-trie-rle",
  };

  const COLORS: Record<ImplKey, string> = {
    baseline: "#1f77b4",
    bitPacked: "#d62728",
    runIndexed: "#ff7f0e",
    unicodeIdStart: "#2ca02c",
    unicodeIdTrieRle: "#9467bd",
  };

  const ALL_IMPLS: ImplKey[] = [
    "baseline",
    "bitPacked",
    "runIndexed",
    "unicodeIdStart",
    "unicodeIdTrieRle",
  ];

  const LEGEND_ROW_HEIGHT = 28;
  const LEGEND_TOP_PADDING = 16;
  const SVG_WIDTH = 650;
  const LEGEND_ITEM_WIDTH = 140;
  const BASE_PADDING = {
    top: LEGEND_TOP_PADDING,
    right: 20,
    bottom: 36,
    left: 56,
  };

  type ChartLayout = {
    svgWidth: number;
    svgHeight: number;
    padding: { top: number; right: number; bottom: number; left: number };
    innerW: number;
    innerH: number;
    minX: number;
    maxX: number;
    xSpan: number;
    maxY: number;
    paths: Array<{ impl: ImplKey; d: string }>;
    legendItems: Array<{ impl: ImplKey; x: number; y: number }>;
    xTicks: Array<{ value: number; x: number }>;
    yTickVals: number[];
    scaleX: (v: number) => number;
    scaleY: (v: number) => number;
  };

  function formatNs(n: number): string {
    if (!Number.isFinite(n)) return String(n);
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " ns";
  }

  function formatTick(n: number): string {
    if (!Number.isFinite(n)) return String(n);
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return String(n);
  }

  function buildLayout(
    data: Row[],
    impls: ImplKey[],
    height: number,
  ): ChartLayout | null {
    if (data.length === 0) return null;
    const minX = Math.min(...data.map((r) => r.size));
    const maxX = Math.max(...data.map((r) => r.size));
    const xSpan = maxX === minX ? 1 : maxX - minX;

    let maxY = 0;
    for (const row of data) {
      for (const impl of impls) {
        const val = row[impl];
        if (val > maxY) maxY = val;
      }
    }
    if (maxY === 0) maxY = 1;

    const svgWidth = SVG_WIDTH;
    const svgHeight = height;
    const innerW = svgWidth - BASE_PADDING.left - BASE_PADDING.right;
    const legendColumns = Math.max(
      1,
      Math.min(impls.length, Math.floor(innerW / LEGEND_ITEM_WIDTH)),
    );
    const legendRows = Math.ceil(impls.length / legendColumns);
    const legendHeight = legendRows * LEGEND_ROW_HEIGHT;
    const padding = {
      top: BASE_PADDING.top + legendHeight,
      right: BASE_PADDING.right,
      bottom: BASE_PADDING.bottom,
      left: BASE_PADDING.left,
    };
    const innerH = svgHeight - padding.top - padding.bottom;

    const scaleX = (v: number) => padding.left + ((v - minX) / xSpan) * innerW;
    const scaleY = (v: number) => padding.top + innerH - (v / maxY) * innerH;

    const paths = impls.map((impl) => {
      const d = data
        .map((row, i) => {
          const x = scaleX(row.size);
          const y = scaleY(row[impl]);
          return `${i === 0 ? "M" : "L"}${x},${y}`;
        })
        .join(" ");
      return { impl, d };
    });

    const xTicks = data.map((r) => ({ value: r.size, x: scaleX(r.size) }));

    const yTicks = 4;
    const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) =>
      Math.round((maxY * i) / yTicks),
    );
    const legendItems = impls.map((impl, idx) => {
      const row = Math.floor(idx / legendColumns);
      const col = idx % legendColumns;
      const rowCount = Math.min(
        legendColumns,
        impls.length - row * legendColumns,
      );
      const rowWidth = rowCount * LEGEND_ITEM_WIDTH;
      const rowStartX = padding.left + (innerW - rowWidth) / 2;
      const x = rowStartX + col * LEGEND_ITEM_WIDTH;
      const y =
        BASE_PADDING.top +
        row * LEGEND_ROW_HEIGHT +
        LEGEND_ROW_HEIGHT / 2;
      return { impl, x, y };
    });

    return {
      svgWidth,
      svgHeight,
      padding,
      innerW,
      innerH,
      minX,
      maxX,
      xSpan,
      maxY,
      paths,
      legendItems,
      xTicks,
      yTickVals,
      scaleX,
      scaleY,
    };
  }

  type BenchmarkAsciiChartProps = {
    implementations?: ImplKey[];
    showDeltaToggle?: boolean;
    defaultShowDeltaEncoded?: boolean;
    defaultAsciiPct?: AsciiPct;
    colors?: Partial<Record<ImplKey, string>>;
    implementationNames?: Partial<Record<ImplKey, string>>;
    labels?: Partial<Record<ImplKey, string>>;
    height?: number;
    showControls?: boolean;
  };

  const props = $props<BenchmarkAsciiChartProps>();
  const implementations = $derived(props.implementations ?? ALL_IMPLS);
  const showDeltaToggle = $derived(props.showDeltaToggle ?? true);
  const defaultShowDeltaEncoded = $derived(
    props.defaultShowDeltaEncoded ?? true,
  );
  const defaultAsciiPct = $derived(props.defaultAsciiPct ?? 90);
  const height = $derived(props.height ?? 420);
  const showControls = $derived(props.showControls ?? true);

  // svelte-ignore state_referenced_locally
  const resolvedDefaultAsciiPct = ASCII_STOPS.includes(defaultAsciiPct)
    ? defaultAsciiPct
    : ASCII_STOPS[0];
  const initialIndex = ASCII_STOPS.indexOf(resolvedDefaultAsciiPct);
  let asciiIndex = $state(initialIndex === -1 ? 0 : initialIndex);
  // svelte-ignore state_referenced_locally
  let showDeltaEncoded = $state(defaultShowDeltaEncoded);

  const asciiPct = $derived(ASCII_STOPS[asciiIndex] ?? ASCII_STOPS[0])!;
  const chartData = $derived(
    [...(DATA[asciiPct] ?? [])].sort((a, b) => a.size - b.size),
  );
  const effectiveLabels = $derived({
    ...LABELS,
    ...(props.labels ?? {}),
    ...(props.implementationNames ?? {}),
  });
  const effectiveColors = $derived({ ...COLORS, ...(props.colors ?? {}) });
  const shouldRenderDeltaToggle = $derived(
    showDeltaToggle && implementations.includes("bitPacked"),
  );
  const implsToShow = $derived.by(() => {
    const allowed = implementations;
    if (!showDeltaToggle) return allowed;
    if (!showDeltaEncoded)
      return allowed.filter((k: ImplKey) => k !== "bitPacked");
    return allowed;
  });
  const layout = $derived(buildLayout(chartData, implsToShow, height));
  let svgEl: SVGSVGElement | null = $state(null);
  let tooltipSize = $state<number | null>(null);
  let tooltipX = $state(0);
  let tooltipY = $state(0);

  const tooltipRow = $derived.by(() => {
    if (tooltipSize === null) return null;
    return chartData.find((row) => row.size === tooltipSize) ?? null;
  });

  const tooltipEntries = $derived(
    tooltipRow
      ? implsToShow.map((impl: ImplKey) => ({
          impl,
          label: effectiveLabels[impl],
          value: tooltipRow[impl],
        }))
      : [],
  );
  const hoverLineX = $derived(
    tooltipRow && layout ? layout.scaleX(tooltipRow.size) : 0,
  );

  $effect(() => {
    if (tooltipSize !== null && !tooltipRow) {
      tooltipSize = null;
    }
  });

  function handlePointerMove(event: PointerEvent) {
    if (!layout || chartData.length === 0) return;
    const target = svgEl ?? (event.currentTarget as SVGSVGElement | null);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    const viewX = (localX / rect.width) * layout.svgWidth;
    const viewY = (localY / rect.height) * layout.svgHeight;

    const withinX =
      viewX >= layout.padding.left &&
      viewX <= layout.padding.left + layout.innerW;
    const withinY =
      viewY >= layout.padding.top &&
      viewY <= layout.padding.top + layout.innerH;
    if (!withinX || !withinY) {
      tooltipSize = null;
      return;
    }

    const clampedViewX = Math.min(
      layout.padding.left + layout.innerW,
      Math.max(layout.padding.left, viewX),
    );
    const xValue =
      layout.minX +
      ((clampedViewX - layout.padding.left) / layout.innerW) * layout.xSpan;

    let nearest = chartData[0]!;
    let nearestDiff = Math.abs(nearest.size - xValue);
    for (const row of chartData) {
      const diff = Math.abs(row.size - xValue);
      if (diff < nearestDiff) {
        nearest = row;
        nearestDiff = diff;
      }
    }

    tooltipSize = nearest.size;
    tooltipX = localX;
    tooltipY = localY;
  }

  function handlePointerLeave() {
    tooltipSize = null;
  }
</script>

<section class="chart-section">
  <div
    class="chart-frame"
    style={`--chart-height:${height}; --chart-width:${SVG_WIDTH};`}
  >
    {#if chartData.length === 0}
      <div class="chart-empty">
        No data for {asciiPct}% ASCII yet. Fill in the DATA table for this
        percentage.
      </div>
    {:else if layout}
      <div class="chart-svg-wrap">
        <svg
          class="chart-svg"
          width="100%"
          height="100%"
          viewBox={`0 0 ${layout.svgWidth} ${layout.svgHeight}`}
          role="img"
          aria-label={`Unicode benchmark chart at ${asciiPct}% ASCII`}
          bind:this={svgEl}
          onpointermove={handlePointerMove}
          onpointerleave={handlePointerLeave}
        >
          <rect
            x={layout.padding.left}
            y={layout.padding.top}
            width={layout.innerW}
            height={layout.innerH}
            fill="transparent"
            pointer-events="all"
          />
          {#each layout.yTickVals as val}
            <g transform={`translate(0 ${layout.scaleY(val)})`} opacity={0.5}>
              <line
                x1={layout.padding.left}
                x2={layout.svgWidth - layout.padding.right}
                y1={0}
                y2={0}
                stroke="rgba(0,0,0,0.1)"
                stroke-dasharray="3 3"
              />
              <text x={layout.padding.left - 8} y={4} text-anchor="end">
                {formatTick(val)}
              </text>
            </g>
          {/each}
          {#each layout.xTicks as tick}
            <g transform={`translate(${tick.x} 0)`}>
              <line
                x1={0}
                x2={0}
                y1={layout.padding.top}
                y2={layout.svgHeight - layout.padding.bottom}
                stroke="rgba(0,0,0,0.1)"
                stroke-dasharray="3 3"
              />
              <line
                x1={0}
                x2={0}
                y1={layout.svgHeight - layout.padding.bottom}
                y2={layout.svgHeight - layout.padding.bottom + 6}
                stroke="currentColor"
              />
              <text
                x={0}
                y={layout.svgHeight - layout.padding.bottom + 18}
                text-anchor="middle"
              >
                {tick.value}
              </text>
            </g>
          {/each}
          <text
            x={(layout.svgWidth - layout.padding.right + layout.padding.left) /
              2}
            y={layout.svgHeight - 6}
            text-anchor="middle"
            font-weight="600"
          >
            Input size (bytes)
          </text>
          <text
            x={12}
            y={layout.padding.top +
              (layout.svgHeight - layout.padding.top - layout.padding.bottom) /
                2}
            text-anchor="middle"
            font-weight="600"
            transform={`rotate(-90 12 ${
              layout.padding.top +
              (layout.svgHeight - layout.padding.top - layout.padding.bottom) /
                2
            })`}
          >
            Execution time (ns)
          </text>
          {#each layout.paths as path}
            <path
              d={path.d}
              fill="none"
              stroke={effectiveColors[path.impl]}
              stroke-width="2"
            />
          {/each}
          {#if tooltipRow}
            <line
              x1={hoverLineX}
              x2={hoverLineX}
              y1={layout.padding.top}
              y2={layout.svgHeight - layout.padding.bottom}
              stroke="rgba(0,0,0,0.2)"
            />
            {#each implsToShow as impl}
              <circle
                cx={hoverLineX}
                cy={layout.scaleY(tooltipRow[impl as ImplKey])}
                r={3}
                fill={effectiveColors[impl]}
              />
            {/each}
          {/if}
          <g>
            {#each layout.legendItems as item}
              <g transform={`translate(${item.x} ${item.y})`}>
                <rect
                  x={0}
                  y={-8}
                  width={22}
                  height={4}
                  rx={2}
                  fill={effectiveColors[item.impl]}
                />
                <text x={26} y={-4} dominant-baseline="central">
                  {effectiveLabels[item.impl]}
                </text>
              </g>
            {/each}
          </g>
        </svg>
        {#if tooltipRow}
          <div
            class="chart-tooltip"
            style={`left:${tooltipX}px; top:${tooltipY}px;`}
          >
            <div class="chart-tooltip__title">
              Input size: {tooltipRow.size}
            </div>
            {#each tooltipEntries as entry}
              <div class="chart-tooltip__row">
                <span
                  class="chart-tooltip__swatch"
                  style={`background:${effectiveColors[entry.impl]};`}
                ></span>
                <span class="chart-tooltip__label">{entry.label}</span>
                <span class="chart-tooltip__value">{formatNs(entry.value)}</span
                >
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
  {#if showControls}
    <div class="chart-controls">
      <span class="chart-label">ASCII input percentage</span>
      <label class="chart-slider">
        <input
          type="range"
          min={0}
          max={ASCII_STOPS.length - 1}
          step={1}
          bind:value={asciiIndex}
          aria-label="ASCII percentage"
        />
        <div class="chart-stops">
          {#each ASCII_STOPS as p}
            <span>{p}%</span>
          {/each}
        </div>
      </label>
      {#if shouldRenderDeltaToggle}
        <label class="chart-toggle">
          <input type="checkbox" bind:checked={showDeltaEncoded} />
          <span>Show delta-encoded</span>
        </label>
      {/if}
    </div>
  {/if}
</section>

<style>
  .chart-section {
    width: min(90%, 650px);
  }

  .chart-controls {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    margin-bottom: 5px;
  }

  .chart-label {
    font-size: 14px;
    padding-bottom: 35px;
  }

  .chart-slider {
    display: grid;
    gap: 6px;
    flex-grow: 1;
    min-width: 180px;
  }

  .chart-stops {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    opacity: 0.75;
  }

  .chart-toggle {
    display: flex;
    gap: 8px;
    align-items: center;
    user-select: none;
    font-family: var(--font-mono);
    font-size: 13px;
  }

  .chart-frame {
    width: 100%;
    position: relative;
    aspect-ratio: var(--chart-width) / var(--chart-height);
  }

  .chart-svg-wrap {
    width: 100%;
    height: 100%;
    min-height: 100%;
    position: relative;
  }

  .chart-svg {
    font-family: var(--font-body);
    font-size: 13px;
    line-height: 24px;
  }

  .chart-empty {
    padding: 12px;
    opacity: 0.8;
  }

  .chart-tooltip {
    position: absolute;
    background: var(--color-surface);
    color: var(--color-text);
    border: var(--border-thin) solid var(--color-border-subtle);
    padding: 8px 10px;
    font-size: 12px;
    font-family: var(--font-body);
    pointer-events: none;
    transform: translate(12px, -12px);
    z-index: 1;
    min-width: 160px;
  }

  .chart-tooltip__title {
    font-family: var(--font-body);
    font-weight: 600;
    margin-bottom: 6px;
  }

  .chart-tooltip__row {
    display: grid;
    grid-template-columns: 12px 1fr auto;
    align-items: center;
    gap: 6px;
    padding: 2px 0;
  }

  .chart-tooltip__swatch {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    display: inline-block;
  }

  .chart-tooltip__value {
    font-variant-numeric: tabular-nums;
  }

  @media (max-width: 600px) {
    .chart-label {
      padding-bottom: 0;
    }
  }
</style>
