import { useState, useEffect, useMemo } from "react"
import { useHistory } from "react-router-dom"
import "./Dashboard.css"
import {
  ArrowRight,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  TrendingUp,
  Target,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { faqItems } from "../faq/FAQ"
import EmptyState from "../../components/EmptyState"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

// Add these imports after the other imports
import DailyCashflowChart from "../dashboard/charts/DailyCashflowChart/DailyCashflowChart"
import MonthlyComparisonChart from "../dashboard/charts/MonthlyComparisonChart/MonthlyComparisonChart"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

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
  const MAX_TRANSACTIONS = 6
  // State for active chart tab
  const [activeChartTab, setActiveChartTab] = useState("daily")

  // State for date selection
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Format date to month format only (e.g., "May")
  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long" })
  }

  // Handle month navigation (previous/next)
  const handleMonthChange = (direction) => {
    const newMonth = new Date(selectedMonth)
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    setSelectedMonth(newMonth)
  }

  // Handle year navigation (previous/next)
  const handleYearChange = (direction) => {
    const newYear = direction === "prev" ? selectedYear - 1 : selectedYear + 1
    setSelectedYear(newYear)
  }

  // Filter transactions by selected month
  const filteredTransactions = useMemo(() => {
    const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1)
    const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0)

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      return transactionDate >= startOfMonth && transactionDate <= endOfMonth
    })
  }, [transactions, selectedMonth])

  // Filter transactions by selected year
  const filteredTransactionsByYear = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      return transactionDate.getFullYear() === selectedYear
    })
  }, [transactions, selectedYear])

  // Update the useEffect hook to fetch transactions from localStorage
  useEffect(() => {
    // Get the first 4 FAQ items
    setFaqs(faqItems.slice(0, 3))

    // Fetch transactions from localStorage
    const fetchTransactions = () => {
      try {
        // Get income data
        const storedIncome = localStorage.getItem("incomeData")
        let incomeData = []
        if (storedIncome) {
          incomeData = JSON.parse(storedIncome).map((item) => ({
            ...item,
            type: "income",
          }))
        }

        // Get expense data
        const storedExpenses = localStorage.getItem("expensesData")
        let expenseData = []
        if (storedExpenses) {
          expenseData = JSON.parse(storedExpenses).map((item) => ({
            ...item,
            type: "expense",
          }))
        }

        // Combine and sort by date (newest first)
        const combined = [...incomeData, ...expenseData]
        const sorted = combined.sort((a, b) => new Date(b.date) - new Date(a.date))

        setTransactions(sorted)
      } catch (error) {
        console.error("Error fetching transactions:", error)
        setTransactions([])
      }
    }

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

    fetchTransactions()
    fetchSavingGoals()
  }, [])

  // Format date string to readable format (e.g., "Jan 1, 2023")
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Get category icon based on category name and transaction type
  const getCategoryIcon = (category, type) => {
    const INCOME_ICONS = {
      Salary: "💼",
      "Government Benefit": "🏛️",
      Investments: "📈",
      Other: "📋",
      default: "💰",
    }

    const EXPENSE_ICONS = {
      Food: "🍽️",
      Transport: "🚌",
      Entertainment: "🎬",
      Shopping: "🛍️",
      Utilities: "💡",
      Other: "📋",
      default: "💸",
    }

    if (type === "income") {
      return INCOME_ICONS[category] || INCOME_ICONS.default
    } else {
      return EXPENSE_ICONS[category] || EXPENSE_ICONS.default
    }
  }

  // Get date range for current month
  const getCurrentMonthRange = () => {
    const now = new Date()
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    }
  }

  // Get date range for previous month
  const getPreviousMonthRange = () => {
    const now = new Date()
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end: new Date(now.getFullYear(), now.getMonth(), 0),
    }
  }

  // Filter transactions by date range
  const filterTransactionsByDateRange = (transactions, dateRange) => {
    return transactions.filter((item) => {
      const itemDate = new Date(item.date)
      return itemDate >= dateRange.start && itemDate <= dateRange.end
    })
  }

  // Calculate total for transactions
  const calculateTotal = (transactions) => {
    return transactions.reduce((sum, item) => sum + item.value, 0)
  }

  // Calculate monthly income
  const calculateMonthlyIncome = () => {
    const currentMonthRange = getCurrentMonthRange()
    const currentMonthIncome = filterTransactionsByDateRange(
      transactions.filter((t) => t.type === "income"),
      currentMonthRange,
    )
    return calculateTotal(currentMonthIncome)
  }

  // Calculate monthly expenses
  const calculateMonthlyExpenses = () => {
    const currentMonthRange = getCurrentMonthRange()
    const currentMonthExpenses = filterTransactionsByDateRange(
      transactions.filter((t) => t.type === "expense"),
      currentMonthRange,
    )
    return calculateTotal(currentMonthExpenses)
  }

  // Calculate total balance
  const calculateTotalBalance = () => {
    const totalIncome = calculateTotal(transactions.filter((t) => t.type === "income"))
    const totalExpenses = calculateTotal(transactions.filter((t) => t.type === "expense"))
    return totalIncome - totalExpenses
  }

  // Calculate income change percentage
  const calculateIncomeChange = () => {
    const currentMonthIncome = calculateMonthlyIncome()

    const previousMonthRange = getPreviousMonthRange()
    const previousMonthIncome = calculateTotal(
      filterTransactionsByDateRange(
        transactions.filter((t) => t.type === "income"),
        previousMonthRange,
      ),
    )

    if (previousMonthIncome === 0) return 0
    return ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100
  }

  // Calculate expense change percentage
  const calculateExpenseChange = () => {
    const currentMonthExpenses = calculateMonthlyExpenses()

    const previousMonthRange = getPreviousMonthRange()
    const previousMonthExpenses = calculateTotal(
      filterTransactionsByDateRange(
        transactions.filter((t) => t.type === "expense"),
        previousMonthRange,
      ),
    )

    if (previousMonthExpenses === 0) return 0
    return ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100
  }

  // Calculate balance change percentage
  const calculateBalanceChange = () => {
    const currentMonthIncome = calculateMonthlyIncome()
    const currentMonthExpenses = calculateMonthlyExpenses()
    const currentBalance = currentMonthIncome - currentMonthExpenses

    const previousMonthRange = getPreviousMonthRange()
    const previousMonthIncome = calculateTotal(
      filterTransactionsByDateRange(
        transactions.filter((t) => t.type === "income"),
        previousMonthRange,
      ),
    )
    const previousMonthExpenses = calculateTotal(
      filterTransactionsByDateRange(
        transactions.filter((t) => t.type === "expense"),
        previousMonthRange,
      ),
    )
    const previousBalance = previousMonthIncome - previousMonthExpenses

    if (previousBalance === 0) return 0
    return ((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100
  }

  // Calculate savings rate
  const calculateSavingsRate = () => {
    const monthlyIncome = calculateMonthlyIncome()
    const monthlyExpenses = calculateMonthlyExpenses()

    if (monthlyIncome === 0) return 0
    const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
    return Math.round(savingsRate)
  }

  // Calculate savings rate change
  const calculateSavingsRateChange = () => {
    const currentSavingsRate = calculateSavingsRate()

    const previousMonthRange = getPreviousMonthRange()
    const previousMonthIncome = calculateTotal(
      filterTransactionsByDateRange(
        transactions.filter((t) => t.type === "income"),
        previousMonthRange,
      ),
    )
    const previousMonthExpenses = calculateTotal(
      filterTransactionsByDateRange(
        transactions.filter((t) => t.type === "expense"),
        previousMonthRange,
      ),
    )

    if (previousMonthIncome === 0) return 0
    const previousSavingsRate = Math.round(((previousMonthIncome - previousMonthExpenses) / previousMonthIncome) * 100)

    return currentSavingsRate - previousSavingsRate
  }

  const hasData = transactions && transactions.length > 0

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
          <div className="stat-value">${calculateTotalBalance().toFixed(2)}</div>
          <div className={`stat-change ${calculateBalanceChange() >= 0 ? "positive" : "negative"}`}>
            {calculateBalanceChange() >= 0 ? "+" : ""}
            {calculateBalanceChange().toFixed(1)}% from last month
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Monthly Income</div>
            <TrendingUp className="stat-icon" />
          </div>
          <div className="stat-value">${calculateMonthlyIncome().toFixed(2)}</div>
          <div className={`stat-change ${calculateIncomeChange() >= 0 ? "positive" : "negative"}`}>
            {calculateIncomeChange() >= 0 ? "+" : ""}
            {calculateIncomeChange().toFixed(1)}% from last month
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Monthly Expenses</div>
            <CreditCard className="stat-icon" />
          </div>
          <div className="stat-value">${calculateMonthlyExpenses().toFixed(2)}</div>
          <div className={`stat-change ${calculateExpenseChange() >= 0 ? "positive" : "negative"}`}>
            {calculateExpenseChange() >= 0 ? "+" : ""}
            {calculateExpenseChange().toFixed(1)}% from last month
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Savings Rate</div>
            <ArrowUpRight className="stat-icon" />
          </div>
          <div className="stat-value">{calculateSavingsRate()}%</div>
          <div className={`stat-change ${calculateSavingsRateChange() >= 0 ? "positive" : "negative"}`}>
            {calculateSavingsRateChange() >= 0 ? "+" : ""}
            {calculateSavingsRateChange()}% from last month
          </div>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeChartTab === "daily" ? "active" : ""}`}
            onClick={() => setActiveChartTab("daily")}
          >
            Daily
          </button>
          <button
            className={`tab ${activeChartTab === "monthly" ? "active" : ""}`}
            onClick={() => setActiveChartTab("monthly")}
          >
            Monthly
          </button>
        </div>

        <div className="tab-content">
          <div className="charts-grid">
            <div className="chart-card">
              <div className="card-header">
                <h3 className="card-title">Financial Summary</h3>
                <p className="card-description">
                  {activeChartTab === "daily"
                    ? "Daily cashflow for the current month"
                    : "Monthly income vs expenses for the year"}
                </p>
              </div>

              {activeChartTab === "daily" && hasData ? (
                <div className="month-selector">
                  <button className="month-nav-button" onClick={() => handleMonthChange("prev")}>
                    <ChevronDown size={20} />
                  </button>
                  <h3 className="selected-month">{selectedMonth.toLocaleDateString("en-US", { month: "long" })}</h3>
                  <button className="month-nav-button" onClick={() => handleMonthChange("next")}>
                    <ChevronUp size={20} />
                  </button>
                </div>
              ) : activeChartTab === "monthly" && hasData ? (
                <div className="month-selector">
                  <button className="month-nav-button" onClick={() => handleYearChange("prev")}>
                    <ChevronDown size={20} />
                  </button>
                  <h3 className="selected-month">{selectedYear}</h3>
                  <button className="month-nav-button" onClick={() => handleYearChange("next")}>
                    <ChevronUp size={20} />
                  </button>
                </div>
              ) : null}

              {/* Updated chart container with fixed height and flex styling */}
              <div className="chart-container" style={{ height: "350px", display: "flex", flexDirection: "column" }}>
                {activeChartTab === "daily" ? (
                  <DailyCashflowChart transactions={filteredTransactions} />
                ) : (
                  <MonthlyComparisonChart transactions={filteredTransactionsByYear} />
                )}
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
                  <div className="empty-state-wrapper">
                    <EmptyState
                      title="No Saving Goals Yet"
                      message="Start by creating saving goals to track your financial progress. Your goals will appear here."
                      icon={<Target size={48} className="text-[#8a4baf]" />}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-grid">
        <div className="chart-card">
          <div className="card-header">
            <h3 className="card-title">Recent Transactions</h3>
            <p className="card-description">Your latest financial activities</p>
          </div>
          <div className="goals-container">
            {transactions && transactions.length > 0 ? (
              <>
                <div className="transactions-list">
                  {transactions.slice(0, MAX_TRANSACTIONS).map((transaction) => (
                    <div
                      key={`${transaction.type}-${transaction.id}`}
                      className={transaction.type === "income" ? "income-item" : "expense-item"}
                    >
                      <div className={transaction.type === "income" ? "income-info" : "expense-info"}>
                        <div className={transaction.type === "income" ? "income-icon" : "expense-icon"}>
                          {getCategoryIcon(transaction.category, transaction.type)}
                        </div>
                        <div>
                          <div className={transaction.type === "income" ? "income-category" : "expense-category"}>
                            {transaction.category}
                          </div>
                          <div className={transaction.type === "income" ? "income-description" : "expense-description"}>
                            {transaction.description}
                          </div>
                        </div>
                      </div>
                      <div className={transaction.type === "income" ? "income-details" : "expense-details"}>
                        <div className={transaction.type === "income" ? "income-amount" : "expense-amount"}>
                          {transaction.type === "income"
                            ? `$${transaction.value.toFixed(2)}`
                            : `-$${transaction.value.toFixed(2)}`}
                        </div>
                        <div className={transaction.type === "income" ? "income-date" : "expense-date"}>
                          {formatDate(transaction.date)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="button-container">
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
                </div>
              </>
            ) : (
              <div className="empty-state-wrapper">
                <EmptyState
                  title="No Transaction Data Yet"
                  message="Start by adding your income/expense transactions through the respective forms. Your transaction data will appear here."
                  icon={<CreditCard size={48} className="text-[#8a4baf]" />}
                />
              </div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <div className="card-header">
            <h3 className="card-title">FAQ</h3>
            <p className="card-description">A set of frequently asked questions and answers</p>
          </div>
          <div className="goals-container">
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