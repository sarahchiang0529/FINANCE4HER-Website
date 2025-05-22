import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Plus, Calendar, BarChart3, ChevronDown, ChevronUp, DollarSign, Edit, Trash2 } from "lucide-react"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import ChartComponent from "../../components/Charts/ChartComponent"
import MonthlyChartComponent from "../../components/Charts/MonthlyChartComponent"
import EmptyState from "../../components/EmptyState"
import "./Finances.css"

// Register required Chart. vjs components for bar chart visualization
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Update the CATEGORY_ICONS
const CATEGORY_ICONS = {
  Salary: "💼",
  "Government Benefit": "🏛️",
  Investments: "📈",
  Other: "📋",
  default: "💰", // Fallback icon for undefined categories and Total Income
}

function Income() {
  // View state - controls which view is active (transactions or monthly summary)
  const [activeView, setActiveView] = useState("transactions")

  // Date and filtering state - manages the currently selected month and date range for filtering
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), // Last day of current month
  })

  // Income data state - stores all income entries and derived data
  const [income, setIncome] = useState([]) // All income transactions
  const [monthlySummaries, setMonthlySummaries] = useState([]) // Aggregated monthly data
  const [selectedMonthDetails, setSelectedMonthDetails] = useState(null) // Selected month for detailed view

  useEffect(() => {
    // Load income data from localStorage when component mounts
    const storedIncome = localStorage.getItem("incomeData")
    if (storedIncome) {
      try {
        setIncome(JSON.parse(storedIncome))
      } catch (error) {
        console.error("Error parsing income data from localStorage:", error)
      }
    }
  }, [])

  useEffect(() => {
    // Save income data to localStorage whenever it changes
    localStorage.setItem("incomeData", JSON.stringify(income))
  }, [income])

  const [editingIncome, setEditingIncome] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  // Form state - manages the new income entry form
  const [newIncome, setNewIncome] = useState({
    amount: "",
    description: "",
    category: "",
    date: "", // Empty string instead of default date
  })

  // Refs - used for scrolling to elements
  const monthlyDetailsRef = useRef(null) // Reference to monthly details section for smooth scrolling

  // Generate monthly summaries from income data whenever income data changes
  useEffect(() => {
    if (income.length === 0) {
      setMonthlySummaries([])
      return
    }

    // Group income by month and calculate totals for each category
    const summaries = income.reduce((acc, item) => {
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
  }, [income])

  // Filter income by selected date range and sort by date (newest first)
  // Using useMemo to avoid recalculation on every render
  const filteredIncome = useMemo(() => {
    return income
      .filter((item) => {
        const itemDate = new Date(item.date)
        return itemDate >= dateRange.start && itemDate <= dateRange.end
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [income, dateRange])

  // Prepare chart data from filtered income
  // Using useMemo to avoid recalculation on every render
  const chartData = useMemo(() => {
    return filteredIncome.map((item) => ({
      category: item.category,
      value: item.value,
    }))
  }, [filteredIncome])

  // Calculate totals based on the active view (monthly or transactions)
  // Using useMemo to avoid recalculation on every render
  const { currentViewTotal, categoryTotals } = useMemo(() => {
    if (activeView === "monthly") {
      // For Monthly Summary view, calculate all-time totals from all income entries
      const allTimeTotals = income.reduce(
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
      // For Transactions view, use the filtered income (by selected month)
      const monthlyTotal = filteredIncome.reduce((sum, item) => sum + item.value, 0)

      // Calculate totals for each category in the filtered income
      const catTotals = filteredIncome.reduce((acc, item) => {
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
  }, [activeView, income, filteredIncome])

  // Handle form input changes with useCallback to prevent unnecessary re-renders
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setNewIncome((prev) => ({
      ...prev,
      [name]: value,
    }))
  }, [])

  // Add new income entry to the income state
  // Validates form data and creates a new entry with unique ID
  const handleAddIncome = useCallback(() => {
    const { amount, description, category, date } = newIncome
    const numericAmount = Number.parseFloat(amount)

    // Validate all required fields
    if (!amount || isNaN(numericAmount) || !category || !date || !description) {
      alert("Please fill in all required fields.")
      return
    }

    // Create new income entry with unique ID
    const newEntry = {
      id: Date.now(), // Use timestamp as unique ID
      category,
      value: numericAmount,
      description,
      date,
    }

    // Add new entry to the beginning of the income array
    setIncome((prev) => [newEntry, ...prev])

    // Reset form fields after successful submission
    setNewIncome({
      amount: "",
      description: "",
      category: "",
      date: "",
    })
  }, [newIncome])

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

  // Check if there's any income data to determine whether to show empty state
  const hasIncomeData = income.length > 0

  // Function to start editing an income entry
  const startEditIncome = (entry) => {
    // Make a deep copy to avoid modifying the original entry
    setEditingIncome({
      ...entry,
      amount: entry.value.toString(),
    })

    // Clear any delete confirmation that might be showing
    setShowDeleteConfirm(null)
  }

  // Function to cancel editing
  const cancelEditIncome = () => {
    setEditingIncome(null)
  }

  // Function to save edited income
  const saveEditIncome = () => {
    if (!editingIncome.category || !editingIncome.amount || !editingIncome.date || !editingIncome.description) {
      alert("Please fill in all required fields.")
      return
    }

    // Validate amount is a valid number
    const numericAmount = Number.parseFloat(editingIncome.amount)
    if (isNaN(numericAmount)) {
      alert("Please enter a valid amount.")
      return
    }

    const updatedEntry = {
      ...editingIncome,
      value: numericAmount,
    }
    delete updatedEntry.amount

    const updatedIncome = income.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))
    setIncome(updatedIncome)
    setEditingIncome(null)
  }

  // Function to confirm deletion
  const confirmDeleteIncome = (incomeId) => {
    setShowDeleteConfirm(incomeId)
  }

  // Function to cancel deletion
  const cancelDeleteIncome = () => {
    setShowDeleteConfirm(null)
  }

  // Function to delete income entry
  const deleteIncome = (incomeId) => {
    const updatedIncome = income.filter((entry) => entry.id !== incomeId)
    setIncome(updatedIncome)

    // Explicitly update localStorage to ensure changes are persisted
    localStorage.setItem("incomeData", JSON.stringify(updatedIncome))

    // Reset selected month details if the deleted item was part of the selected month
    if (selectedMonthDetails) {
      const deletedItemMonth = income.find((item) => item.id === incomeId)?.date
      if (deletedItemMonth) {
        const deletedDate = new Date(deletedItemMonth)
        const selectedDate = selectedMonthDetails.month

        if (
          deletedDate.getMonth() === selectedDate.getMonth() &&
          deletedDate.getFullYear() === selectedDate.getFullYear()
        ) {
          setSelectedMonthDetails(null)
        }
      }
    }

    setShowDeleteConfirm(null)
  }

  return (
    <div className="income-container">
      {/* Header Section */}
      <div className="page-header">
        <h1 className="page-title">Income</h1>
        <p className="page-subtitle">Track and manage your income sources</p>
      </div>

      {/* Add Income Form Section */}
      <div className="income-card">
        <h2 className="form-title">Add Income</h2>
        <p className="form-subtitle">Record a new income transaction</p>
        <div className="income-form">
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
                    value={newIncome.amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="input-field">
                <label htmlFor="category">Category</label>
                <select id="category" name="category" value={newIncome.category} onChange={handleInputChange} required>
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Salary">Salary</option>
                  <option value="Government Benefit">Government Benefit</option>
                  <option value="Investments">Investments</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="input-field">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  placeholder="yyyy-mm-dd"
                  value={newIncome.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="input-field">
                <label>&nbsp;</label>
                <button className="btn-primary" onClick={handleAddIncome}>
                  <Plus className="btn-icon" />
                  Add Income
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
                  value={newIncome.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {!hasIncomeData ? (
        <div className="income-data-card" style={{ marginTop: "32px" }}>
          <EmptyState
            title="No Income Data Yet"
            message="Start by adding your income transactions using the form above. Your income data will appear here."
            icon={<DollarSign size={48} className="text-[#8a4baf]" />}
          />
        </div>
      ) : (
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
            {/* Total Income Card */}
            <div className="summary-card" style={{ flex: "1 1 0" }}>
              <div className="summary-content">
                <div className="summary-icon-wrapper total-icon">
                  <div className="summary-icon">💰</div>
                </div>
                <h3 className="summary-title">Total Income</h3>
                <p className="summary-value">${currentViewTotal.toFixed(2)}</p>
                <p className="summary-period">
                  {activeView === "monthly" ? "All-time Total" : formatMonthYear(selectedMonth)}
                </p>
              </div>der5
            </div>

            {/* Category Summary Cards - One card for each predefined category */}
            {["Salary", "Investments", "Government Benefit", "Other"].map((category) => (
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
            <div className="data-income-grid">
              <div className="income-data-card">
                <div className="finance-card-header">
                  <h2 className="card-title">Income Distribution</h2>
                  <p className="card-description">Breakdown of your income</p>
                </div>

                {chartData.length > 0 ? (
                  <div className="chart-container-wrapper">
                    <ChartComponent data={chartData} chartType="doughnut" isIncome={true} />
                  </div>
                ) : (
                  <div className="no-data-message">
                    <p>No income data for this period. Add transactions to see your income distribution.</p>
                  </div>
                )}
              </div>

              <div className="income-data-card">
                <div className="finance-card-header">
                  <h2 className="card-title">Income Transactions</h2>
                  <p className="card-description">Your income transactions for {formatMonthYear(selectedMonth)}</p>
                </div>

                <div className="income-list">
                  {filteredIncome.map((entry) => (
                    <div key={entry.id} className="income-item">
                      {showDeleteConfirm === entry.id ? (
                        <div className="delete-confirm">
                          <p>Delete this transaction?</p>
                          <div className="delete-actions">
                            <button className="btn-secondary" onClick={cancelDeleteIncome}>
                              Cancel
                            </button>
                            <button className="btn-danger" onClick={() => deleteIncome(entry.id)}>
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : editingIncome && editingIncome.id === entry.id ? (
                        <div className="edit-transaction-form">
                          <div className="edit-form-row">
                            <div className="edit-field">
                              <label>Category</label>
                              <select
                                value={editingIncome.category}
                                onChange={(e) => setEditingIncome({ ...editingIncome, category: e.target.value })}
                              >
                                <option value="Salary">Salary</option>
                                <option value="Government Benefit">Government Benefit</option>
                                <option value="Investments">Investments</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div className="edit-field">
                              <label>Amount</label>
                              <div className="input-with-icon">
                                <div className="input-icon">$</div>
                                <input
                                  type="text"
                                  value={editingIncome.amount}
                                  onChange={(e) => setEditingIncome({ ...editingIncome, amount: e.target.value })}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="edit-form-row">
                            <div className="edit-field">
                              <label>Description</label>
                              <input
                                type="text"
                                value={editingIncome.description}
                                onChange={(e) => setEditingIncome({ ...editingIncome, description: e.target.value })}
                              />
                            </div>
                            <div className="edit-field">
                              <label>Date</label>
                              <input
                                type="date"
                                value={editingIncome.date}
                                onChange={(e) => setEditingIncome({ ...editingIncome, date: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="edit-actions">
                            <button className="btn-secondary" onClick={cancelEditIncome}>
                              Cancel
                            </button>
                            <button className="btn-primary" onClick={saveEditIncome}>
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="income-info">
                            <div className="income-icon">{getCategoryIcon(entry.category)}</div>
                            <div>
                              <div className="income-category">{entry.category}</div>
                              <div className="income-description">{entry.description}</div>
                            </div>
                          </div>
                          <div className="income-details">
                            <div className="income-amount">${entry.value.toFixed(2)}</div>
                            <div className="income-date">{formatDate(entry.date)}</div>
                            <div className="transaction-actions">
                              <button className="action-btn edit-btn" onClick={() => startEditIncome(entry)}>
                                <Edit size={16} />
                              </button>
                              <button className="action-btn delete-btn" onClick={() => confirmDeleteIncome(entry.id)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
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
                        <h2 className="section-title">{year} Monthly Income</h2>

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
                                    <MonthlyChartComponent month={summary.month} data={monthData} isIncome={true} />
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
                                      <MonthlyChartComponent month={summary.month} data={monthData} isIncome={true} />
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
                              <span className="details-label">Total Income:</span>
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
                                isIncome={true}
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
                  <p>No monthly data available yet. Add income transactions to see your monthly summaries.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Income