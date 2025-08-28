import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { Plus, Calendar, BarChart3, ChevronDown, ChevronUp, DollarSign, Edit, Trash2 } from "lucide-react"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import ChartComponent from "../../components/Charts/ChartComponent"
import MonthlyChartComponent from "../../components/Charts/MonthlyChartComponent"
import EmptyState from "../../components/EmptyState"
import "./Finances.css"

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Category emoji used in UI
const CATEGORY_ICONS = {
  Salary: "💼",
  "Government Benefit": "🏛️",
  Investments: "📈",
  Other: "📋",
  default: "💰",
}

// --- tiny fetch helper ---
//const BASE_URL = process.env.REACT_APP_API_BASE_URL || ""
const BASE_URL = "http://localhost:4000"
console.log("hello: ",BASE_URL)
async function api(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || err.message || `Request failed: ${res.status}`)
  }
  return res.status === 204 ? null : res.json()
}

function Income() {
  const { user, getAccessTokenSilently, isAuthenticated } = useAuth0()

  // View state
  const [activeView, setActiveView] = useState("transactions")
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  })

  // Data + UI state
  const [income, setIncome] = useState([])
  const [monthlySummaries, setMonthlySummaries] = useState([])
  const [selectedMonthDetails, setSelectedMonthDetails] = useState(null)
  const [editingIncome, setEditingIncome] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  // Form state
  const [newIncome, setNewIncome] = useState({
    amount: "",
    description: "",
    category: "",
    date: "",
  })

  // Categories: label <-> id maps
  const [categories, setCategories] = useState([])
  const [labelToCategoryId, setLabelToCategoryId] = useState({})
  const [categoryIdToLabel, setCategoryIdToLabel] = useState({})

  const monthlyDetailsRef = useRef(null)

  // ---------- Load categories + income from API ----------
  useEffect(() => {
    (async () => {
      if (!isAuthenticated || !user) return
      const token = await getAccessTokenSilently()

      // 1) categories
      const cats = await api(`/api/admin/categories`, { token })
      console.log(cats)
      setCategories(cats)
      const labelToId = Object.fromEntries(cats.map(c => [c.name, c.id]))
      const idToLabel = Object.fromEntries(cats.map(c => [String(c.id), c.name]))
      setLabelToCategoryId(labelToId)
      setCategoryIdToLabel(idToLabel)

      // 2) income list
      const rows = await api(`/api/users/${user.sub}/incomes`, { token })
      // map API -> UI shape (value as number, category label for display)
      const uiRows = rows.map(r => ({
        id: r.id,
        categoryId: r.category_id,
        category: idToLabel[String(r.category_id)] || "Other",
        value: Number(r.amount),
        description: r.description,
        date: r.date,
      }))
      // newest first by date
      uiRows.sort((a, b) => new Date(b.date) - new Date(a.date))
      setIncome(uiRows)
    })().catch(console.error)
  }, [isAuthenticated, user, getAccessTokenSilently])

  // ---------- Derived monthly summaries ----------
  useEffect(() => {
    if (income.length === 0) {
      setMonthlySummaries([])
      return
    }
    const summaries = income.reduce((acc, item) => {
      const date = new Date(item.date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      if (!acc[key]) {
        acc[key] = { month: new Date(date.getFullYear(), date.getMonth(), 1), total: 0, categories: {} }
      }
      acc[key].total += item.value
      acc[key].categories[item.category] = (acc[key].categories[item.category] || 0) + item.value
      return acc
    }, {})
    const summariesArray = Object.values(summaries).sort((a, b) => b.month - a.month)
    setMonthlySummaries(summariesArray)
  }, [income])

  // ---------- Filtering / charts ----------
  const filteredIncome = useMemo(() => {
    return income
      .filter((item) => {
        const d = new Date(item.date)
        return d >= dateRange.start && d <= dateRange.end
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [income, dateRange])

  const chartData = useMemo(
    () => filteredIncome.map((i) => ({ category: i.category, value: i.value })),
    [filteredIncome]
  )

  const { currentViewTotal, categoryTotals } = useMemo(() => {
    if (activeView === "monthly") {
      const all = income.reduce(
        (acc, item) => {
          acc.total += item.value
          acc.categories[item.category] = (acc.categories[item.category] || 0) + item.value
          return acc
        },
        { total: 0, categories: {} }
      )
      return { currentViewTotal: all.total, categoryTotals: all.categories }
    } else {
      const monthlyTotal = filteredIncome.reduce((sum, i) => sum + i.value, 0)
      const catTotals = filteredIncome.reduce((acc, i) => {
        acc[i.category] = (acc[i.category] || 0) + i.value
        return acc
      }, {})
      return { currentViewTotal: monthlyTotal, categoryTotals: catTotals }
    }
  }, [activeView, income, filteredIncome])

  // ---------- Form + actions ----------
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setNewIncome((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleAddIncome = useCallback(async () => {
    const { amount, description, category, date } = newIncome
    const numericAmount = Number.parseFloat(amount)
    if (!amount || Number.isNaN(numericAmount) || !category || !date || !description) {
      alert("Please fill in all required fields.")
      return
    }
    try {
      const token = await getAccessTokenSilently()
      const category_id = labelToCategoryId[category]
      if (!category_id) {
        alert("Unknown category. Pick one from the list.")
        return
      }
      const created = await api(`/api/users/${user.sub}/incomes`, {
        method: "POST",
        token,
        body: { amount: numericAmount, category_id, date, description },
      })
      const uiRow = {
        id: created.id,
        categoryId: created.category_id,
        category,
        value: Number(created.amount),
        description: created.description,
        date: created.date,
      }
      setIncome(prev => [uiRow, ...prev])
      setNewIncome({ amount: "", description: "", category: "", date: "" })
    } catch (e) {
      console.error(e)
      alert(e.message || "Failed to add income")
    }
  }, [newIncome, user, getAccessTokenSilently, labelToCategoryId])

  const startEditIncome = (entry) => {
    setEditingIncome({ ...entry, amount: entry.value.toString() })
    setShowDeleteConfirm(null)
  }
  const cancelEditIncome = () => setEditingIncome(null)

  const saveEditIncome = useCallback(async () => {
    if (!editingIncome) return
    if (!editingIncome.category || !editingIncome.amount || !editingIncome.date || !editingIncome.description) {
      alert("Please fill in all required fields.")
      return
    }
    const numericAmount = Number.parseFloat(editingIncome.amount)
    if (Number.isNaN(numericAmount)) {
      alert("Please enter a valid amount.")
      return
    }
    try {
      const token = await getAccessTokenSilently()
      const category_id = labelToCategoryId[editingIncome.category]
      const updated = await api(`/api/users/${user.sub}/incomes/${editingIncome.id}`, {
        method: "PUT",
        token,
        body: {
          amount: numericAmount,
          category_id,
          date: editingIncome.date,
          description: editingIncome.description,
        },
      })
      setIncome(list =>
        list.map(e =>
          e.id === updated.id
            ? {
                id: updated.id,
                categoryId: updated.category_id,
                category: categoryIdToLabel[String(updated.category_id)] || editingIncome.category,
                value: Number(updated.amount),
                description: updated.description,
                date: updated.date,
              }
            : e
        )
      )
      setEditingIncome(null)
    } catch (e) {
      console.error(e)
      alert(e.message || "Failed to update")
    }
  }, [editingIncome, user, getAccessTokenSilently, labelToCategoryId, categoryIdToLabel])

  const confirmDeleteIncome = (id) => setShowDeleteConfirm(id)
  const cancelDeleteIncome = () => setShowDeleteConfirm(null)

  const deleteIncome = useCallback(async (id) => {
    try {
      const token = await getAccessTokenSilently()
      await api(`/api/users/${user.sub}/incomes/${id}`, { method: "DELETE", token })
      setIncome(list => list.filter(e => e.id !== id))
      setShowDeleteConfirm(null)
    } catch (e) {
      console.error(e)
      alert(e.message || "Failed to delete")
    }
  }, [getAccessTokenSilently, user])

  // ---------- UI helpers ----------
  const handleMonthChange = useCallback((direction) => {
    const newMonth = new Date(selectedMonth)
    newMonth.setMonth(newMonth.getMonth() + (direction === "prev" ? -1 : 1))
    setSelectedMonth(newMonth)
    setDateRange({
      start: new Date(newMonth.getFullYear(), newMonth.getMonth(), 1),
      end: new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 0),
    })
  }, [selectedMonth])

  const handleMonthSelect = useCallback((summary) => {
    setSelectedMonthDetails(summary)
    setTimeout(() => {
      if (monthlyDetailsRef.current) {
        monthlyDetailsRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100)
  }, [])

  const getCategoryIcon = useCallback((category) => CATEGORY_ICONS[category] || CATEGORY_ICONS.default, [])
  const formatDate = useCallback((dateString) => {
    const d = new Date(dateString)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }, [])
  const formatMonthYear = useCallback((date) => date.toLocaleDateString("en-US", { month: "long", year: "numeric" }), [])

  const hasIncomeData = income.length > 0

  // ---------- Render ----------
  return (
    <div className="income-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Income</h1>
        <p className="page-subtitle">Track and manage your income sources</p>
      </div>

      {/* Add Income */}
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
                  <option value="" disabled>Select</option>
                  {/* Render from categories so it matches DB */}
                  {["Salary","Government Benefit","Investments","Other"].map((label) => (
                    <option key={label} value={label}>{label}</option>
                  ))}
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
          {/* View selector */}
          <div className="view-selector">
            <div className="view-tabs">
              <button className={`view-tab ${activeView === "transactions" ? "active" : ""}`} onClick={() => setActiveView("transactions")}>
                <Calendar size={16} /> Transactions
              </button>
              <button className={`view-tab ${activeView === "monthly" ? "active" : ""}`} onClick={() => setActiveView("monthly")}>
                <BarChart3 size={16} /> Monthly Summary
              </button>
            </div>
          </div>

          {/* Month selector */}
          {activeView === "transactions" && (
            <div className="month-selector">
              <button className="month-nav-button" onClick={() => handleMonthChange("prev")}><ChevronDown size={20} /></button>
              <h3 className="selected-month">{formatMonthYear(selectedMonth)}</h3>
              <button className="month-nav-button" onClick={() => handleMonthChange("next")}><ChevronUp size={20} /></button>
            </div>
          )}

          {/* Summary cards */}
          <div className="summary-cards" style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap" }}>
            <div className="summary-card" style={{ flex: "1 1 0" }}>
              <div className="summary-content">
                <div className="summary-icon-wrapper total-icon">
                  <div className="summary-icon">💰</div>
                </div>
                <h3 className="summary-title">Total Income</h3>
                <p className="summary-value">${currentViewTotal.toFixed(2)}</p>
                <p className="summary-period">{activeView === "monthly" ? "All-time Total" : formatMonthYear(selectedMonth)}</p>
              </div>
            </div>

            {["Salary", "Investments", "Government Benefit", "Other"].map((category) => (
              <div className="summary-card" key={category} style={{ flex: "1 1 0" }}>
                <div className="summary-content">
                  <div className={`summary-icon-wrapper ${category.toLowerCase().replace(" ", "-")}-icon`}>
                    <div className="summary-icon">{getCategoryIcon(category)}</div>
                  </div>
                  <h3 className="summary-title">{category}</h3>
                  <p className="summary-value">${(categoryTotals[category] || 0).toFixed(2)}</p>
                  <p className="summary-period">{activeView === "monthly" ? "All-time Total" : formatMonthYear(selectedMonth)}</p>
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
                            <button className="btn-secondary" onClick={cancelDeleteIncome}>Cancel</button>
                            <button className="btn-danger" onClick={() => deleteIncome(entry.id)}>Delete</button>
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
                            <button className="btn-secondary" onClick={cancelEditIncome}>Cancel</button>
                            <button className="btn-primary" onClick={saveEditIncome}>Save</button>
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
                  {Array.from(new Set(monthlySummaries.map((s) => s.month.getFullYear()))).map((year) => {
                    const yearSummaries = monthlySummaries.filter((s) => s.month.getFullYear() === year)
                    const isSingleMonth = yearSummaries.length === 1
                    return (
                      <div key={year} className="year-section">
                        <h2 className="section-title">{year} Monthly Income</h2>
                        {isSingleMonth ? (
                          <div className="monthly-single-chart-container">
                            {yearSummaries.map((summary, i) => {
                              const monthData = Object.entries(summary.categories).map(([category, value]) => ({ category, value }))
                              return (
                                <div key={i} className="month-chart-card single-month" onClick={() => handleMonthSelect(summary)}>
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
                            {yearSummaries.sort((a, b) => a.month - b.month).map((summary, i) => {
                              const monthData = Object.entries(summary.categories).map(([category, value]) => ({ category, value }))
                              return (
                                <div key={i} className="month-chart-card" onClick={() => handleMonthSelect(summary)}>
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
                          {selectedMonthDetails.month.toLocaleDateString("en-US", { month: "long", year: "numeric" })} Details
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
                                    <span className="category-icon">{CATEGORY_ICONS[category] || CATEGORY_ICONS.default}</span>
                                    <span className="category-name">{category}</span>
                                  </div>
                                  <div className="category-amount">${amount.toFixed(2)}</div>
                                </div>
                              ))}
                            </div>
                            <div className="monthly-details-chart">
                              <ChartComponent
                                data={Object.entries(selectedMonthDetails.categories).map(([category, value]) => ({ category, value }))}
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
