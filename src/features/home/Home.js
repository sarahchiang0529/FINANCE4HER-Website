import { useHistory } from "react-router-dom"
import { ArrowRight, BarChart3, CreditCard, DollarSign, PiggyBank } from "lucide-react"
import "./Home.css"

const Home = () => {
  const history = useHistory()

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title font-secondary">Welcome to EmpowerHERTo</h1>
        <p className="hero-subtitle">
          Your space to learn, grow, and take control of your financial future. Track your earnings, set savings goals,
          and build healthy money habits—one step at a time.
        </p>
        <div className="hero-buttons">
          <div className="button-wrapper">
            <button className="btn-primary get-started-btn" onClick={() => history.push("/dashboard")}>
              Get Started
              <ArrowRight className="btn-icon" />
            </button>
          </div>
          <button className="btn-outline" onClick={() => history.push("/learning-resources")}>
            Explore Resources
          </button>
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card" onClick={() => history.push("/dashboard")}>
          <div className="feature-icon">
            <BarChart3 />
          </div>
          <h3 className="feature-title font-secondary">Dashboard</h3>
          <p className="feature-description">Get a complete overview of your financial health at a glance.</p>
          <div className="feature-link">
            View Dashboard
            <ArrowRight className="link-icon" />
          </div>
        </div>

        <div className="feature-card" onClick={() => history.push("/income")}>
          <div className="feature-icon">
            <DollarSign />
          </div>
          <h3 className="feature-title font-secondary">Income Tracking</h3>
          <p className="feature-description">Record and categorize all your income sources in one place.</p>
          <div className="feature-link">
            Track Income
            <ArrowRight className="link-icon" />
          </div>
        </div>

        <div className="feature-card" onClick={() => history.push("/expenses")}>
          <div className="feature-icon">
            <CreditCard />
          </div>
          <h3 className="feature-title font-secondary">Expense Management</h3>
          <p className="feature-description">Monitor your spending habits and identify areas to save.</p>
          <div className="feature-link font-secondary">
            Manage Expenses
            <ArrowRight className="link-icon" />
          </div>
        </div>

        <div className="feature-card" onClick={() => history.push("/saving-goals")}>
          <div className="feature-icon">
            <PiggyBank />
          </div>
          <h3 className="feature-title font-secondary">Saving Goals</h3>
          <p className="feature-description">Set financial goals and track your progress toward achieving them.</p>
          <div className="feature-link">
            Set Goals
            <ArrowRight className="link-icon" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home