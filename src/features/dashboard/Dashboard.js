import { useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import "./Dashboard.css"
import { ArrowRight, ArrowUpRight, CreditCard, DollarSign, TrendingUp } from 'lucide-react'
import { faqItems } from "../faq/FAQ"
import EmptyState from "../../components/EmptyState"

const Dashboard = () => {
  const history = useHistory()
  // State for FAQ items
  const [faqs, setFaqs] = useState([])
  // State for transactions
  const [transactions, setTransactions] = useState([])
  // State for saving goals
  const [savingGoals, setSavingGoals] = useState([])
  // Maximum number of goals to display
  const MAX_GOALS = 4
  // Maximum number of transactions to display
  const MAX_TRANSACTIONS = 7

  // Fetch FAQ items when component mounts
  useEffect(() => {
    // Get the first 3 FAQ items
    setFaqs(faqItems.slice(0, 3))

    // In a real app, you would fetch transactions from your data source here
    // For now, we'll just set an empty array
    setTransactions([])

    // Fetch saving goals from localStorage or API
    const fetchSavingGoals = () => {
      try {
        // In a real app, this would be an API call or database query
        // For this example, we'll check if there are any goals in localStorage
        const storedGoals = localStorage.getItem("savingGoals")
        if (storedGoals) {
          const parsedGoals = JSON.parse(storedGoals)
          // Sort by most recently added (assuming id is timestamp-based)
          const sortedGoals = parsedGoals.sort((a, b) => b.id - a.id)
          // Get the most recent 4 goals
          setSavingGoals(sortedGoals.slice(0, MAX_GOALS))
        } else {
          setSavingGoals([])
        }
      } catch (error) {
        console.error("Error fetching saving goals:", error)
        setSavingGoals([])
      }
    }

    fetchSavingGoals()
  }, [])

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
                {savingGoals && savingGoals.length > 0 ? (
                  <>
                    {savingGoals.map((goal) => (
                      <div key={goal.id} className="goal">
                        <div className="goal-header">
                          <div className="goal-name">{goal.name}</div>
                          <div className="goal-percent">
                            {Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)}%
                          </div>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}

                    <button className="btn-outline btn-sm full-width" onClick={() => history.push("/saving-goals")}>
                      View All Goals
                      <ArrowRight className="btn-icon-sm" />
                    </button>
                  </>
                ) : (
                  <EmptyState
                    title="No Saving Goals Yet"
                    message="Start by creating saving goals to track your financial progress. Your goals will appear here."
                  />
                )}
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
            {transactions && transactions.length > 0 ? (
              <>
                {/* Display only the most recent 7 transactions */}
                {transactions.slice(0, MAX_TRANSACTIONS).map((transaction) => (
                  <div key={transaction.id} className="transaction">
                    <div className="transaction-info">
                      <div className={`transaction-icon ${transaction.type}`}>
                        {transaction.type === "income" ? (
                          <DollarSign className="icon-sm" />
                        ) : (
                          <CreditCard className="icon-sm" />
                        )}
                      </div>
                      <div>
                        <div className="transaction-title">{transaction.category}</div>
                        <div className="transaction-subtitle">{transaction.description}</div>
                      </div>
                    </div>
                    <div className="transaction-amount">
                      <div className={`amount ${transaction.type}`}>
                        {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                      </div>
                      <div className="transaction-date">{transaction.date}</div>
                    </div>
                  </div>
                ))}

                <div className="button-row">
                  <button className="btn-outline btn-sm" onClick={() => history.push("/income")}>
                    View All Income
                    <ArrowRight className="btn-icon-sm" />
                  </button>

                  <button className="btn-outline btn-sm" onClick={() => history.push("/expenses")}>
                    View All Expenses
                    <ArrowRight className="btn-icon-sm" />
                  </button>
                </div>
              </>
            ) : (
              <EmptyState
                title="No Transaction Data Yet"
                message="Start by adding your income/expense transactions through the respective forms. Your transaction data will appear here."
              />
            )}
          </div>
        </div>

        <div className="faqs-card">
          <div className="card-header">
            <h3 className="card-title">FAQ</h3>
            <p className="card-description">A set of frequently asked questions and answers</p>
          </div>
          <div className="faqs-list">
            {faqs.map((faq, index) => (
              <div key={index} className="faq">
                <h4 className="faq-title">{faq.question}</h4>
                <p className="faq-description">{faq.answer}</p>
              </div>
            ))}

            <button className="btn-outline btn-sm full-width" onClick={() => history.push("/faq")}>
              View All FAQs
              <ArrowRight className="btn-icon-sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard