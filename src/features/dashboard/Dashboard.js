import { useHistory } from "react-router-dom"
import "../stylesheets/Dashboard.css"
import { ArrowRight, ArrowUpRight, CreditCard, DollarSign, TrendingUp } from "lucide-react"

const Dashboard = () => {
  const history = useHistory()

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Track your financial progress and manage your money</p>
        </div>

        <div className="dashboard-actions">
          <button className="btn-outline" onClick={() => history.push("/income")}>
            <DollarSign className="btn-icon" />
            Add Income
          </button>
          <button className="btn-primary" onClick={() => history.push("/expenses")}>
            <CreditCard className="btn-icon" />
            Add Expense
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Total Balance</div>
            <DollarSign className="stat-icon" />
          </div>
          <div className="stat-value">$2,500.00</div>
          <div className="stat-change">+20.1% from last month</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Monthly Income</div>
            <TrendingUp className="stat-icon" />
          </div>
          <div className="stat-value">$1,800.00</div>
          <div className="stat-change">+10.5% from last month</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Monthly Expenses</div>
            <CreditCard className="stat-icon" />
          </div>
          <div className="stat-value">$1,200.00</div>
          <div className="stat-change">-5.2% from last month</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Savings Rate</div>
            <ArrowUpRight className="stat-icon" />
          </div>
          <div className="stat-value">33%</div>
          <div className="stat-change">+7% from last month</div>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button className="tab active">Overview</button>
          <button className="tab">Monthly</button>
          <button className="tab">Yearly</button>
        </div>

        <div className="tab-content">
          <div className="charts-grid">
            <div className="chart-card wide">
              <div className="card-header">
                <h3 className="card-title">Financial Summary</h3>
                <p className="card-description">Your income and expenses for the current month</p>
              </div>
              <div className="chart-placeholder">
                <p>Income vs Expenses Chart</p>
              </div>
            </div>

            <div className="chart-card">
              <div className="card-header">
                <h3 className="card-title">Saving Goals Progress</h3>
                <p className="card-description">Track your progress toward financial goals</p>
              </div>
              <div className="goals-container">
                <div className="goal">
                  <div className="goal-header">
                    <div className="goal-name">Emergency Fund</div>
                    <div className="goal-percent">75%</div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: "75%" }}></div>
                  </div>
                </div>

                <div className="goal">
                  <div className="goal-header">
                    <div className="goal-name">Vacation</div>
                    <div className="goal-percent">50%</div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: "50%" }}></div>
                  </div>
                </div>

                <div className="goal">
                  <div className="goal-header">
                    <div className="goal-name">New Laptop</div>
                    <div className="goal-percent">25%</div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: "25%" }}></div>
                  </div>
                </div>

                <button className="btn-outline btn-sm full-width" onClick={() => history.push("/saving-goals")}>
                  View All Goals
                  <ArrowRight className="btn-icon-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-grid">
        <div className="transactions-card">
          <div className="card-header">
            <h3 className="card-title">Recent Transactions</h3>
            <p className="card-description">Your latest financial activities</p>
          </div>
          <div className="transactions-list">
            <div className="transaction">
              <div className="transaction-info">
                <div className="transaction-icon expense">
                  <CreditCard className="icon-sm" />
                </div>
                <div>
                  <div className="transaction-title">Food</div>
                  <div className="transaction-subtitle">Grocery shopping</div>
                </div>
              </div>
              <div className="transaction-amount">
                <div className="amount expense">-$45.00</div>
                <div className="transaction-date">Today</div>
              </div>
            </div>

            <div className="transaction">
              <div className="transaction-info">
                <div className="transaction-icon income">
                  <DollarSign className="icon-sm" />
                </div>
                <div>
                  <div className="transaction-title">Salary</div>
                  <div className="transaction-subtitle">Monthly payment</div>
                </div>
              </div>
              <div className="transaction-amount">
                <div className="amount income">+$1,500.00</div>
                <div className="transaction-date">Yesterday</div>
              </div>
            </div>

            <div className="transaction">
              <div className="transaction-info">
                <div className="transaction-icon expense">
                  <CreditCard className="icon-sm" />
                </div>
                <div>
                  <div className="transaction-title">Transport</div>
                  <div className="transaction-subtitle">Uber ride</div>
                </div>
              </div>
              <div className="transaction-amount">
                <div className="amount expense">-$25.00</div>
                <div className="transaction-date">Apr 12</div>
              </div>
            </div>
          </div>
        </div>

        <div className="tips-card">
          <div className="card-header">
            <h3 className="card-title">Financial Tips</h3>
            <p className="card-description">Personalized advice for your financial journey</p>
          </div>
          <div className="tips-list">
            <div className="tip">
              <h4 className="tip-title">Increase your emergency fund</h4>
              <p className="tip-description">Aim for 3–6 months of expenses</p>
            </div>

            <div className="tip">
              <h4 className="tip-title">Review your subscriptions</h4>
              <p className="tip-description">You could save $25/month by canceling unused services</p>
            </div>

            <div className="tip">
              <h4 className="tip-title">Consider investing</h4>
              <p className="tip-description">Your savings account has excess funds that could be working harder</p>
            </div>

            <button className="btn-outline btn-sm full-width" onClick={() => history.push("/learning-resources")}>
              View All Resources
              <ArrowRight className="btn-icon-sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard