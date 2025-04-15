import PageWrapper from "../components/PageWrapper"; 
import "../stylesheets/SavingGoal.css";

const SavingGoals = () => {
  return (
    <PageWrapper>
      <div className="saving-goals-container">
        <div className="page-header">
          <h1 className="page-title">Saving Goals</h1>
          <p className="page-subtitle">Set and track your financial targets</p>
        </div>

        {/* Placeholder content */}
        <div className="goals-content">
          <p>Saving Goals page content will go here</p>
        </div>
      </div>
    </PageWrapper>
  );
};

export default SavingGoals;