import React from 'react';
import "../stylesheets/SavingGoal.css";

const Header = () => {
  return (
    <header className="header">
      <img src="https://dashboard.codeparrot.ai/api/image/Z-bfHAz4-w8v6Rf-/logo-sta.png" alt="Logo" className="header-logo" />
      <nav className="nav-links">
        <a href="/" className="nav-link">Home</a>
        <a href="/about" className="nav-link">About</a>
        <a href="/signup" className="nav-link">Sign Up</a>
        <a href="/login" className="nav-link">Login</a>
      </nav>
    </header>
  );
};

const Sidebar = ({ style = {} }) => {
  const menuItems = [
    { title: 'Dashboard', path: '/' },
    { title: 'Income & Expenses', path: '/income-expenses' },
    { title: 'Saving Goals', path: '/saving-goals' },
    { title: 'Rewards & Points', path: '/rewards' },
    { title: 'Learning Resources', path: '/learning' },
    { title: 'Settings', path: '/settings' }
  ];

  return (
    <div className="sidebar" style={style}>
      <div className="sidebar-logo">
        <img 
          src="https://dashboard.codeparrot.ai/api/image/Z-bfHAz4-w8v6Rf-/logo-sta.png" 
          alt="Logo"
        />
      </div>
      {menuItems.map((item, index) => (
        <button
          key={index}
          className={`sidebar-button ${index === menuItems.length - 1 ? 'sidebar-settings' : ''}`}
        >
          {item.title}
        </button>
      ))}
    </div>
  );
};

const SavingsGoalCard = ({ title = "Education", currentAmount = 4300, goalAmount = 12000, style }) => {
  const progress = (currentAmount / goalAmount) * 100;

  return (
    <div className="savings-card" style={style}>
      <div className="savings-card-title">{title}</div>
      <div className="savings-progress-bar">
        <div className="savings-progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="savings-goal-amount">${goalAmount.toLocaleString()}</div>
    </div>
  );
};

const AddGoalButton = ({ onClick }) => {
  return (
    <button className="add-goal-button" onClick={onClick}>
      +
    </button>
  );
};

AddGoalButton.defaultProps = {
  onClick: () => console.log('Add goal button clicked')
};

const SavingGoal = () => {
  return (
    <div className="saving-goal-container">
      <Header />
      <div style={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar style={{ flexGrow: 0, width: '250px' }} />
        <div className="savings-content">
          <SavingsGoalCard title="Education" currentAmount={4300} goalAmount={12000} />
          <SavingsGoalCard title="Travel & Vacation" currentAmount={5000} goalAmount={25000} />
          <SavingsGoalCard title="Buying a Car" currentAmount={3000} goalAmount={18000} />
          <div className="add-goal-container">
            <AddGoalButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingGoal;