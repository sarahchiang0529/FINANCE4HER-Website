import React, { useState } from 'react';
import PageWrapper from "../components/PageWrapper";
import "../stylesheets/SavingGoal.css";

const SavingsGoalCard = ({ title, currentAmount, goalAmount, onUpdateCurrentAmount, onUpdateGoalAmount }) => {
  const progress = (currentAmount / goalAmount) * 100;

  return (
    <div className="savings-card">
      <div className="savings-card-title">{title}</div>
      <div className="savings-progress-bar">
        <div
          className="savings-progress-fill"
          style={{ width: `${progress > 100 ? 100 : progress}%` }}
        ></div>
      </div>
      <div className="savings-goal-amount">
        ${currentAmount.toLocaleString()} / ${goalAmount.toLocaleString()}
      </div>
      <div className="update-amount-row">
        <div className="update-input-group">
          <label>Current</label>
          <input
            className="savings-input"
            type="text"
            value={currentAmount}
            onChange={(e) => onUpdateCurrentAmount(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="update-input-group">
          <label>Goal</label>
          <input
            className="savings-input"
            type="text"
            value={goalAmount}
            onChange={(e) => onUpdateGoalAmount(parseFloat(e.target.value) || 0)}
          />
        </div>
        <button className="update-button">Update</button>
      </div>
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
  onClick: () => console.log('Add goal button clicked'),
};

const AddGoalPopup = ({ isOpen, onClose, onAddGoal }) => {
  const [title, setTitle] = useState('');
  const [goalAmount, setGoalAmount] = useState('');

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Add New Goal</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onAddGoal({ title, goalAmount: parseFloat(goalAmount) });
            onClose();
          }}
        >
          <div>
            <label>Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Goal Amount:</label>
            <input
              type="text"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              required
            />
          </div>
          <button type="submit">Add Goal</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

const SavingGoal = () => {
  const [goals, setGoals] = useState([
    { title: "Education", currentAmount: 4300, goalAmount: 12000 },
    { title: "Travel & Vacation", currentAmount: 5000, goalAmount: 25000 },
    { title: "Buying a Car", currentAmount: 3000, goalAmount: 18000 },
  ]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const addGoal = (newGoal) => {
    setGoals([...goals, { ...newGoal, currentAmount: 0 }]);
  };

  const updateCurrentAmount = (index, newAmount) => {
    const updatedGoals = [...goals];
    updatedGoals[index].currentAmount = newAmount;
    setGoals(updatedGoals);
  };

  const updateGoalAmount = (index, newGoalAmount) => {
    const updatedGoals = [...goals];
    updatedGoals[index].goalAmount = newGoalAmount;
    setGoals(updatedGoals);
  };

  return (
    <PageWrapper> 
      <div className="saving-goal-container">
        <div className="savings-content">
          {goals.map((goal, index) => (
            <SavingsGoalCard
              key={index}
              title={goal.title}
              currentAmount={goal.currentAmount}
              goalAmount={goal.goalAmount}
              onUpdateCurrentAmount={(newAmount) => updateCurrentAmount(index, newAmount)}
              onUpdateGoalAmount={(newGoalAmount) => updateGoalAmount(index, newGoalAmount)}
            />
          ))}
          <div className="add-goal-container">
            <AddGoalButton onClick={() => setIsPopupOpen(true)} />
          </div>
        </div>
        <AddGoalPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          onAddGoal={addGoal}
        />
      </div>
    </PageWrapper>
  );
};

export default SavingGoal;
