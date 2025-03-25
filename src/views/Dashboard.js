import React from "react";
import "../components/Dashboard.css";
import { Box, Button } from '@mui/material';


const Dashboard = () => {
  return (
    <div className="label" style={{ textAlign: "center" }}>
      <div className="text-wrapper">EmpowerHERTo</div>
      <Box 
          sx={{
          display: "flex",
          justifyContent: "center",
          gap: 5,
          pt: 15,
          flexWrap: "wrap"
        }}>
        <Button className="custom-btn" variant="outlined" size="large" sx={{ mr: 20 }}>Monthly Earnings</Button>
        <Button className="custom-btn" variant="outlined" size="large" sx={{ mr: 20 }}>Monthly Expenses</Button>
        <Button className="custom-btn" variant="outlined" size="large">Points and Progress</Button>
      </Box>
    </div>
    
    
  );
};

export default Dashboard; 