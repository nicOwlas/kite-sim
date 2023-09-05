// Dashboard.jsx
const element = (title, value) => {
  const titleStyle = { color: "#3b3b3b", textAlign: "center", size: "1rem" };
  const figureStyle = {
    color: "black",
    textAlign: "center",
    fontSize: "3rem",
    padding: "4px",
  };
  return (
    <div style={{ marginBottom: "16px" }}>
      <p style={titleStyle}>{title}</p>
      <p style={figureStyle}>{value}</p>
    </div>
  );
};

const Dashboard = (props) => {
  // console.log("Dashboard", props);
  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 1,
        background: "rgba(255, 255, 255, 0.6)",
        padding: "10px",
        borderRadius: "5px",
        color: "black",
      }}
    >
      {element(
        "Propulsive Force (N)",
        props?.propulsiveForce ? props.propulsiveForce : 1
      )}
      {/* {element(
        "True Wind Speed (m/s)",
        props?.trueWindSpeed ? props.trueWindSpeed : 0
      )} */}
    </div>
  );
};

export default Dashboard;
