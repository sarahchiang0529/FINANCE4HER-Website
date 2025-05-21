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
  Calendar,
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
  const MAX_GOALS = 5
  // Maximum number of transactions to display
  const MAX_TRANSACTIONS = 4
  // State for active chart tab
  const [activeChartTab, setActiveChartTab] = useState("daily")

  // State for date selection
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Format date to month format only (e.g., "May")
  // eslint-disable-next-line no-unused-vars
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

  // Check if there's data for the current month
  const hasCurrentMonthData = useMemo(() => {
    return filteredTransactions.length > 0
  }, [filteredTransactions])

  // Filter transactions by selected year
  const filteredTransactionsByYear = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      return transactionDate.getFullYear() === selectedYear
    })
  }, [transactions, selectedYear])

  // Update the useEffect hook to fetch transactions from localStorage
  useEffect(() => {
    // Get the first 2 FAQ items
    setFaqs(faqItems.slice(0, 2))

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

  // Get date range for selected month
  const getSelectedMonthRange = () => {
    return {
      start: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1),
      end: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0),
    }
  }

  // Get date range for previous month relative to selected month
  const getPreviousMonthRange = () => {
    const prevMonth = new Date(selectedMonth)
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    return {
      start: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1),
      end: new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0),
    }
  }

  // Filter transactions by date range
  const filterTransactionsByDateRange = (transactions, dateRange) => {
    return transactions.filter((item) => {
      const itemDate = new Date(item.date)
      return itemDate >= dateRange.start && itemDate <= dateRange.end
    })
  }

  // Calculate total from a list of transactions
  const calculateTotal = (transactions) => {
    return transactions.reduce((sum, item) => sum + item.value, 0)
  }

  // Calculate monthly income for selected month only
  const calculateMonthlyIncome = () => {
    const selectedMonthRange = getSelectedMonthRange()
    const selectedMonthTransactions = filterTransactionsByDateRange(
      transactions.filter((t) => t.type === "income"),
      selectedMonthRange,
    )
    return calculateTotal(selectedMonthTransactions)
  }

  // Calculate monthly expenses for selected month only
  const calculateMonthlyExpenses = () => {
    const selectedMonthRange = getSelectedMonthRange()
    const selectedMonthTransactions = filterTransactionsByDateRange(
      transactions.filter((t) => t.type === "expense"),
      selectedMonthRange,
    )
    return calculateTotal(selectedMonthTransactions)
  }

  // Calculate income change percentage
  const calculateIncomeChange = () => {
    // If there's no data for the current month, don't show a change
    if (!hasCurrentMonthData) return null

    const selectedMonthIncome = calculateMonthlyIncome()

    const previousMonthRange = getPreviousMonthRange()
    const previousMonthIncome = calculateTotal(
      filterTransactionsByDateRange(
        transactions.filter((t) => t.type === "income"),
        previousMonthRange,
      ),
    )

    // Handle case where previous income is zero
    if (previousMonthIncome === 0) {
      // If we now have income, it's a 100% increase
      if (selectedMonthIncome > 0) return 100
      // If we still have no income, there's no change
      return 0
    }

    // Calculate percentage change
    return ((selectedMonthIncome - previousMonthIncome) / previousMonthIncome) * 100
  }

  // Calculate expense change percentage
  const calculateExpenseChange = () => {
    // If there's no data for the current month, don't show a change
    if (!hasCurrentMonthData) return null

    const selectedMonthExpenses = calculateMonthlyExpenses()

    const previousMonthRange = getPreviousMonthRange()
    const previousMonthExpenses = calculateTotal(
      filterTransactionsByDateRange(
        transactions.filter((t) => t.type === "expense"),
        previousMonthRange,
      ),
    )

    // Handle case where previous expenses are zero
    if (previousMonthExpenses === 0) {
      // If we now have expenses, it's a 100% increase
      if (selectedMonthExpenses > 0) return 100
      // If we still have no expenses, there's no change
      return 0
    }

    // Calculate percentage change
    return ((selectedMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100
  }

  // Calculate total balance up to the selected month
  const calculateTotalBalance = () => {
    // Get the end date of the selected month
    const endOfSelectedMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0)

    // Filter transactions up to and including the selected month
    const relevantTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate <= endOfSelectedMonth
    })

    // Calculate income and expenses for all transactions up to the selected month
    const totalIncome = calculateTotal(relevantTransactions.filter((t) => t.type === "income"))
    const totalExpenses = calculateTotal(relevantTransactions.filter((t) => t.type === "expense"))

    // Return the balance for all transactions up to the selected month
    return totalIncome - totalExpenses
  }

  // Calculate balance change percentage (month over month)
  const calculateBalanceChange = () => {
    // Calculate total balance up to the selected month
    const currentBalance = calculateTotalBalance()

    // Get the end date of the previous month
    const prevMonth = new Date(selectedMonth)
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    const endOfPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0)

    // Filter transactions up to and including the previous month
    const prevMonthTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate <= endOfPrevMonth
    })

    // Calculate income and expenses for all transactions up to the previous month
    const prevMonthIncome = calculateTotal(prevMonthTransactions.filter((t) => t.type === "income"))
    const prevMonthExpenses = calculateTotal(prevMonthTransactions.filter((t) => t.type === "expense"))

    // Calculate the previous month's balance
    const prevBalance = prevMonthIncome - prevMonthExpenses

    // If there's no change in transactions between the previous month and the selected month,
    // return null to indicate no change
    if (currentBalance === prevBalance) {
      return null
    }

    // Handle case where previous balance is zero or negative
    if (prevBalance === 0) {
      // If we now have a positive balance, it's a 100% increase
      if (currentBalance > 0) return 100
      // If we now have a negative balance, it's a -100% change
      if (currentBalance < 0) return -100
      // If both are zero, there's no change
      return 0
    }

    // Calculate percentage change, handling negative values properly
    return ((currentBalance - prevBalance) / Math.abs(prevBalance)) * 100
  }

  // Calculate savings rate up to the selected month
  const calculateAllTimeSavingsRate = () => {
    // Get the end date of the selected month
    const endOfSelectedMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0)

    // Filter transactions up to and including the selected month
    const relevantTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate <= endOfSelectedMonth
    })

    // Calculate income and expenses for all transactions up to the selected month
    const totalIncome = calculateTotal(relevantTransactions.filter((t) => t.type === "income"))
    const totalExpenses = calculateTotal(relevantTransactions.filter((t) => t.type === "expense"))

    // Calculate savings rate
    if (totalIncome === 0) return 0
    const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100
    return Math.round(savingsRate)
  }

  // Calculate savings rate change (month over month)
  const calculateSavingsRateChange = () => {
    // Calculate savings rate up to the selected month
    const currentSavingsRate = calculateAllTimeSavingsRate()

    // Get the end date of the previous month
    const prevMonth = new Date(selectedMonth)
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    const endOfPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0)

    // Filter transactions up to and including the previous month
    const prevMonthTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate <= endOfPrevMonth
    })

    // Calculate income and expenses for all transactions up to the previous month
    const prevMonthIncome = calculateTotal(prevMonthTransactions.filter((t) => t.type === "income"))
    const prevMonthExpenses = calculateTotal(prevMonthTransactions.filter((t) => t.type === "expense"))

    // Calculate the previous month's savings rate
    let prevSavingsRate = 0
    if (prevMonthIncome > 0) {
      prevSavingsRate = Math.round(((prevMonthIncome - prevMonthExpenses) / prevMonthIncome) * 100)
    }

    // If there's no change in transactions between the previous month and the selected month,
    // return null to indicate no change
    if (currentSavingsRate === prevSavingsRate) {
      return null
    }

    // Return the difference in savings rates
    return currentSavingsRate - prevSavingsRate
  }

  // Calculate monthly savings rate for the selected month
  const calculateMonthlySavingsRate = () => {
    const monthlyIncome = calculateMonthlyIncome()
    const monthlyExpenses = calculateMonthlyExpenses()

    if (monthlyIncome === 0) return 0
    const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
    return Math.round(savingsRate)
  }

  // Check if there's data for the current selection
  const hasDataDaily = filteredTransactions && filteredTransactions.length > 0
  const hasDataMonthly = filteredTransactionsByYear && filteredTransactionsByYear.length > 0

  // Render the percentage change with appropriate styling
  const renderPercentageChange = (change) => {
    // If change is null (no data for current month), show neutral message
    if (change === null) {
      return <span className="stat-change neutral">+0.0% from last month</span>
    }

    return (
      <span className={`stat-change ${change >= 0 ? "positive" : "negative"}`}>
        {change >= 0 ? "+" : ""}
        {change.toFixed(1)}% from last month
      </span>
    )
  }

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
          <div className="stat-context">{renderPercentageChange(calculateBalanceChange())}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Monthly Income</div>
            <TrendingUp className="stat-icon" />
          </div>
          <div className="stat-value">${calculateMonthlyIncome().toFixed(2)}</div>
          <div className="stat-context">{renderPercentageChange(calculateIncomeChange())}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Monthly Expenses</div>
            <CreditCard className="stat-icon" />
          </div>
          <div className="stat-value">${calculateMonthlyExpenses().toFixed(2)}</div>
          <div className="stat-context">{renderPercentageChange(calculateExpenseChange())}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Savings Rate</div>
            <ArrowUpRight className="stat-icon" />
          </div>
          <div className="stat-value">{calculateAllTimeSavingsRate()}%</div>
          <div className="stat-context">{renderPercentageChange(calculateSavingsRateChange())}</div>
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

              {/* Always show the date selector, but style it differently when no data */}
              <div
                className={`date-selector-container ${activeChartTab === "daily" ? (hasDataDaily ? "" : "no-data") : hasDataMonthly ? "" : "no-data"}`}
              >
                {activeChartTab === "daily" ? (
                  <div className="dashboard-month-selector">
                    <button className="month-nav-button" onClick={() => handleMonthChange("prev")}>
                      <ChevronDown size={20} />
                    </button>
                    <div className="selected-date">
                      <Calendar className="date-icon" size={16} />
                      <h3 className="selected-month">{selectedMonth.toLocaleDateString("en-US", { month: "long" })}</h3>
                    </div>
                    <button className="month-nav-button" onClick={() => handleMonthChange("next")}>
                      <ChevronUp size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="dashboard-month-selector">
                    <button className="month-nav-button" onClick={() => handleYearChange("prev")}>
                      <ChevronDown size={20} />
                    </button>
                    <div className="selected-date">
                      <Calendar className="date-icon" size={16} />
                      <h3 className="selected-month">{selectedYear}</h3>
                    </div>
                    <button className="month-nav-button" onClick={() => handleYearChange("next")}>
                      <ChevronUp size={20} />
                    </button>
                  </div>
                )}
              </div>

              {/* Chart container with fixed height and flex styling */}
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

          {transactions && transactions.length > 0 ? (
            <>
              <div className="transactions-list">
                {transactions.slice(0, MAX_TRANSACTIONS).map((transaction) => (
                  <div
                    key={`${transaction.type}-${transaction.id}`}
                    className={transaction.type === "income" ? "dashboard-income-item" : "dashboard-expense-item"}
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