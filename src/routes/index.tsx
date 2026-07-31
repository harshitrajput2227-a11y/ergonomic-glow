import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { WorkspaceScene } from "@/components/whi/workspace-scene";
import { ControlDeck } from "@/components/whi/control-deck";
import { Narrative } from "@/components/whi/narrative";
import { Guidance } from "@/components/whi/guidance";
import { BreakTimer } from "@/components/whi/break-timer";
import { Analytics, type HistoryPoint } from "@/components/whi/analytics";
import { useSmoothNumber } from "@/lib/use-smooth-number";
import {
  defaultReading,
  explain,
  healthScore,
  recommend,
  statusOf,
  statusTone,
  type MetricKey,
  type Reasoning,
  type SensorReading,
} from "@/lib/whi";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WHI — The workspace that tells you how it feels" },
      {
        name: "description",
        content:
          "Workspace Health Intelligence reads screen distance, light, temperature and humidity, renders your desk live, and explains in plain language why your health score moved.",
      },
      { property: "og:title", content: "WHI — Workspace Health Intelligence" },
      {
        property: "og:description",
        content:
          "A living model of your desk. Watch the room change, see the score move, understand exactly why.",
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
    { t: 0, score: healthScore(defaultReading), ...defaultReading },
  ]);
  const [breaks, setBreaks] = useState(0);
  const startedAt = useRef(0);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const score = healthScore(reading);
  const smooth = useSmoothNumber(score, 0.1);
  const status = statusOf(score);
  const tone = statusTone(status);
  const headline =
    status === "Excellent"
      ? "in excellent shape."
      : status === "Good"
        ? "in good shape."
        : status === "Needs Improvement"
          ? "asking for a change."
          : "working against you.";


  /** Single commit point: swap for the Firebase subscription when hardware lands. */
  const applyReading = useCallback((next: SensorReading) => {
    setReading(next);
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      setReasoning(explain(prevRef.current, next));
      setStamp((s) => s + 1);
      prevRef.current = next;
    }, 520);
  }, []);

  const onChange = useCallback(
    (key: MetricKey, value: number) => applyReading({ ...reading, [key]: value }),
    [reading, applyReading],
  );

  useEffect(() => {
    const id = setInterval(() => {
      setHistory((h) => [...h.slice(-119), { t: Date.now(), score: healthScore(reading), ...reading }]);
    }, 3000);
    return () => clearInterval(id);
  }, [reading]);

  const recs = useMemo(() => recommend(reading), [reading]);

  return (
    <main className="min-h-screen bg-deep">
      {/* device header */}
      <header className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-6 md:px-10">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-[15px] tracking-[0.34em] text-foreground">WHI</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Workspace Health Intelligence
          </span>
        </div>
        <span className="mono-num flex items-center gap-2 text-[11px] text-muted-foreground">
          <span
            className="h-1.5 w-1.5 animate-breath rounded-full"
            style={{ background: tone.color }}
          />
          Sensing
        </span>
      </header>

      {/* ACT ONE — the room */}
      <section className="mx-auto max-w-[1240px] px-6 pt-6 md:px-10 md:pt-10">
        <h1 className="max-w-[16ch] text-[42px] leading-[0.98] md:text-[76px]">
          Your workspace is
          <span className="block" style={{ color: tone.color, transition: "color 900ms ease" }}>
            {headline}
          </span>
        </h1>


        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px] lg:items-end">
          <div className="animate-fade">
            <WorkspaceScene reading={reading} />
          </div>

          <div className="lg:pb-2">
            <span className="label-eyebrow">Workspace health</span>
            <div className="mt-3 flex items-end gap-2">
              <span
                className="display-num text-[104px] md:text-[132px]"
                style={{ color: tone.color, transition: "color 900ms ease" }}
              >
                {Math.round(smooth)}
              </span>
              <span className="mono-num pb-4 text-sm text-muted-foreground">/100</span>
            </div>
            <p className="mt-5 max-w-[36ch] text-[15px] leading-relaxed text-muted-foreground">
              Everything in the scene above is a live sensor. Move a control and the room dims,
              warms, thickens or shifts — and the score follows for a reason you can read.
            </p>
          </div>
        </div>
      </section>

      {/* ACT TWO — the controls and the explanation */}
      <section className="mx-auto mt-24 max-w-[1240px] px-6 md:px-10">
        <div className="hairline-t grid gap-16 pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-24">
          <ControlDeck reading={reading} onChange={onChange} onPreset={applyReading} />
          <Narrative reasoning={reasoning} reading={reading} stamp={stamp} />
        </div>
      </section>

      {/* ACT THREE — guidance */}
      <section className="mx-auto mt-24 max-w-[1240px] px-6 md:px-10">
        <div className="hairline-t pt-12">
          <Guidance items={recs} />
        </div>
      </section>

      {/* ACT FOUR — rest */}
      <section className="mx-auto mt-24 max-w-[1240px] px-6 md:px-10">
        <div className="hairline-t grid gap-16 pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-24">
          <BreakTimer onBreakComplete={() => setBreaks((b) => b + 1)} />
          <div>
            <span className="label-eyebrow">Session</span>
            <h2 className="mt-4 max-w-[20ch] text-[30px] leading-[1.12] md:text-[40px]">
              A record builds quietly while you work.
            </h2>
            <p className="mt-5 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
              WHI samples your environment continuously. The history below is the same reading
              stream the hardware pipeline will produce — sensors, NodeMCU, cloud, screen.
            </p>
          </div>
        </div>
      </section>

      {/* ACT FIVE — history, deliberately last */}
      <section className="mx-auto mt-24 max-w-[1240px] px-6 md:px-10">
        <div className="hairline-t pt-12">
          <Analytics history={history} reading={reading} breaks={breaks} startedAt={startedAt.current} />
        </div>
      </section>

      <footer className="mx-auto mt-24 max-w-[1240px] px-6 pb-16 md:px-10">
        <div className="hairline-t pt-6 text-xs text-muted-foreground">
          Prototype · simulated sensor inputs. The reading contract is hardware-ready.
        </div>
      </footer>
    </main>
  );
}
