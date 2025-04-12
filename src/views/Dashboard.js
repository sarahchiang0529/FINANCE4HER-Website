import React from "react";
import "../stylesheets/Dashboard.css";
import { Box, Button } from "@mui/material";
import PageWrapper from "../components/PageWrapper";

const Dashboard = () => {
  return (
    <PageWrapper>
      <div className="label">
        <div className="dashboard-section">
          <div className="text-wrapper">EmpowerHERTo</div>
          <Box className="dashboard-buttons">
            <Button className="custom-btn" variant="outlined" size="large">
              MONTHLY EARNINGS
            </Button>
            <Button className="custom-btn" variant="outlined" size="large">
              MONTHLY EXPENSES
            </Button>
            <Button className="custom-btn" variant="outlined" size="large">
              POINTS AND PROGRESS
            </Button>
          </Box>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
