import { useHistory } from "react-router-dom"
import { ArrowRight, BarChart3, CreditCard, DollarSign, PiggyBank } from "lucide-react"
import "./Home.css"

const Home = () => {
  const history = useHistory()

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">Finance 4 HER Builds…</h1>
        <p className="hero-subtitle">Your money, your rules 💰 Track it, save it, grow it and BOSSS up your financial future.</p>
        <div className="hero-buttons">
          <div className="button-wrapper">
            <button className="btn-primary home-btn" onClick={() => history.push("/dashboard")}>
              <span className="home-btn-content">
                Get Started
                <ArrowRight className="btn-icon" />
              </span>
            </button>
          </div>
          <button className="btn-primary explore-btn" onClick={() => history.push("/learning-resources")}>
            Explore Resources
          </button>
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card" onClick={() => history.push("/dashboard")}>
          <div className="feature-icon">
            <BarChart3 />
          </div>
          <h3 className="feature-title">Dashboard</h3>
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
          <h3 className="feature-title">Income Tracking</h3>
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
          <h3 className="feature-title">Expense Management</h3>
          <p className="feature-description">Monitor your spending habits and identify areas to save.</p>
          <div className="feature-link">
            Manage Expenses
            <ArrowRight className="link-icon" />
          </div>
        </div>

        <div className="feature-card" onClick={() => history.push("/saving-goals")}>
          <div className="feature-icon">
            <PiggyBank />
          </div>
          <h3 className="feature-title">Saving Goals</h3>
          <p className="feature-description">Set financial goals and track your progress.</p>
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