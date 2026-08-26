import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "motion/react"

type DriftWallItem = {
  image: string
  title: string
  quote: string
  author: string
  role: string
}

type DriftWallProps = {
  items: DriftWallItem[]
  columns?: number
  tileWidth?: number
  tileHeight?: number
  gap?: number
  speed?: number
  direction?: "up" | "down"
}

function DriftCard({
  item,
  width,
  height,
  index,
}: {
  item: DriftWallItem
  width: number
  height: number
  index: number
}) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]"
      style={{ width, height }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
    >
      <div className="relative h-full w-full">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover opacity-60"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <p className="text-[11px] leading-relaxed text-white/70 line-clamp-3">
            &ldquo;{item.quote}&rdquo;
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-white/15 text-[10px] font-bold text-white">
              {item.author[0]}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white">{item.author}</p>
              <p className="text-[9px] text-white/40">{item.role}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function DriftWall({
  items,
  columns = 4,
  tileWidth = 220,
  tileHeight = 260,
  gap = 16,
  speed = 30,
  direction = "up",
}: DriftWallProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    direction === "up" ? [speed, -speed] : [-speed, speed]
  )

  useEffect(() => {
    return y.on("change", (v) => setOffset(v))
  }, [y])

  const duplicated = [...items, ...items, ...items]

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ height: tileHeight * 2 + gap }}
    >
      <div
        className="flex gap-4"
        style={{
          transform: `translateY(${offset}px)`,
          transition: "transform 0.1s linear",
        }}
      >
        {Array.from({ length: columns }).map((_, col) => (
          <div
            key={col}
            className="flex flex-col"
            style={{
              gap,
              marginTop: col % 2 === 0 ? 0 : tileHeight / 2 + gap / 2,
            }}
          >
            {duplicated
              .filter((_, i) => i % columns === col)
              .map((item, i) => (
                <DriftCard
                  key={`${col}-${i}`}
                  item={item}
                  width={tileWidth}
                  height={tileHeight}
                  index={i}
                />
              ))}
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0a0a0a] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
    </div>
  )
}
