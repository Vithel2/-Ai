"use client"

interface IndicatorPanelProps {
  happiness: number
  satiety: number
  water: number
  reputation: number
  money: number
}

// Панель в исходной картинке 1280x1280 занимает область:
// x: 148..1030 (ширина 882), y: 505..718 (высота 213)
const PANEL_X = 148
const PANEL_Y = 505
const PANEL_W = 882
const PANEL_H = 213
const IMG_SIZE = 1280

function pctX(x: number) {
  return `${(((x - PANEL_X) / PANEL_W) * 100).toFixed(1)}%`
}
function pctY(y: number) {
  return `${(((y - PANEL_Y) / PANEL_H) * 100).toFixed(1)}%`
}

export function IndicatorPanel({ happiness, satiety, water, reputation, money }: IndicatorPanelProps) {
  const values: { x: number; y: number; value: number; color: string; label: string }[] = [
    { x: 330, y: 555, value: happiness, color: "#e8930c", label: "Счастье" },
    { x: 340, y: 662, value: satiety, color: "#dc2626", label: "Сытость" },
    { x: 528, y: 615, value: water, color: "#2563eb", label: "Вода" },
    { x: 862, y: 568, value: reputation, color: "#1a1a1a", label: "Репутация" },
    { x: 872, y: 668, value: money, color: "#15803d", label: "Деньги" },
  ]

  return (
    <div
      className="pointer-events-none absolute top-0.5 right-0.5 z-30 w-[420px] max-w-[45vw]"
      style={{ aspectRatio: `${PANEL_W} / ${PANEL_H}` }}
      role="status"
      aria-label={`Счастье ${Math.floor(happiness)}, сытость ${Math.floor(satiety)}, вода ${Math.floor(water)}, репутация ${Math.floor(reputation)}, деньги ${Math.floor(money)}`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img/indicator.png"
          alt=""
          aria-hidden="true"
          className="absolute max-w-none"
          style={{
            width: `${((IMG_SIZE / PANEL_W) * 100).toFixed(2)}%`,
            left: `${((-PANEL_X / PANEL_W) * 100).toFixed(2)}%`,
            top: `${((-PANEL_Y / PANEL_H) * 100).toFixed(2)}%`,
          }}
        />
        {values.map((v) => (
          <span
            key={v.label}
            className="absolute -translate-y-1/2 text-xl font-bold md:text-2xl"
            style={{ left: pctX(v.x), top: pctY(v.y), color: v.color }}
          >
            {Math.floor(v.value)}
          </span>
        ))}
      </div>
    </div>
  )
}
