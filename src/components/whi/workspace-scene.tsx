import { metrics, zoneOf, type SensorReading } from "@/lib/whi";

/**
 * CSS-3D workspace scene. Reacts live to every simulated sensor:
 * distance -> avatar depth, light -> scene exposure, temperature -> colour cast,
 * humidity -> atmospheric haze.
 */
export function WorkspaceScene({ reading }: { reading: SensorReading }) {
  const { distance, light, temperature, humidity } = reading;

  // 20cm -> very close (avatar pushed to monitor), 100cm -> far back
  const t = (distance - metrics.distance.min) / (metrics.distance.max - metrics.distance.min);
  const avatarZ = 60 + t * 200;
  const exposure = 0.32 + Math.min(light, 1000) / 1000 * 0.95;
  const warm = (temperature - 12) / 22; // 0 cold .. 1 hot
  const haze = Math.max(0, (humidity - 45) / 45);

  const cast =
    warm > 0.55
      ? `oklch(0.72 ${0.09 * (warm - 0.5)} 42)`
      : `oklch(0.72 ${0.09 * (0.55 - warm)} 240)`;

  return (
    <div className="relative h-[420px] overflow-hidden rounded-[28px] glass-panel">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 80% at 50% 8%, color-mix(in oklab, ${cast} 26%, transparent), transparent 70%)`,
          transition: "background 900ms ease",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ perspective: "900px", perspectiveOrigin: "50% 38%" }}
      >
        {/* floor */}
        <div
          className="grid-floor absolute bottom-[-40px] left-1/2 h-[520px] w-[1200px] -translate-x-1/2"
          style={{ transform: "translateX(-50%) rotateX(72deg)", opacity: 0.5 * exposure }}
        />

        <div
          className="absolute left-1/2 top-1/2 h-0 w-0"
          style={{ transformStyle: "preserve-3d", transform: "translate(-50%,-50%) rotateX(6deg)" }}
        >
          {/* monitor */}
          <div
            style={{
              transformStyle: "preserve-3d",
              transform: "translate3d(-150px,-160px,-60px)",
              position: "absolute",
            }}
          >
            <div
              className="rounded-lg border"
              style={{
                width: 300,
                height: 180,
                borderColor: "var(--glass-line)",
                background: `linear-gradient(160deg, color-mix(in oklab, var(--signal) ${18 + exposure * 22}%, var(--deep)), var(--deep))`,
                boxShadow: `0 0 ${40 + exposure * 60}px color-mix(in oklab, var(--signal) 45%, transparent)`,
                transition: "box-shadow 900ms ease, background 900ms ease",
              }}
            >
              <div className="h-full w-full overflow-hidden rounded-lg p-3 opacity-70">
                {[70, 45, 88, 30, 60].map((w, i) => (
                  <div
                    key={i}
                    className="mb-2 h-2 rounded-full"
                    style={{ width: `${w}%`, background: "color-mix(in oklab, var(--signal) 40%, transparent)" }}
                  />
                ))}
              </div>
              <div className="animate-scanline pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,transparent,color-mix(in_oklab,var(--signal)_18%,transparent),transparent)]" />
            </div>
            <div className="mx-auto h-10 w-3 bg-muted" />
            <div className="mx-auto h-2 w-28 rounded-full bg-muted" />
          </div>

          {/* desk surface */}
          <div
            className="absolute rounded-md"
            style={{
              width: 520,
              height: 220,
              transform: "translate3d(-260px,10px,40px) rotateX(74deg)",
              background:
                "linear-gradient(180deg, color-mix(in oklab, var(--card) 92%, transparent), color-mix(in oklab, var(--deep) 90%, transparent))",
              border: "1px solid var(--glass-line)",
              boxShadow: "0 40px 80px -40px black",
            }}
          />

          {/* avatar */}
          <div
            className="absolute flex flex-col items-center"
            style={{
              transform: `translate3d(-46px,-24px,${avatarZ}px)`,
              transition: "transform 900ms cubic-bezier(.22,1,.36,1)",
            }}
          >
            <div
              className="animate-drift h-12 w-12 rounded-full"
              style={{
                background: "linear-gradient(160deg, color-mix(in oklab, var(--signal) 60%, white), var(--signal))",
                boxShadow: "0 0 30px color-mix(in oklab, var(--signal) 60%, transparent)",
              }}
            />
            <div
              className="mt-1 h-16 w-24 rounded-t-[40px]"
              style={{ background: "color-mix(in oklab, var(--signal) 34%, var(--card))" }}
            />
          </div>

          {/* distance measurement beam */}
          <div
            className="absolute flex items-center"
            style={{ transform: `translate3d(0px,-40px,${avatarZ / 2}px)`, transition: "transform 900ms ease" }}
          >
            <div
              className="mono-num rounded-full border px-3 py-1 text-xs"
              style={{
                borderColor:
                  distance < 55 || distance > 78 ? "var(--state-warn)" : "var(--state-excellent)",
                color: distance < 55 || distance > 78 ? "var(--state-warn)" : "var(--state-excellent)",
                background: "color-mix(in oklab, var(--deep) 70%, transparent)",
                transition: "all 600ms ease",
              }}
            >
              {Math.round(distance)} cm · {zoneOf("distance", distance)}
            </div>
          </div>
        </div>

        {/* darkness / exposure veil */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "var(--deep)", opacity: Math.max(0, 0.78 - exposure * 0.7), transition: "opacity 900ms ease" }}
        />
        {/* humidity haze */}
        <div
          className="pointer-events-none absolute inset-0 backdrop-blur-[2px]"
          style={{
            background: "linear-gradient(0deg, color-mix(in oklab, white 8%, transparent), transparent)",
            opacity: haze,
            transition: "opacity 900ms ease",
          }}
        />
        {/* glare bloom */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(60% 40% at 78% 12%, oklch(0.98 0.06 90 / 55%), transparent 70%)",
            opacity: Math.max(0, (light - 620) / 380),
            transition: "opacity 900ms ease",
          }}
        />
      </div>

      <div className="absolute bottom-4 left-5 flex flex-wrap gap-2">
        {(["light", "temperature", "humidity"] as const).map((k) => (
          <span
            key={k}
            className="mono-num rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur"
          >
            {metrics[k].label}: {zoneOf(k, reading[k])}
          </span>
        ))}
      </div>
      <span className="label-eyebrow absolute right-5 top-4">Live workspace twin</span>
    </div>
  );
}
