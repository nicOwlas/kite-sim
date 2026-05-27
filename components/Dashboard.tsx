import { CSSProperties } from "react";

interface DashboardProps {
  propulsiveForceInstant: number;
  propulsiveForceAvg: number;
  kiteElevationDeg: number;
  kiteAltitudeM: number;
}

const titleStyle: CSSProperties = {
  color: "#3b3b3b",
  textAlign: "center",
  fontSize: "0.85rem",
  margin: 0,
};
const figureStyle: CSSProperties = {
  color: "black",
  textAlign: "center",
  fontSize: "2rem",
  padding: "2px",
  margin: 0,
};
const subFigureStyle: CSSProperties = {
  color: "#3b3b3b",
  textAlign: "center",
  fontSize: "1rem",
  margin: 0,
};

const element = (title: string, value: number | string) => (
  <div style={{ marginBottom: "10px" }}>
    <p style={titleStyle}>{title}</p>
    <p style={figureStyle}>{value}</p>
  </div>
);

const Dashboard = ({
  propulsiveForceInstant,
  propulsiveForceAvg,
  kiteElevationDeg,
  kiteAltitudeM,
}: DashboardProps) => {
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
      <div style={{ marginBottom: "10px" }}>
        <p style={titleStyle}>Propulsive Force</p>
        <p style={figureStyle}>{propulsiveForceInstant} N</p>
        <p style={subFigureStyle}>avg 1 s: {propulsiveForceAvg} N</p>
      </div>
      {element("Kite Elevation", `${kiteElevationDeg}°`)}
      {element("Kite Altitude", `${kiteAltitudeM} m`)}
    </div>
  );
};

export default Dashboard;
