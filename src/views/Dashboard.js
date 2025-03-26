import React from "react";
import "../stylesheets/Dashboard.css";
import { Box, Button } from '@mui/material';
import { white } from '@mui/material/colors';



const Dashboard = () => {
  return (
    <div className="label">
      <div className="text-wrapper">EmpowerHERTo</div>
      <Box sx={{ pt: 15, ml: 60 }}>
        <Button className="custom-btn" variant="outlined" size="large" sx={{ mr: 20 }}>Monthly Earnings</Button>
        <Button className="custom-btn" variant="outlined" size="large" sx={{ mr: 20 }}>Monthly Expenses</Button>
        <Button className="custom-btn" variant="outlined" size="large">Points and Progress</Button>
      </Box>
    </div>
    
    
  );
};

export default Dashboard; 