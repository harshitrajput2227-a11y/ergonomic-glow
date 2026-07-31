import { useSmoothNumber } from "@/lib/use-smooth-number";
import { statusOf, statusTone, type SensorReading, subScore, metricList } from "@/lib/whi";

export function ScoreOrb({ score, reading }: { score: number; reading: SensorReading }) {
  const smooth = useSmoothNumber(score);
  const status = statusOf(Math.round(smooth));
  const tone = statusTone(status);
  const R = 128;
  const C = 2 * Math.PI * R;

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative h-[340px] w-[340px]">
        {/* halo */}
        <div
          className="animate-breathe absolute inset-6 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${tone.color}, transparent 68%)`, opacity: 0.4 }}
        />
        {/* orbiting satellites */}
        <div className="animate-orbit absolute inset-0">
          {metricList.map((m, i) => {
            const s = subScore(m.key, reading[m.key]);
            const angle = (i / metricList.length) * Math.PI * 2;
            return (
              <span
                key={m.key}
                className="absolute h-2 w-2 rounded-full"
                style={{
                  left: `calc(50% + ${(Math.cos(angle) * 158).toFixed(2)}px)`,
                  top: `calc(50% + ${(Math.sin(angle) * 158).toFixed(2)}px)`,
                  background: s > 80 ? "var(--state-excellent)" : s > 55 ? "var(--state-warn)" : "var(--state-poor)",
                  boxShadow: `0 0 14px 2px currentColor`,
                  color: s > 80 ? "var(--state-excellent)" : s > 55 ? "var(--state-warn)" : "var(--state-poor)",
                  transition: "background 600ms ease",
                }}
              />
            );
          })}
        </div>

        <svg viewBox="0 0 320 320" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="160" cy="160" r={R} fill="none" stroke="var(--glass-line)" strokeWidth="2" />
          <circle
            cx="160"
            cy="160"
            r={R}
            fill="none"
            stroke="var(--muted)"
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.55"
          />
          <circle
            cx="160"
            cy="160"
            r={R}
            fill="none"
            stroke={tone.color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - smooth / 100)}
            style={{ filter: `drop-shadow(0 0 16px ${tone.color})`, transition: "stroke 700ms ease" }}
          />
          {/* tick marks */}
          {Array.from({ length: 60 }).map((_, i) => {
            const a = (i / 60) * Math.PI * 2;
            const active = i / 60 <= smooth / 100;
            return (
              <line
                key={i}
                x1={+(160 + Math.cos(a) * 100).toFixed(2)}
                y1={+(160 + Math.sin(a) * 100).toFixed(2)}
                x2={+(160 + Math.cos(a) * 108).toFixed(2)}
                y2={+(160 + Math.sin(a) * 108).toFixed(2)}
                stroke={active ? tone.color : "var(--muted)"}
                strokeWidth="1.5"
                opacity={active ? 0.7 : 0.3}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="label-eyebrow">Workspace Health</span>
          <div className="mono-num flex items-start leading-none">
            <span className="text-[84px] font-semibold" style={{ color: tone.color, transition: "color 700ms ease" }}>
              {Math.round(smooth)}
            </span>
            <span className="mt-4 ml-1 text-lg text-muted-foreground">/100</span>
          </div>
          <span
            className="mt-2 rounded-full px-4 py-1 text-sm font-semibold tracking-wide"
            style={{
              color: tone.color,
              background: `color-mix(in oklab, ${tone.color} 14%, transparent)`,
              border: `1px solid color-mix(in oklab, ${tone.color} 40%, transparent)`,
              transition: "all 700ms ease",
            }}
          >
            {status}
          </span>
        </div>
      </div>

      <div className="mt-2 grid w-full max-w-md grid-cols-4 gap-2">
        {metricList.map((m) => {
          const s = subScore(m.key, reading[m.key]);
          const c = s > 80 ? "var(--state-excellent)" : s > 55 ? "var(--state-warn)" : "var(--state-poor)";
          return (
            <div key={m.key} className="text-center">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${s}%`, background: c, transition: "width 600ms cubic-bezier(.22,1,.36,1), background 600ms ease" }}
                />
              </div>
              <p className="mt-2 text-[11px] leading-tight text-muted-foreground">{m.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
