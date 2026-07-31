import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, Pause, Play, RotateCcw } from "lucide-react";

const WORK_OPTIONS = [20, 45, 60];

export function BreakTimer({ onBreakComplete }: { onBreakComplete: () => void }) {
  const [sessionMin, setSessionMin] = useState(20);
  const [running, setRunning] = useState(true);
  const [left, setLeft] = useState(sessionMin * 60);
  const [phase, setPhase] = useState<"work" | "break">("work");
  const completed = useRef(false);

  const reset = useCallback(
    (m = sessionMin) => {
      setPhase("work");
      setLeft(m * 60);
      completed.current = false;
    },
    [sessionMin],
  );

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((l) => {
        if (l > 1) return l - 1;
        return 0;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, phase]);

  useEffect(() => {
    if (left !== 0) return;
    if (phase === "work") {
      setPhase("break");
      setLeft(20);
    } else if (!completed.current) {
      completed.current = true;
      onBreakComplete();
      setPhase("work");
      setLeft(sessionMin * 60);
      completed.current = false;
    }
  }, [left, phase, sessionMin, onBreakComplete]);

  const total = phase === "work" ? sessionMin * 60 : 20;
  const pct = 1 - left / total;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const tone = phase === "break" ? "var(--state-excellent)" : "var(--signal)";

  return (
    <section className="glass-panel relative overflow-hidden rounded-[28px] p-6">
      {phase === "break" && (
        <div
          className="animate-breathe pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(circle at 50% 40%, color-mix(in oklab, var(--state-excellent) 22%, transparent), transparent 65%)" }}
        />
      )}
      <div className="relative">
        <span className="label-eyebrow">20-20-20 protocol</span>
        <h2 className="mt-1 text-xl font-semibold">
          {phase === "break" ? "Eye Recovery Break" : "Focus session"}
        </h2>

        <div className="mt-5 flex items-center gap-6">
          <div className="relative h-32 w-32 shrink-0">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--muted)" strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke={tone}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 52}
                strokeDashoffset={2 * Math.PI * 52 * (1 - pct)}
                style={{ filter: `drop-shadow(0 0 10px ${tone})`, transition: "stroke-dashoffset 1s linear, stroke 600ms ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="mono-num text-2xl font-semibold" style={{ color: tone }}>
                {phase === "break" ? `${left}s` : `${mm}:${ss}`}
              </span>
              <Eye className="mt-1 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="min-w-0">
            {phase === "break" ? (
              <div className="animate-rise">
                <p className="text-sm leading-relaxed text-foreground/90">
                  Look <strong className="text-excellent">20 feet</strong> away for{" "}
                  <strong className="text-excellent">20 seconds</strong>. Let your ciliary muscle
                  release — this is what resets accommodative strain.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-excellent" />
                  <div className="relative h-[2px] flex-1 overflow-hidden rounded bg-muted">
                    <div
                      className="absolute inset-y-0 left-0 bg-excellent"
                      style={{ width: `${pct * 100}%`, transition: "width 1s linear" }}
                    />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">20 ft</span>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  A break is triggered automatically at the end of every session.
                </p>
                <div className="mt-3 flex gap-2">
                  {WORK_OPTIONS.map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setSessionMin(m);
                        reset(m);
                      }}
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
                      style={{
                        borderColor: sessionMin === m ? "var(--signal)" : "var(--border)",
                        color: sessionMin === m ? "var(--signal)" : "var(--muted-foreground)",
                      }}
                    >
                      {m} min
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setRunning((r) => !r)}
                className="flex items-center gap-2 rounded-full bg-signal/15 px-4 py-2 text-xs font-semibold text-signal transition-colors hover:bg-signal/25"
              >
                {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {running ? "Pause" : "Resume"}
              </button>
              <button
                onClick={() => reset()}
                className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
              <button
                onClick={() => {
                  setPhase("break");
                  setLeft(20);
                  setRunning(true);
                }}
                className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                Break now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
