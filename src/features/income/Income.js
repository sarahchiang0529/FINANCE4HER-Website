import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Plus, Calendar, BarChart3, ChevronDown, ChevronUp } from "lucide-react"
import ChartComponent from "../../components/ChartComponent/ChartComponent"
import MonthlyChartComponent from "../../components/MonthlyChartComponent/MonthlyChartComponent"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import "./Income.css"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

Object.keys(ChartJS.registry.plugins.items || {}).forEach((key) => {
  if (key.toLowerCase().includes("centertext") || key.toLowerCase().includes("monthlytext")) {
    ChartJS.unregister(ChartJS.registry.plugins.items[key])
  }
})

const CATEGORY_ICONS = {
  Salary: "💼",
  "Government Benefit": "🏛️",
  Investments: "📈",
  Other: "💰",
  default: "💵",
}

function Income() {
  const [activeView, setActiveView] = useState("transactions")
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  })

  const [income, setIncome] = useState([])
  const [monthlySummaries, setMonthlySummaries] = useState([])
  const [selectedMonthDetails, setSelectedMonthDetails] = useState(null)

  const [newIncome, setNewIncome] = useState({
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  })

  const monthlyDetailsRef = useRef(null)

  // Generate monthly summaries from income data
  useEffect(() => {
    if (income.length === 0) {
      setMonthlySummaries([])
      return
    }

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

    const summariesArray = Object.values(summaries).sort((a, b) => b.month - a.month)
    setMonthlySummaries(summariesArray)
  }, [income])

  // Filter income by selected month
  const filteredIncome = useMemo(() => {
    return income
      .filter((item) => {
        const itemDate = new Date(item.date)
        return itemDate >= dateRange.start && itemDate <= dateRange.end
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [income, dateRange])

  const chartData = useMemo(() => {
    return filteredIncome.map((item) => ({
      category: item.category,
      value: item.value,
    }))
  }, [filteredIncome])

  // Calculate totals based on active view
  const { currentViewTotal, categoryTotals } = useMemo(() => {
    if (activeView === "monthly") {
      const allTimeTotals = income.reduce(
        (acc, item) => {
          acc.total += item.value

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
      const monthlyTotal = filteredIncome.reduce((sum, item) => sum + item.value, 0)

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

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setNewIncome((prev) => ({
      ...prev,
      [name]: value,
    }))
  }, [])

  // Add new income entry
  const handleAddIncome = useCallback(() => {
    const { amount, description, category, date } = newIncome
    const numericAmount = Number.parseFloat(amount)

    if (!amount || isNaN(numericAmount) || !category || !date || !description) {
      alert("Please fill in all required fields.")
      return
    }

    const newEntry = {
      id: Date.now(),
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
  }, [newIncome])

  // Navigate between months
  const handleMonthChange = useCallback(
    (direction) => {
      const newMonth = new Date(selectedMonth)
      if (direction === "prev") {
        newMonth.setMonth(newMonth.getMonth() - 1)
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1)
      }
      setSelectedMonth(newMonth)

      setDateRange({
        start: new Date(newMonth.getFullYear(), newMonth.getMonth(), 1),
        end: new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 0),
      })
    },
    [selectedMonth],
  )

  // Select a month for detailed view
  const handleMonthSelect = useCallback((summary) => {
    setSelectedMonthDetails(summary)

    setTimeout(() => {
      if (monthlyDetailsRef.current) {
        monthlyDetailsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    }, 100)
  }, [])

  const getCategoryIcon = useCallback((category) => {
    return CATEGORY_ICONS[category] || CATEGORY_ICONS.default
  }, [])

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }, [])

  const formatMonthYear = useCallback((date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }, [])

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

          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-content">
                <div className="summary-icon-wrapper total-icon">
                  <div className="summary-icon">💰</div>
                </div>
                <h3 className="summary-title">Total Income</h3>
                <p className="summary-value">${currentViewTotal.toFixed(2)}</p>
                <p className="summary-period">
                  {activeView === "monthly" ? "All Time" : formatMonthYear(selectedMonth)}
                </p>
              </div>
            </div>

            {["Salary", "Investments", "Government Benefit", "Other"].map((category) => (
              <div className="summary-card" key={category}>
                <div className="summary-content">
                  <div className={`summary-icon-wrapper ${category.toLowerCase().replace(" ", "-")}-icon`}>
                    <div className="summary-icon">{getCategoryIcon(category)}</div>
                  </div>
                  <h3 className="summary-title">{category}</h3>
                  <p className="summary-value">${(categoryTotals[category] || 0).toFixed(2)}</p>
                  <p className="summary-period">
                    {activeView === "monthly" ? "All Time" : formatMonthYear(selectedMonth)}
                  </p>
                </div>
              </div>
            ))}
          </div>

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
                            {yearSummaries
                              .sort((a, b) => a.month - b.month)
                              .map((summary, index) => {
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
                                type="income"
                                chartId={`monthly-details-chart-${selectedMonthDetails.month.getTime()}`}
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