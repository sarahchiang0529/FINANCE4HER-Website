import React from 'react';
import "../stylesheets/SavingGoal.css";

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
      <div className="savings-content">
        <SavingsGoalCard title="Education" currentAmount={4300} goalAmount={12000} />
        <SavingsGoalCard title="Travel & Vacation" currentAmount={5000} goalAmount={25000} />
        <SavingsGoalCard title="Buying a Car" currentAmount={3000} goalAmount={18000} />
        <div className="add-goal-container">
          <AddGoalButton />
        </div>
      </div>
    </div>
  );
};

export default SavingGoal;