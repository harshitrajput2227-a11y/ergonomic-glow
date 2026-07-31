import { Droplets, Eye, Sun, Thermometer, Timer } from "lucide-react";
import type { Recommendation } from "@/lib/whi";

const icons = { eye: Eye, sun: Sun, thermo: Thermometer, droplet: Droplets, timer: Timer };

const toneOf = (s: Recommendation["severity"]) =>
  s === "critical" ? "var(--state-poor)" : s === "warning" ? "var(--state-warn)" : "var(--state-excellent)";

export function Recommendations({ items }: { items: Recommendation[] }) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <span className="label-eyebrow">Adaptive guidance</span>
          <h2 className="text-xl font-semibold">Recommendations, ranked by impact</h2>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {items.map((r, i) => {
          const Icon = icons[r.icon];
          const tone = toneOf(r.severity);
          return (
            <article
              key={r.id}
              className="group animate-rise relative overflow-hidden rounded-[22px] border border-border/60 bg-card/50 p-5 backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-signal/50"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className="absolute inset-x-0 top-0 h-[2px]"
                style={{ background: tone, opacity: 0.8, transition: "background 600ms ease" }}
              />
              <div className="flex items-start gap-4">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110"
                  style={{ background: `color-mix(in oklab, ${tone} 14%, transparent)`, color: tone }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{r.title}</h3>
                    {r.impact > 0 && (
                      <span className="mono-num rounded-full px-2 py-0.5 text-[10px]" style={{ color: tone, background: `color-mix(in oklab, ${tone} 12%, transparent)` }}>
                        −{r.impact} pts
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
