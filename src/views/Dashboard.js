import React from "react";
import "../stylesheets/Dashboard.css";
import PageWrapper from "../components/PageWrapper";

const Dashboard = () => {
  return (
    <PageWrapper>
      <div className="label">
        <div className="text-wrapper">EmpowerHERTo</div>
        <div className="dashboard-buttons">
          <button className="custom-btn">MONTHLY EARNINGS</button>
          <button className="custom-btn">MONTHLY EXPENSES</button>
          <button className="custom-btn">POINTS AND PROGRESS</button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
