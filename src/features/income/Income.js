"use client"
import { useState, useEffect, useRef } from "react"
import { Plus, Calendar, BarChart3, Filter, Download, ChevronDown, ChevronUp } from "lucide-react"
import ChartComponent from "../../components/ChartComponent/ChartComponent"
import MonthlyChartComponent from "../../components/MonthlyChartComponent/MonthlyChartComponent"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import "./Income.css"

// Register required Chart.js components for bar chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Unregister any existing plugins with IDs that might contain "centerText"
// This ensures we don't have any leftover plugins from previous implementations
Object.keys(ChartJS.registry.plugins.items || {}).forEach((key) => {
  if (key.toLowerCase().includes("centertext") || key.toLowerCase().includes("monthlytext")) {
    ChartJS.unregister(ChartJS.registry.plugins.items[key])
  }
})

function Income() {
  const [activeView, setActiveView] = useState("transactions")
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [showFilters, setShowFilters] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  })

  // Start with an empty income array - no hardcoded data
  const [income, setIncome] = useState([])

  const [newIncome, setNewIncome] = useState({
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  })

  // Calculate monthly summaries
  const [monthlySummaries, setMonthlySummaries] = useState([])

  // Add this state for selected month details
  const [selectedMonthDetails, setSelectedMonthDetails] = useState(null)

  useEffect(() => {
    // Group income by month and calculate totals
    const summaries = income.reduce((acc, item) => {
      const date = new Date(item.date)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: new Date(date.getFullYear(), date.getMonth(), 1),
          total: 0,
          categories: {},
        }
      }

      acc[monthYear].total += item.value

      if (!acc[monthYear].categories[item.category]) {
        acc[monthYear].categories[item.category] = 0
      }
      acc[monthYear].categories[item.category] += item.value

      return acc
    }, {})

    // Convert to array and sort by date (newest first)
    const summariesArray = Object.values(summaries).sort((a, b) => b.month - a.month)
    setMonthlySummaries(summariesArray)
  }, [income])

  // Filter income based on selected month and category
  const filteredIncome = income
    .filter((item) => {
      const itemDate = new Date(item.date)
      const inSelectedMonth = itemDate >= dateRange.start && itemDate <= dateRange.end

      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter

      return inSelectedMonth && matchesCategory
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  // Prepare data for the chart component
  const chartData = filteredIncome.map((item) => ({
    category: item.category,
    value: item.value,
  }))

  // Prepare data for monthly trend chart
  const monthlyTrendData = {
    labels: monthlySummaries
      .slice(0, 6)
      .reverse()
      .map((summary) => summary.month.toLocaleDateString("en-US", { month: "short" })),
    datasets: [
      {
        label: "Monthly Income",
        data: monthlySummaries
          .slice(0, 6)
          .reverse()
          .map((summary) => summary.total),
        backgroundColor: "rgba(138, 75, 175, 0.7)",
        borderColor: "#8a4baf",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  const monthlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => "$" + value,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `Income: $${context.raw.toFixed(2)}`,
        },
      },
    },
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewIncome((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddIncome = () => {
    const { amount, description, category, date } = newIncome
    const numericAmount = Number.parseFloat(amount)

    if (!amount || isNaN(numericAmount) || !category || !date || !description) {
      alert("Please fill in all required fields.")
      return
    }

    const newEntry = {
      id: Date.now(), // Use timestamp as unique ID
      category,
      value: numericAmount,
      description,
      date,
    }

    setIncome((prev) => [newEntry, ...prev])

    setNewIncome({
      amount: "",
      description: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
    })
  }

  const handleMonthChange = (direction) => {
    const newMonth = new Date(selectedMonth)
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    setSelectedMonth(newMonth)

    // Update date range
    setDateRange({
      start: new Date(newMonth.getFullYear(), newMonth.getMonth(), 1),
      end: new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 0),
    })
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Salary":
        return "💼"
      case "Government Benefit":
        return "🏛️"
      case "Investments":
        return "📈"
      case "Other":
        return "💰"
      default:
        return "💵"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  // Calculate totals for the current view
  const currentViewTotal = filteredIncome.reduce((sum, item) => sum + item.value, 0)

  // Calculate category totals for the summary cards
  const categoryTotals = filteredIncome.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = 0
    }
    acc[item.category] += item.value
    return acc
  }, {})

  // Add this function to handle month selection
  const monthlyDetailsRef = useRef(null)

  const handleMonthSelect = (summary) => {
    setSelectedMonthDetails(summary)

    // Add a small delay to ensure the details section is rendered before scrolling
    setTimeout(() => {
      if (monthlyDetailsRef.current) {
        monthlyDetailsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    }, 100)
  }

  // Find the highest monthly income to use as the max value for gauge charts
  const maxMonthlyIncome = Math.max(...monthlySummaries.map((summary) => summary.total), 1000)

  // Check if there's any income data
  const hasIncomeData = income.length > 0

  return (
    <div className="income-container">
      <div className="page-header">
        <h1 className="page-title">Income</h1>
        <p className="page-subtitle">Track and manage your income sources</p>
      </div>

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
                <input type="date" id="date" name="date" value={newIncome.date} onChange={handleInputChange} required />
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

      {!hasIncomeData && (
        <div className="empty-state-card">
          <div className="empty-state-icon">📊</div>
          <h3 className="empty-state-title">No Income Data Yet</h3>
          <p className="empty-state-message">
            Start by adding your income transactions using the form above. Your income data will appear here.
          </p>
        </div>
      )}

      {hasIncomeData && (
        <>
          {/* View Selector */}
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

            <div className="view-actions">
              <button className="action-button" onClick={() => setShowFilters(!showFilters)}>
                <Filter size={16} />
                Filter
              </button>
              <button className="action-button">
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="filters-container">
              <div className="filter-group">
                <label>Category</label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="all">All Categories</option>
                  <option value="Salary">Salary</option>
                  <option value="Government Benefit">Government Benefit</option>
                  <option value="Investments">Investments</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Date Range</label>
                <div className="date-range-inputs">
                  <input
                    type="date"
                    value={dateRange.start.toISOString().split("T")[0]}
                    onChange={(e) => setDateRange({ ...dateRange, start: new Date(e.target.value) })}
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={dateRange.end.toISOString().split("T")[0]}
                    onChange={(e) => setDateRange({ ...dateRange, end: new Date(e.target.value) })}
                  />
                </div>
              </div>

              <button
                className="btn-secondary"
                onClick={() => {
                  setCategoryFilter("all")
                  const currentMonth = new Date()
                  setDateRange({
                    start: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
                    end: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0),
                  })
                }}
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Month Selector (only for transactions view) */}
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

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-icon total-icon">💰</div>
              <div className="summary-content">
                <h3 className="summary-title">Total Income</h3>
                <p className="summary-value">${currentViewTotal.toFixed(2)}</p>
                <p className="summary-period">
                  {activeView === "transactions" ? formatMonthYear(selectedMonth) : "All Time"}
                </p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon salary-icon">💼</div>
              <div className="summary-content">
                <h3 className="summary-title">Salary</h3>
                <p className="summary-value">${(categoryTotals["Salary"] || 0).toFixed(2)}</p>
                <p className="summary-period">
                  {activeView === "transactions" ? formatMonthYear(selectedMonth) : "All Time"}
                </p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon investments-icon">📈</div>
              <div className="summary-content">
                <h3 className="summary-title">Investments</h3>
                <p className="summary-value">${(categoryTotals["Investments"] || 0).toFixed(2)}</p>
                <p className="summary-period">
                  {activeView === "transactions" ? formatMonthYear(selectedMonth) : "All Time"}
                </p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon other-icon">🏛️</div>
              <div className="summary-content">
                <h3 className="summary-title">Other Sources</h3>
                <p className="summary-value">
                  ${((categoryTotals["Government Benefit"] || 0) + (categoryTotals["Other"] || 0)).toFixed(2)}
                </p>
                <p className="summary-period">
                  {activeView === "transactions" ? formatMonthYear(selectedMonth) : "All Time"}
                </p>
              </div>
            </div>
          </div>

          {/* Transactions View */}
          {activeView === "transactions" && (
            <div className="income-grid">
              <div className="income-card">
                <h2 className="card-title">Income Distribution</h2>
                <p className="card-description">Breakdown of your income sources</p>

                {chartData.length > 0 ? (
                  <div className="chart-container-wrapper">
                    <ChartComponent data={chartData} type="income" />
                  </div>
                ) : (
                  <div className="no-data-message">
                    <p>No income data for this period. Add transactions to see your income distribution.</p>
                  </div>
                )}
              </div>

              <div className="income-card" style={{ display: "flex", flexDirection: "column" }}>
                <h2 className="card-title">Income Transactions</h2>
                <p className="card-description">Your income transactions for {formatMonthYear(selectedMonth)}</p>

                {filteredIncome.length > 0 ? (
                  <div className="income-list">
                    {filteredIncome.map((entry) => (
                      <div key={entry.id} className="income-item">
                        <div className="income-info">
                          <div className="income-icon">{getCategoryIcon(entry.category)}</div>
                          <div>
                            <div className="income-category">{entry.category}</div>
                            <div className="income-description">{entry.description}</div>
                          </div>
                        </div>
                        <div className="income-details">
                          <div className="income-amount">+${entry.value.toFixed(2)}</div>
                          <div className="income-date">{formatDate(entry.date)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-data-message">
                    <p>No income transactions found for this period.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Monthly Summary View */}
          {activeView === "monthly" && (
            <div className="monthly-view">
              {monthlySummaries.length > 0 ? (
                <>
                  {/* Group monthly summaries by year */}
                  {Array.from(new Set(monthlySummaries.map((summary) => summary.month.getFullYear()))).map((year) => (
                    <div key={year} className="year-section">
                      <h2 className="section-title">{year} Monthly Income</h2>

                      {/* If there's only one month, center it in the card */}
                      {monthlySummaries.filter((summary) => summary.month.getFullYear() === year).length === 1 ? (
                        <div className="monthly-single-chart-container">
                          {monthlySummaries
                            .filter((summary) => summary.month.getFullYear() === year)
                            .map((summary, index) => {
                              // Create a new Date object for each month to ensure it's properly isolated
                              const monthDate = new Date(summary.month.getTime())

                              return (
                                <div
                                  key={index}
                                  className="month-chart-card single-month"
                                  onClick={() => handleMonthSelect(summary)}
                                >
                                  <div className="month-chart">
                                    <MonthlyChartComponent
                                      data={Object.entries(summary.categories).map(([category, value]) => ({
                                        category,
                                        value,
                                      }))}
                                      month={monthDate}
                                    />
                                  </div>
                                  <div className="month-total">${summary.total.toFixed(2)}</div>
                                </div>
                              )
                            })}
                        </div>
                      ) : (
                        <div className="monthly-charts">
                          {monthlySummaries
                            .filter((summary) => summary.month.getFullYear() === year)
                            .sort((a, b) => a.month - b.month) // Changed from b.month - a.month to a.month - b.month
                            .map((summary, index) => {
                              // Create a new Date object for each month to ensure it's properly isolated
                              const monthDate = new Date(summary.month.getTime())

                              return (
                                <div
                                  key={index}
                                  className="month-chart-card"
                                  onClick={() => handleMonthSelect(summary)}
                                >
                                  <div className="month-chart">
                                    <MonthlyChartComponent
                                      data={Object.entries(summary.categories).map(([category, value]) => ({
                                        category,
                                        value,
                                      }))}
                                      month={monthDate}
                                    />
                                  </div>
                                  <div className="month-total">${summary.total.toFixed(2)}</div>
                                </div>
                              )
                            })}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Monthly Details Section */}
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
                                type="income"
                                chartId="monthly-details-chart" // Add this prop
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