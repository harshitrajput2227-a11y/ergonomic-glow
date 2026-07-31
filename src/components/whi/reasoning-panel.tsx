import { ArrowDownRight, ArrowUpRight, Brain, Sparkles } from "lucide-react";
import { actionPlan, type Reasoning, type SensorReading } from "@/lib/whi";

export function ReasoningPanel({
  reasoning,
  reading,
  stamp,
}: {
  reasoning: Reasoning;
  reading: SensorReading;
  stamp: number;
}) {
  const negative = reasoning.delta < 0;
  const tone = negative ? "var(--state-poor)" : reasoning.delta > 0 ? "var(--state-excellent)" : "var(--signal)";

  return (
    <section className="glass-panel relative overflow-hidden rounded-[28px] p-7">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl"
        style={{ background: tone, opacity: 0.16, transition: "background 700ms ease" }}
      />
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: "color-mix(in oklab, var(--signal) 16%, transparent)", color: "var(--signal)" }}
        >
          <Brain className="h-5 w-5" />
        </span>
        <div>
          <span className="label-eyebrow">Intelligence layer</span>
          <h2 className="text-xl font-semibold">Why did my workspace score change?</h2>
        </div>
      </div>

      <div key={stamp} className="animate-rise mt-6">
        <div className="flex items-center gap-3">
          <span
            className="mono-num flex items-center gap-1 rounded-full px-3 py-1 text-lg font-semibold"
            style={{ color: tone, background: `color-mix(in oklab, ${tone} 12%, transparent)` }}
          >
            {negative ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
            {reasoning.delta > 0 ? "+" : ""}
            {reasoning.delta}
          </span>
          <p className="text-base font-medium text-foreground">{reasoning.headline}</p>
        </div>

        <ul className="mt-5 space-y-3">
          {reasoning.lines.map((l, i) => (
            <li
              key={l.key}
              className="animate-rise flex items-start gap-3 rounded-2xl border border-border/50 bg-background/40 p-4"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  background: l.direction === "down" ? "var(--state-poor)" : "var(--state-excellent)",
                  boxShadow: `0 0 12px ${l.direction === "down" ? "var(--state-poor)" : "var(--state-excellent)"}`,
                }}
              />
              <p className="text-sm leading-relaxed text-foreground/90">{l.text}</p>
              <span
                className="mono-num ml-auto shrink-0 text-sm"
                style={{ color: l.direction === "down" ? "var(--state-poor)" : "var(--state-excellent)" }}
              >
                {l.delta > 0 ? "+" : ""}
                {l.delta.toFixed(1)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-2xl border border-signal/25 bg-signal/[0.06] p-5">
          <div className="flex items-center gap-2 text-signal">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-[0.18em]">Coach's next moves</span>
          </div>
          <ol className="mt-3 space-y-2">
            {actionPlan(reading).map((a, i) => (
              <li key={a} className="flex gap-3 text-sm text-foreground/90">
                <span className="mono-num text-signal/70">0{i + 1}</span>
                {a}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
