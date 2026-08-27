import { cn } from "@/lib/utils"

const NODES = [
  { x: 120, y: 120 },
  { x: 300, y: 60 },
  { x: 520, y: 140 },
  { x: 720, y: 70 },
  { x: 920, y: 160 },
  { x: 1080, y: 90 },
  { x: 200, y: 320 },
  { x: 420, y: 280 },
  { x: 620, y: 360 },
  { x: 840, y: 300 },
  { x: 1040, y: 380 },
  { x: 160, y: 520 },
  { x: 380, y: 560 },
  { x: 600, y: 520 },
  { x: 820, y: 580 },
  { x: 1010, y: 540 },
] as const

const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
  [0, 6], [1, 7], [2, 8], [3, 9], [4, 10],
  [6, 7], [7, 8], [8, 9], [9, 10],
  [6, 11], [7, 12], [8, 13], [9, 14], [10, 15],
  [11, 12], [12, 13], [13, 14], [14, 15],
  [2, 7], [3, 8], [8, 13],
] as const

const MINT_EDGES = new Set(["2-8", "8-13", "7-8", "3-9"])

export function NetworkField({
  className,
  glow = true,
}: {
  className?: string
  glow?: boolean
}) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {glow && (
        <div
          aria-hidden
          className="absolute left-1/2 top-[-10%] size-[70vw] -translate-x-1/2 animate-glow-drift rounded-full opacity-70 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(150,235,205,0.16), rgba(150,235,205,0.05) 38%, transparent 68%)",
          }}
        />
      )}

      <svg
        aria-hidden
        className="absolute inset-0 size-full"
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <g stroke="rgb(255 255 255 / 0.10)" strokeWidth={1}>
          {EDGES.map(([a, b], i) => {
            const key = `${a}-${b}`
            const mint = MINT_EDGES.has(key)
            return (
              <line
                key={i}
                x1={NODES[a].x}
                y1={NODES[a].y}
                x2={NODES[b].x}
                y2={NODES[b].y}
                stroke={mint ? "rgb(150 235 205 / 0.35)" : "rgb(255 255 255 / 0.10)"}
                strokeDasharray={mint ? "4 8" : undefined}
                className={mint ? "animate-hairline" : undefined}
              />
            )
          })}
        </g>

        <g>
          {NODES.map((n, i) => {
            const accent = i === 8 || i === 13 || i === 2
            return (
              <g key={i} className="animate-node-breathe" style={{ animationDelay: `${i * 0.4}s` }}>
                {accent && (
                  <circle cx={n.x} cy={n.y} r={9} fill="rgb(150 235 205 / 0.10)" />
                )}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={accent ? 2.6 : 1.8}
                  fill={accent ? "rgb(170 240 215)" : "rgb(255 255 255 / 0.65)"}
                />
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}
