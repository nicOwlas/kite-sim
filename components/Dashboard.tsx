"use client";
import { CSSProperties, useState } from "react";

const HISTORY_S = 30;
const SAMPLE_HZ = 10;
const MAX_SAMPLES = HISTORY_S * SAMPLE_HZ;

// "Tonnes" here means tonne-force: 1 tf = 1000 kg × g, with g = 9.80665 m/s².
const N_PER_TONNE_FORCE = 9806.65;

const COLOR_TRACTION = "#ea580c";
const COLOR_WIND = "#2563eb";
const COLOR_TEXT_MUTED = "#6b7280";
const COLOR_BASELINE = "#d1d5db";

const CHART_W = 288;
const CHART_H = 110;
const PAD_L = 36;
const PAD_R = 42;
const PAD_T = 10;
const PAD_B = 18;
const PLOT_W = CHART_W - PAD_L - PAD_R;
const PLOT_H = CHART_H - PAD_T - PAD_B;

interface DashboardProps {
  propulsiveForceInstant: number;
  apparentWindMps: number;
  kiteAltitudeM: number;
}

interface Sample {
  t: number;
  ap: number;
}

function buildPolyline(
  samples: Sample[],
  key: "t" | "ap",
  maxValue: number,
): string {
  if (samples.length === 0) return "";
  const stepX = PLOT_W / Math.max(MAX_SAMPLES - 1, 1);
  const xOffset = PAD_L + (MAX_SAMPLES - samples.length) * stepX;
  return samples
    .map((s, i) => {
      const x = xOffset + i * stepX;
      const y = PAD_T + PLOT_H * (1 - s[key] / maxValue);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

const DualAxisSparkline = ({ samples }: { samples: Sample[] }) => {
  const observedTMax =
    samples.length === 0 ? 0 : Math.max(...samples.map((s) => s.t));
  const observedApMax =
    samples.length === 0 ? 0 : Math.max(...samples.map((s) => s.ap));
  const tMax = Math.max(0.1, observedTMax * 1.1);
  const apMax = Math.max(1, observedApMax * 1.1);

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      width="100%"
      height={CHART_H}
      style={{ display: "block" }}
    >
      <line
        x1={PAD_L}
        y1={PAD_T + PLOT_H}
        x2={PAD_L + PLOT_W}
        y2={PAD_T + PLOT_H}
        stroke={COLOR_BASELINE}
        strokeWidth={0.5}
      />
      <polyline
        points={buildPolyline(samples, "t", tMax)}
        fill="none"
        stroke={COLOR_TRACTION}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <polyline
        points={buildPolyline(samples, "ap", apMax)}
        fill="none"
        stroke={COLOR_WIND}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <text
        x={PAD_L - 4}
        y={PAD_T + 4}
        textAnchor="end"
        fontSize={9}
        fill={COLOR_TRACTION}
      >
        {tMax.toFixed(2)} t
      </text>
      <text
        x={PAD_L - 4}
        y={PAD_T + PLOT_H}
        textAnchor="end"
        fontSize={9}
        fill={COLOR_TRACTION}
      >
        0
      </text>
      <text
        x={PAD_L + PLOT_W + 4}
        y={PAD_T + 4}
        textAnchor="start"
        fontSize={9}
        fill={COLOR_WIND}
      >
        {apMax.toFixed(1)} m/s
      </text>
      <text
        x={PAD_L + PLOT_W + 4}
        y={PAD_T + PLOT_H}
        textAnchor="start"
        fontSize={9}
        fill={COLOR_WIND}
      >
        0
      </text>
      <text
        x={PAD_L + PLOT_W / 2}
        y={CHART_H - 4}
        textAnchor="middle"
        fontSize={9}
        fill={COLOR_TEXT_MUTED}
      >
        30 s
      </text>
    </svg>
  );
};

const titleStyle: CSSProperties = {
  color: "#3b3b3b",
  fontSize: "0.75rem",
  margin: 0,
  textAlign: "center",
};
const valueStyle: CSSProperties = {
  color: "black",
  fontSize: "1.1rem",
  margin: "2px 0 0 0",
  textAlign: "center",
  fontWeight: 500,
};

const readoutCell = (title: string, value: string) => (
  <div style={{ flex: 1 }}>
    <p style={titleStyle}>{title}</p>
    <p style={valueStyle}>{value}</p>
  </div>
);

const Dashboard = ({
  propulsiveForceInstant,
  apparentWindMps,
  kiteAltitudeM,
}: DashboardProps) => {
  const [history, setHistory] = useState<Sample[]>([]);
  const [lastInputs, setLastInputs] = useState<{
    f: number;
    w: number;
  } | null>(null);

  const tractionT = Math.max(0, propulsiveForceInstant / N_PER_TONNE_FORCE);

  // Append to the rolling buffer when inputs change. Setting state during
  // render is React's recommended pattern for state derived from props that
  // must accumulate across renders.
  if (
    lastInputs === null ||
    lastInputs.f !== propulsiveForceInstant ||
    lastInputs.w !== apparentWindMps
  ) {
    setLastInputs({ f: propulsiveForceInstant, w: apparentWindMps });
    setHistory((prev) => {
      const next =
        prev.length >= MAX_SAMPLES
          ? prev.slice(prev.length - MAX_SAMPLES + 1)
          : prev.slice();
      next.push({ t: tractionT, ap: apparentWindMps });
      return next;
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 1,
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(8px)",
        padding: "12px 16px",
        borderRadius: "8px",
        color: "black",
        width: "320px",
      }}
    >
      <DualAxisSparkline samples={history} />
      <div style={{ display: "flex", marginTop: "6px" }}>
        {readoutCell("Traction", `${tractionT.toFixed(2)} t`)}
        {readoutCell("Apparent wind", `${apparentWindMps.toFixed(1)} m/s`)}
        {readoutCell("Altitude", `${kiteAltitudeM} m`)}
      </div>
    </div>
  );
};

export default Dashboard;
