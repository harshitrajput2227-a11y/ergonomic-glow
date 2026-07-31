import { Slider } from "@/components/ui/slider";
import { metricList, presets, subScore, zoneOf, type MetricKey, type SensorReading } from "@/lib/whi";

export function SimulationPanel({
  reading,
  onChange,
  onPreset,
}: {
  reading: SensorReading;
  onChange: (key: MetricKey, value: number) => void;
  onPreset: (r: SensorReading) => void;
}) {
  return (
    <section className="glass-panel rounded-[28px] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="label-eyebrow">Sensor simulation</span>
          <h2 className="mt-1 text-xl font-semibold">Drive the environment</h2>
        </div>
        <span className="mono-num flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-[11px] text-muted-foreground">
          <span className="h-2 w-2 animate-pulse rounded-full bg-signal" />
          SIM MODE
        </span>
      </div>

      <p className="mt-2 max-w-lg text-sm text-muted-foreground">
        Hardware feed (Sensors → NodeMCU → Firebase) is not attached yet, so these controls emit the
        same reading shape the live pipeline will.
      </p>

      <div className="mt-6 space-y-6">
        {metricList.map((m) => {
          const value = reading[m.key];
          const s = subScore(m.key, value);
          const c = s > 80 ? "var(--state-excellent)" : s > 55 ? "var(--state-warn)" : "var(--state-poor)";
          return (
            <div key={m.key}>
              <div className="flex items-baseline justify-between">
                <label className="text-sm font-medium">{m.label}</label>
                <div className="flex items-baseline gap-2">
                  <span className="mono-num text-sm" style={{ color: c, transition: "color 500ms ease" }}>
                    {m.key === "temperature" ? value.toFixed(1) : Math.round(value)} {m.unit}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: c, background: `color-mix(in oklab, ${c} 14%, transparent)` }}
                  >
                    {zoneOf(m.key, value)}
                  </span>
                </div>
              </div>
              <Slider
                className="mt-3"
                min={m.min}
                max={m.max}
                step={m.step}
                value={[value]}
                onValueChange={(v) => onChange(m.key, v[0] ?? value)}
              />
              <div className="mt-1.5 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>{m.zones[0]?.label}</span>
                <span style={{ color: "var(--state-excellent)" }}>Optimal {m.ideal[0]}–{m.ideal[1]}{m.unit === "%" ? "%" : ` ${m.unit}`}</span>
                <span>{m.zones[m.zones.length - 1]?.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-7 border-t border-border/50 pt-5">
        <span className="label-eyebrow">Scenario presets</span>
        <div className="mt-3 flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => onPreset(p.reading)}
              className="rounded-full border border-border/70 bg-secondary/40 px-4 py-2 text-xs font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-signal/70 hover:text-signal"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
