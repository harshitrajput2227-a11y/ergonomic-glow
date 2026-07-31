import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, ChevronDown } from "lucide-react";

import { ScoreOrb } from "@/components/whi/score-orb";
import { WorkspaceScene } from "@/components/whi/workspace-scene";
import { SimulationPanel } from "@/components/whi/simulation-panel";
import { ReasoningPanel } from "@/components/whi/reasoning-panel";
import { Recommendations } from "@/components/whi/recommendations";
import { BreakTimer } from "@/components/whi/break-timer";
import { Analytics, type HistoryPoint } from "@/components/whi/analytics";
import {
  defaultReading,
  explain,
  healthScore,
  recommend,
  type MetricKey,
  type Reasoning,
  type SensorReading,
} from "@/lib/whi";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Workspace Health Intelligence — Live Ergonomic Score & AI Coach" },
      {
        name: "description",
        content:
          "WHI reads screen distance, light, temperature and humidity to score your desk 0-100, explain every change, and coach you back to a healthy workspace.",
      },
      { property: "og:title", content: "Workspace Health Intelligence (WHI)" },
      {
        property: "og:description",
        content:
          "A live workspace twin that scores your ergonomic environment and explains exactly why it changed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [reading, setReading] = useState<SensorReading>(defaultReading);
  const prevRef = useRef<SensorReading>(defaultReading);
  const [reasoning, setReasoning] = useState<Reasoning>(() => explain(defaultReading, defaultReading));
  const [stamp, setStamp] = useState(0);
  const [history, setHistory] = useState<HistoryPoint[]>([
    { t: Date.now(), score: healthScore(defaultReading), ...defaultReading },
  ]);
  const [breaks, setBreaks] = useState(0);
  const startedAt = useRef(Date.now());
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);

  const score = healthScore(reading);

  /** A single commit point: swap this for the Firebase subscription when hardware lands. */
  const applyReading = useCallback((next: SensorReading) => {
    setReading(next);
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      setReasoning(explain(prevRef.current, next));
      setStamp((s) => s + 1);
      prevRef.current = next;
    }, 550);
  }, []);

  const onChange = useCallback(
    (key: MetricKey, value: number) => applyReading({ ...reading, [key]: value }),
    [reading, applyReading],
  );

  // rolling telemetry
  useEffect(() => {
    const id = setInterval(() => {
      setHistory((h) => [...h.slice(-119), { t: Date.now(), score: healthScore(reading), ...reading }]);
    }, 3000);
    return () => clearInterval(id);
  }, [reading]);

  const recs = useMemo(() => recommend(reading), [reading]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-deep">
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute left-1/4 top-[-10%] h-[520px] w-[520px] rounded-full bg-signal/10 blur-[140px]" />
        <div className="absolute right-[-5%] top-1/3 h-[420px] w-[420px] rounded-full bg-excellent/10 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-[1280px] px-5 pb-24 pt-8 md:px-8">
        {/* header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal/15 text-signal">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold tracking-[0.16em] text-foreground">WHI</p>
              <p className="text-[11px] text-muted-foreground">Workspace Health Intelligence</p>
            </div>
          </div>
          <div className="mono-num flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 text-[11px] text-muted-foreground backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-excellent" />
            Sensors → NodeMCU → Firebase · simulated feed active
          </div>
        </header>

        {/* hero */}
        <section className="mt-10 grid items-center gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
          <div>
            <h1 className="text-[40px] font-semibold leading-[1.05] md:text-[52px]">
              Your desk has a
              <span className="block text-signal">health score.</span>
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              WHI watches screen distance, light, temperature and humidity — then tells you{" "}
              <span className="text-foreground">why</span> your workspace health moved and what to fix
              next. Drag any slider below and watch the twin react.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <ChevronDown className="h-4 w-4 animate-bounce text-signal" />
              Live reasoning updates in under a second
            </div>
            <div className="mt-8 lg:hidden">
              <ScoreOrb score={score} reading={reading} />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
            <div className="hidden lg:block">
              <ScoreOrb score={score} reading={reading} />
            </div>
            <WorkspaceScene reading={reading} />
          </div>
        </section>

        {/* controls + reasoning */}
        <section className="mt-8 grid items-start gap-5 lg:grid-cols-[minmax(0,440px)_1fr]">
          <SimulationPanel reading={reading} onChange={onChange} onPreset={applyReading} />
          <ReasoningPanel reasoning={reasoning} reading={reading} stamp={stamp} />
        </section>

        <section className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,440px)_1fr]">
          <BreakTimer onBreakComplete={() => setBreaks((b) => b + 1)} />
          <Recommendations items={recs} />
        </section>

        <div className="mt-8">
          <Analytics history={history} reading={reading} breaks={breaks} startedAt={startedAt.current} />
        </div>

        <footer className="mt-14 border-t border-border/50 pt-6 text-xs text-muted-foreground">
          Prototype · simulated sensor inputs. The reading contract is hardware-ready — swap the
          simulator for the Firebase stream and the entire intelligence layer keeps working.
        </footer>
      </div>
    </main>
  );
}
