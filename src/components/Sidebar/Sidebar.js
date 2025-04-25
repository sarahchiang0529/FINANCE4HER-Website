import React from "react";
import { NavLink } from "react-router-dom";
import { Home, DollarSign, CreditCard, PieChart, Settings } from 'lucide-react';
import { useFinancial } from "../../contexts/FinancialContext";
import "./Sidebar.css";

const Sidebar = () => {
  const { totalIncome, totalExpenses, netBalance } = useFinancial();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">FinTrack</h1>
      </div>

      <div className="sidebar-balance">
        <div className="balance-item">
          <span className="balance-label">Net Balance</span>
          <span className={`balance-value ${netBalance >= 0 ? "positive" : "negative"}`}>
            ${netBalance.toFixed(2)}
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <Home size={18} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/income" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <DollarSign size={18} />
          <span>Income</span>
        </NavLink>
        
        <NavLink to="/expenses" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <CreditCard size={18} />
          <span>Expenses</span>
        </NavLink>
        
        <NavLink to="/overview" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <PieChart size={18} />
          <span>Overview</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className="nav-link">
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;