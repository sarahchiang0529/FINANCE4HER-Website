"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Plus, Calendar, BarChart3, ChevronDown, ChevronUp } from "lucide-react"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import ChartComponent from "../../components/Charts/ChartComponent"
import MonthlyChartComponent from "../../components/Charts/MonthlyChartComponent"
import "./Finances.css"
import { useFinancial } from "../../contexts/FinancialContext" // Import the financial context

// Register required Chart.js components for bar chart visualization
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Define emoji icons for each expense category to improve visual recognition
const CATEGORY_ICONS = {
  Food: "🍽️",
  Transport: "🚌",
  Entertainment: "🎬",
  Shopping: "🛍️",
  Utilities: "💡",
  Other: "📋",
  default: "💸", // Fallback icon for undefined categories and Total Expenses
}

function Expenses() {
  // Use the financial context instead of local state for expenses data
  const { expenses, addExpense, isLoading } = useFinancial()

  // View state - controls which view is active (transactions or monthly summary)
  const [activeView, setActiveView] = useState("transactions")

  // Date and filtering state - manages the currently selected month and date range for filtering
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), // Last day of current month
  })

  // Expense data state - stores derived data
  const [monthlySummaries, setMonthlySummaries] = useState([]) // Aggregated monthly data
  const [selectedMonthDetails, setSelectedMonthDetails] = useState(null) // Selected month for detailed view

  // Form state - manages the new expense entry form
  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0], // Default to today's date in YYYY-MM-DD format
  })

  // Refs - used for scrolling to elements
  const monthlyDetailsRef = useRef(null) // Reference to monthly details section for smooth scrolling

  // Generate monthly summaries from expense data whenever expense data changes
  useEffect(() => {
    if (expenses.length === 0) {
      setMonthlySummaries([])
      return
    }

    // Group expenses by month and calculate totals for each category
    const summaries = expenses.reduce((acc, item) => {
      const date = new Date(item.date)
      // Create a unique key for each month-year combination
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      // Initialize month data if it doesn't exist
      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: new Date(date.getFullYear(), date.getMonth(), 1),
          total: 0,
          categories: {},
        }
      }

      // Add item value to month total
      acc[monthYear].total += item.value

      // Add item value to category total for the month
      if (!acc[monthYear].categories[item.category]) {
        acc[monthYear].categories[item.category] = 0
      }
      acc[monthYear].categories[item.category] += item.value

      return acc
    }, {})

    // Convert to array and sort by date (newest first) for display
    const summariesArray = Object.values(summaries).sort((a, b) => b.month - a.month)
    setMonthlySummaries(summariesArray)
  }, [expenses])

  // Filter expenses by selected date range and sort by date (newest first)
  // Using useMemo to avoid recalculation on every render
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((item) => {
        const itemDate = new Date(item.date)
        return itemDate >= dateRange.start && itemDate <= dateRange.end
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [expenses, dateRange])

  // Prepare chart data from filtered expenses
  // Using useMemo to avoid recalculation on every render
  const chartData = useMemo(() => {
    return filteredExpenses.map((item) => ({
      category: item.category,
      value: item.value,
    }))
  }, [filteredExpenses])

  // Calculate totals based on the active view (monthly or transactions)
  // Using useMemo to avoid recalculation on every render
  const { currentViewTotal, categoryTotals } = useMemo(() => {
    if (activeView === "monthly") {
      // For Monthly Summary view, calculate all-time totals from all expense entries
      const allTimeTotals = expenses.reduce(
        (acc, item) => {
          acc.total += item.value

          // Initialize category if it doesn't exist
          if (!acc.categories[item.category]) {
            acc.categories[item.category] = 0
          }
          acc.categories[item.category] += item.value

          return acc
        },
        { total: 0, categories: {} },
      )

      return {
        currentViewTotal: allTimeTotals.total,
        categoryTotals: allTimeTotals.categories,
      }
    } else {
      // For Transactions view, use the filtered expenses (by selected month)
      const monthlyTotal = filteredExpenses.reduce((sum, item) => sum + item.value, 0)

      // Calculate totals for each category in the filtered expenses
      const catTotals = filteredExpenses.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = 0
        }
        acc[item.category] += item.value
        return acc
      }, {})

      return {
        currentViewTotal: monthlyTotal,
        categoryTotals: catTotals,
      }
    }
  }, [activeView, expenses, filteredExpenses])

  // Handle form input changes with useCallback to prevent unnecessary re-renders
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setNewExpense((prev) => ({
      ...prev,
      [name]: value,
    }))
  }, [])

  // Add new expense entry using the context's addExpense method
  const handleAddExpense = useCallback(() => {
    const { amount, description, category, date } = newExpense
    const numericAmount = Number.parseFloat(amount)

    // Validate all required fields
    if (!amount || isNaN(numericAmount) || !category || !date || !description) {
      alert("Please fill in all required fields.")
      return
    }

    // Create new expense entry
    const newEntry = {
      category,
      value: numericAmount,
      description,
      date,
    }

    // Use the context's addExpense method
    addExpense(newEntry)
      .then(() => {
        // Reset form fields after successful submission
        setNewExpense({
          amount: "",
          description: "",
          category: "",
          date: new Date().toISOString().split("T")[0],
        })
      })
      .catch((error) => {
        console.error("Error adding expense:", error)
        alert("Failed to add expense. Please try again.")
      })
  }, [newExpense, addExpense])

  // Handle month navigation (previous/next) in transactions view
  // Updates selected month and date range for filtering
  const handleMonthChange = useCallback(
    (direction) => {
      const newMonth = new Date(selectedMonth)
      if (direction === "prev") {
        newMonth.setMonth(newMonth.getMonth() - 1)
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1)
      }
      setSelectedMonth(newMonth)

      // Update date range for filtering based on new selected month
      setDateRange({
        start: new Date(newMonth.getFullYear(), newMonth.getMonth(), 1), // First day of month
        end: new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 0), // Last day of month
      })
    },
    [selectedMonth],
  )

  // Handle month selection in monthly summary view
  // Sets the selected month details and scrolls to the details section
  const handleMonthSelect = useCallback((summary) => {
    setSelectedMonthDetails(summary)

    // Scroll to details section after a short delay to ensure render is complete
    setTimeout(() => {
      if (monthlyDetailsRef.current) {
        monthlyDetailsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    }, 100)
  }, [])

  // Utility function to get category icon based on category name
  const getCategoryIcon = useCallback((category) => {
    // Return just the emoji without any wrapper or styling
    return CATEGORY_ICONS[category] || CATEGORY_ICONS.default
  }, [])

  // Format date string to readable format (e.g., "Jan 1, 2023")
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }, [])

  // Format date to month and year format (e.g., "January 2023")
  const formatMonthYear = useCallback((date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }, [])

  // Check if there's any expense data to determine whether to show empty state
  const hasExpenseData = expenses.length > 0

  return (
    <div className="expenses-container">
      {/* Header Section */}
      <div className="page-header">
        <h1 className="page-title">Expenses</h1>
        <p className="page-subtitle">Track and manage your spending</p>
      </div>

      {/* Add Expense Form Section */}
      <div className="expense-card">
        <h2 className="form-title">Add Expense</h2>
        <p className="form-subtitle">Record a new expense transaction</p>
        <div className="expense-form">
          <div className="form-group">
            <div className="input-row">
              <div className="input-field">
                <label htmlFor="amount">Amount</label>
                <div className="input-with-icon">
                  <div className="input-icon">$</div>
                  <input
                    type="text"
                    id="amount"
                    name="amount"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="input-field">
                <label htmlFor="category">Category</label>
                <select id="category" name="category" value={newExpense.category} onChange={handleInputChange} required>
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="input-field">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={newExpense.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="input-field">
                <label>&nbsp;</label>
                <button className="btn-primary" onClick={handleAddExpense} disabled={isLoading}>
                  <Plus className="btn-icon" />
                  {isLoading ? "Adding..." : "Add Expense"}
                </button>
              </div>
            </div>

            <div className="input-row">
              <div className="input-field full-width">
                <label htmlFor="description">Description</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  placeholder="Description"
                  value={newExpense.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State - Shown when no expense data exists */}
      {!hasExpenseData && (
        <div className="empty-state-card">
          <div className="empty-state-icon">📊</div>
          <h3 className="empty-state-title">No Expense Data Yet</h3>
          <p className="empty-state-message">
            Start by adding your expense transactions using the form above. Your expense data will appear here.
          </p>
        </div>
      )}

      {/* Expense Data Display - Only shown when expense data exists */}
      {hasExpenseData && (
        <>
          {/* View Selector - Toggle between transactions and monthly summary views */}
          <div className="view-selector">
            <div className="view-tabs">
              <button
                className={`view-tab ${activeView === "transactions" ? "active" : ""}`}
                onClick={() => setActiveView("transactions")}
              >
                <Calendar size={16} />
                Transactions
              </button>
              <button
                className={`view-tab ${activeView === "monthly" ? "active" : ""}`}
                onClick={() => setActiveView("monthly")}
              >
                <BarChart3 size={16} />
                Monthly Summary
              </button>
            </div>
          </div>

          {/* Month Selector - Only shown in transactions view */}
          {activeView === "transactions" && (
            <div className="month-selector">
              <button className="month-nav-button" onClick={() => handleMonthChange("prev")}>
                <ChevronDown size={20} />
              </button>
              <h3 className="selected-month">{formatMonthYear(selectedMonth)}</h3>
              <button className="month-nav-button" onClick={() => handleMonthChange("next")}>
                <ChevronUp size={20} />
              </button>
            </div>
          )}

          {/* Summary Cards - Show totals for each category */}
          <div className="summary-cards" style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap" }}>
            {/* Total Expense Card */}
            <div className="summary-card" style={{ flex: "1 1 0" }}>
              <div className="summary-content">
                <div className="summary-icon-wrapper total-icon">
                  <div className="summary-icon">💸</div>
                </div>
                <h3 className="summary-title">Total Expenses</h3>
                <p className="summary-value">${currentViewTotal.toFixed(2)}</p>
                <p className="summary-period">
                  {activeView === "monthly" ? "All-time Total" : formatMonthYear(selectedMonth)}
                </p>
              </div>
            </div>

            {/* Category Summary Cards - One card for each predefined category */}
            {["Food", "Transport", "Entertainment", "Shopping", "Utilities"].map((category) => (
              <div className="summary-card" key={category} style={{ flex: "1 1 0" }}>
                <div className="summary-content">
                  <div className={`summary-icon-wrapper ${category.toLowerCase().replace(" ", "-")}-icon`}>
                    <div className="summary-icon">{getCategoryIcon(category)}</div>
                  </div>
                  <h3 className="summary-title">{category}</h3>
                  <p className="summary-value">${(categoryTotals[category] || 0).toFixed(2)}</p>
                  <p className="summary-period">
                    {activeView === "monthly" ? "All-time Total" : formatMonthYear(selectedMonth)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {activeView === "transactions" && (
            <div className="data-expenses-grid">
              <div className="expense-data-card">
                <div className="finance-card-header">
                  <h2 className="card-title">Expense Distribution</h2>
                  <p className="card-description">Breakdown of your spending</p>
                </div>

                {chartData.length > 0 ? (
                  <div className="chart-container-wrapper">
                    <ChartComponent data={chartData} chartType="doughnut" isIncome={false} />
                  </div>
                ) : (
                  <div className="no-data-message">
                    <p>No expense data for this period. Add transactions to see your expense distribution.</p>
                  </div>
                )}
              </div>

              <div className="expense-data-card">
                <div className="finance-card-header">
                  <h2 className="card-title">Expense Transactions</h2>
                  <p className="card-description">Your expense transactions for {formatMonthYear(selectedMonth)}</p>
                </div>

                {filteredExpenses.length > 0 ? (
                  <div className="expenses-list">
                    {filteredExpenses.map((entry) => (
                      <div key={entry.id} className="expense-item">
                        <div className="expense-info">
                          <div className="expense-icon">{getCategoryIcon(entry.category)}</div>
                          <div>
                            <div className="expense-category">{entry.category}</div>
                            <div className="expense-description">{entry.description}</div>
                          </div>
                        </div>
                        <div className="expense-details">
                          <div className="expense-amount">-${entry.value.toFixed(2)}</div>
                          <div className="expense-date">{formatDate(entry.date)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-data-message">
                    <p>No expense transactions found for this period.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeView === "monthly" && (
            <div className="monthly-view">
              {monthlySummaries.length > 0 ? (
                <>
                  {Array.from(new Set(monthlySummaries.map((summary) => summary.month.getFullYear()))).map((year) => {
                    const yearSummaries = monthlySummaries.filter((summary) => summary.month.getFullYear() === year)
                    const isSingleMonth = yearSummaries.length === 1

                    return (
                      <div key={year} className="year-section">
                        <h2 className="section-title">{year} Monthly Expenses</h2>

                        {isSingleMonth ? (
                          <div className="monthly-single-chart-container">
                            {yearSummaries.map((summary, index) => {
                              const monthData = Object.entries(summary.categories).map(([category, value]) => ({
                                category,
                                value,
                              }))
                              return (
                                <div
                                  key={index}
                                  className="month-chart-card single-month"
                                  onClick={() => handleMonthSelect(summary)}
                                >
                                  <div className="month-chart">
                                    <MonthlyChartComponent month={summary.month} data={monthData} isIncome={false} />
                                  </div>
                                  <div className="month-total">${summary.total.toFixed(2)}</div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="monthly-charts">
                            {yearSummaries
                              .sort((a, b) => a.month - b.month)
                              .map((summary, index) => {
                                const monthData = Object.entries(summary.categories).map(([category, value]) => ({
                                  category,
                                  value,
                                }))
                                return (
                                  <div
                                    key={index}
                                    className="month-chart-card"
                                    onClick={() => handleMonthSelect(summary)}
                                  >
                                    <div className="month-chart">
                                      <MonthlyChartComponent month={summary.month} data={monthData} isIncome={false} />
                                    </div>
                                    <div className="month-total">${summary.total.toFixed(2)}</div>
                                  </div>
                                )
                              })}
                          </div>
                        )}
                      </div>
                    )
                  })}

                  <div className="monthly-details-section" ref={monthlyDetailsRef}>
                    {selectedMonthDetails ? (
                      <>
                        <h2 className="section-title">
                          {selectedMonthDetails.month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}{" "}
                          Details
                        </h2>

                        <div className="monthly-details-content">
                          <div className="monthly-details-summary">
                            <div className="details-total">
                              <span className="details-label">Total Expenses:</span>
                              <span className="details-value">${selectedMonthDetails.total.toFixed(2)}</span>
                            </div>

                            <div className="details-categories">
                              {Object.entries(selectedMonthDetails.categories).map(([category, amount], index) => (
                                <div key={index} className="details-category-item">
                                  <div className="category-info">
                                    <span className="category-icon">{getCategoryIcon(category)}</span>
                                    <span className="category-name">{category}</span>
                                  </div>
                                  <div className="category-amount">${amount.toFixed(2)}</div>
                                </div>
                              ))}
                            </div>

                            <div className="monthly-details-chart">
                              <ChartComponent
                                data={Object.entries(selectedMonthDetails.categories).map(([category, value]) => ({
                                  category,
                                  value,
                                }))}
                                chartType="doughnut"
                                isIncome={false}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <h2 className="section-title">Monthly Details</h2>
                        <p className="section-subtitle">Click on any month above to see detailed breakdown</p>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="no-data-message">
                  <p>No monthly data available yet. Add expense transactions to see your monthly summaries.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Expenses