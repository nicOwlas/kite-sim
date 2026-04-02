import { CSSProperties } from "react";

interface DashboardProps {
  propulsiveForce: number | null;
  kiteElevationDeg: number;
  kiteAltitudeM: number;
}

const element = (title: string, value: number | string) => {
  const titleStyle: CSSProperties = { color: "#3b3b3b", textAlign: "center", fontSize: "0.85rem" };
  const figureStyle: CSSProperties = {
    color: "black",
    textAlign: "center",
    fontSize: "2rem",
    padding: "2px",
    margin: 0,
  };
  return (
    <div style={{ marginBottom: "10px" }}>
      <p style={{ ...titleStyle, margin: 0 }}>{title}</p>
      <p style={figureStyle}>{value}</p>
    </div>
  );
};

const Dashboard = ({ propulsiveForce, kiteElevationDeg, kiteAltitudeM }: DashboardProps) => {
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
        minWidth: "160px",
      }}
    >
      {element("Propulsive Force", `${propulsiveForce ?? 0} N`)}
      {element("Kite Elevation", `${kiteElevationDeg}°`)}
      {element("Kite Altitude", `${kiteAltitudeM} m`)}
    </div>
  );
};

export default Dashboard;
