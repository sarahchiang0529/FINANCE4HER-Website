import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { Plus, Calendar, BarChart3, ChevronDown, ChevronUp, CreditCard, Edit, Trash2 } from "lucide-react"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import ChartComponent from "../../components/Charts/ChartComponent"
import MonthlyChartComponent from "../../components/Charts/MonthlyChartComponent"
import EmptyState from "../../components/EmptyState"
import "./Finances.css"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Emoji for display only
const CATEGORY_ICONS = {
  Food: "🍽️",
  Transport: "🚌",
  Entertainment: "🎬",
  Shopping: "🛍️",
  Utilities: "💡",
  Other: "📋",
  default: "💸",
}

// ----- API helper -----
// In dev, hard-code to your backend port. Swap to env/proxy later if you want.
const BASE_URL = "http://localhost:4000"

async function api(path, { method = "GET", body, token } = {}) {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  if (res.status === 204) return null

  const ct = res.headers.get("content-type") || ""
  const isJson = ct.includes("application/json")

  if (!res.ok) {
    const msg = isJson ? await res.json().catch(() => ({})) : await res.text()
    const text = isJson ? (msg.error || msg.message || JSON.stringify(msg)) : String(msg)
    throw new Error(`HTTP ${res.status} ${url} → ${text.slice(0, 400)}`)
  }
  return isJson ? res.json() : res.text()
}

function Expenses() {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0()

  // View / filters
  const [activeView, setActiveView] = useState("transactions")
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  })

  // Data + UI
  const [expenses, setExpenses] = useState([])
  const [monthlySummaries, setMonthlySummaries] = useState([])
  const [selectedMonthDetails, setSelectedMonthDetails] = useState(null)
  const [editingExpense, setEditingExpense] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  // Form
  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    category: "",
    date: "",
  })

  const monthlyDetailsRef = useRef(null)

  // -------- Load expenses from API (no localStorage) --------
  useEffect(() => {
    (async () => {
      if (!isAuthenticated || !user) return
      const token = await getAccessTokenSilently().catch(() => null)

      // Expect the API to return either:
      //  A) flattened rows with { category: "Food" }
      //  B) rows with join: { categories: { name: "Food" } }
      const rows = await api(`/api/users/${user.sub}/expenses`, { token })

      const uiRows = rows.map((r) => ({
        id: r.id,
        category: r.category ?? r.categories?.name ?? "(Unknown)",
        value: Number(r.amount),
        description: r.description,
        date: r.date,
      }))

      uiRows.sort((a, b) => new Date(b.date) - new Date(a.date))
      setExpenses(uiRows)
    })().catch((e) => {
      console.error("Failed to load expenses:", e)
      alert(e.message || "Failed to load expenses")
    })
  }, [isAuthenticated, user, getAccessTokenSilently])

  // -------- Derive monthly summaries --------
  useEffect(() => {
    if (expenses.length === 0) {
      setMonthlySummaries([])
      return
    }
    const summaries = expenses.reduce((acc, item) => {
      const date = new Date(item.date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      if (!acc[key]) {
        acc[key] = { month: new Date(date.getFullYear(), date.getMonth(), 1), total: 0, categories: {} }
      }
      acc[key].total += item.value
      acc[key].categories[item.category] = (acc[key].categories[item.category] || 0) + item.value
      return acc
    }, {})
    const arr = Object.values(summaries).sort((a, b) => b.month - a.month)
    setMonthlySummaries(arr)
  }, [expenses])

  // -------- Filters & chart data --------
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((item) => {
        const d = new Date(item.date)
        return d >= dateRange.start && d <= dateRange.end
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [expenses, dateRange])

  const chartData = useMemo(
    () => filteredExpenses.map((item) => ({ category: item.category, value: item.value })),
    [filteredExpenses]
  )

  const { currentViewTotal, categoryTotals } = useMemo(() => {
    if (activeView === "monthly") {
      const all = expenses.reduce(
        (acc, item) => {
          acc.total += item.value
          acc.categories[item.category] = (acc.categories[item.category] || 0) + item.value
          return acc
        },
        { total: 0, categories: {} },
      )
      return { currentViewTotal: all.total, categoryTotals: all.categories }
    } else {
      const monthlyTotal = filteredExpenses.reduce((sum, i) => sum + i.value, 0)
      const catTotals = filteredExpenses.reduce((acc, i) => {
        acc[i.category] = (acc[i.category] || 0) + i.value
        return acc
      }, {})
      return { currentViewTotal: monthlyTotal, categoryTotals: catTotals }
    }
  }, [activeView, expenses, filteredExpenses])

  // -------- Form handlers --------
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setNewExpense((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleAddExpense = useCallback(async () => {
    const { amount, description, category, date } = newExpense
    const numericAmount = Number.parseFloat(amount)
    if (!amount || Number.isNaN(numericAmount) || !category || !date || !description) {
      alert("Please fill in all required fields.")
      return
    }
    try {
      const token = await getAccessTokenSilently().catch(() => null)

      // Send the category LABEL; backend resolves to category_id (no user creation).
      const created = await api(`/api/users/${user.sub}/expenses`, {
        method: "POST",
        token,
        body: { amount: numericAmount, category, date, description },
      })

      // Map API -> UI
      const uiRow = {
        id: created.id,
        category: created.category ?? created.categories?.name ?? category,
        value: Number(created.amount),
        description: created.description,
        date: created.date,
      }
      setExpenses((prev) => [uiRow, ...prev])
      setNewExpense({ amount: "", description: "", category: "", date: "" })
    } catch (e) {
      console.error(e)
      alert(e.message || "Failed to add expense")
    }
  }, [newExpense, user, getAccessTokenSilently])

  // -------- Edit / Delete --------
  const startEditExpense = (entry) => {
    setEditingExpense({ ...entry, amount: entry.value.toString() })
    setShowDeleteConfirm(null)
  }
  const cancelEditExpense = () => setEditingExpense(null)

  const saveEditExpense = useCallback(async () => {
    if (!editingExpense) return
    const { category, amount, date, description } = editingExpense
    if (!category || !amount || !date || !description) {
      alert("Please fill in all required fields.")
      return
    }
    const numericAmount = Number.parseFloat(amount)
    if (Number.isNaN(numericAmount)) {
      alert("Please enter a valid amount.")
      return
    }
    try {
      const token = await getAccessTokenSilently().catch(() => null)
      const updated = await api(`/api/users/${user.sub}/expenses/${editingExpense.id}`, {
        method: "PUT",
        token,
        body: {
          amount: numericAmount,
          category,          // send label; backend resolves category_id
          date,
          description,
        },
      })

      setExpenses((list) =>
        list.map((e) =>
          e.id === updated.id
            ? {
                id: updated.id,
                category: updated.category ?? updated.categories?.name ?? category,
                value: Number(updated.amount),
                description: updated.description,
                date: updated.date,
              }
            : e
        )
      )
      setEditingExpense(null)
    } catch (e) {
      console.error(e)
      alert(e.message || "Failed to update expense")
    }
  }, [editingExpense, user, getAccessTokenSilently])

  const confirmDeleteExpense = (id) => setShowDeleteConfirm(id)
  const cancelDeleteExpense = () => setShowDeleteConfirm(null)

  const deleteExpense = useCallback(async (id) => {
    try {
      const token = await getAccessTokenSilently().catch(() => null)
      await api(`/api/users/${user.sub}/expenses/${id}`, { method: "DELETE", token })
      setExpenses((list) => list.filter((e) => e.id !== id))
      setShowDeleteConfirm(null)
    } catch (e) {
      console.error(e)
      alert(e.message || "Failed to delete expense")
    }
  }, [getAccessTokenSilently, user])

  // -------- UI helpers --------
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

  const hasExpenseData = expenses.length > 0

  // ----- Render -----
  return (
    <div className="expenses-container">
      <div className="page-header">
        <h1 className="page-title">Expenses</h1>
        <p className="page-subtitle">Track and manage your spending</p>
      </div>

      {/* Add Expense */}
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
                  <option value="" disabled>Select</option>
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
                  placeholder="yyyy-mm-dd"
                  value={newExpense.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="input-field">
                <label>&nbsp;</label>
                <button className="btn-primary" onClick={handleAddExpense}>
                  <Plus className="btn-icon" />
                  Add Expense
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

      {!hasExpenseData ? (
        <div className="expense-data-card" style={{ marginTop: "32px" }}>
          <EmptyState
            title="No Expense Data Yet"
            message="Start by adding your expense transactions using the form above. Your expense data will appear here."
            icon={<CreditCard size={48} className="text-[#8a4baf]" />}
          />
        </div>
      ) : (
        <>
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

          {activeView === "transactions" && (
            <div className="month-selector">
              <button className="month-nav-button" onClick={() => handleMonthChange("prev")}><ChevronDown size={20} /></button>
              <h3 className="selected-month">{formatMonthYear(selectedMonth)}</h3>
              <button className="month-nav-button" onClick={() => handleMonthChange("next")}><ChevronUp size={20} /></button>
            </div>
          )}

          <div className="summary-cards" style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap" }}>
            <div className="summary-card" style={{ flex: "1 1 0" }}>
              <div className="summary-content">
                <div className="summary-icon-wrapper total-icon"><div className="summary-icon">💸</div></div>
                <h3 className="summary-title">Total Expenses</h3>
                <p className="summary-value">${currentViewTotal.toFixed(2)}</p>
                <p className="summary-period">{activeView === "monthly" ? "All-time Total" : formatMonthYear(selectedMonth)}</p>
              </div>
            </div>

            {["Food", "Transport", "Entertainment", "Shopping", "Utilities"].map((category) => (
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

                <div className="expenses-list">
                  {filteredExpenses.map((entry) => (
                    <div key={entry.id} className="expense-item">
                      {showDeleteConfirm === entry.id ? (
                        <div className="delete-confirm">
                          <p>Delete this transaction?</p>
                          <div className="delete-actions">
                            <button className="btn-secondary" onClick={cancelDeleteExpense}>Cancel</button>
                            <button className="btn-danger" onClick={() => deleteExpense(entry.id)}>Delete</button>
                          </div>
                        </div>
                      ) : editingExpense && editingExpense.id === entry.id ? (
                        <div className="edit-transaction-form">
                          <div className="edit-form-row">
                            <div className="edit-field">
                              <label>Category</label>
                              <select
                                value={editingExpense.category}
                                onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
                              >
                                <option value="Food">Food</option>
                                <option value="Transport">Transport</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Shopping">Shopping</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div className="edit-field">
                              <label>Amount</label>
                              <div className="input-with-icon">
                                <div className="input-icon">$</div>
                                <input
                                  type="text"
                                  value={editingExpense.amount}
                                  onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="edit-form-row">
                            <div className="edit-field">
                              <label>Description</label>
                              <input
                                type="text"
                                value={editingExpense.description}
                                onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                              />
                            </div>
                            <div className="edit-field">
                              <label>Date</label>
                              <input
                                type="date"
                                value={editingExpense.date}
                                onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="edit-actions">
                            <button className="btn-secondary" onClick={cancelEditExpense}>Cancel</button>
                            <button className="btn-primary" onClick={saveEditExpense}>Save</button>
                          </div>
                        </div>
                      ) : (
                        <>
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
                            <div className="transaction-actions">
                              <button className="action-btn edit-btn" onClick={() => startEditExpense(entry)}>
                                <Edit size={16} />
                              </button>
                              <button className="action-btn delete-btn" onClick={() => confirmDeleteExpense(entry.id)}>
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
                        <h2 className="section-title">{year} Monthly Expenses</h2>

                        {isSingleMonth ? (
                          <div className="monthly-single-chart-container">
                            {yearSummaries.map((summary, i) => {
                              const monthData = Object.entries(summary.categories).map(([category, value]) => ({ category, value }))
                              return (
                                <div key={i} className="month-chart-card single-month" onClick={() => handleMonthSelect(summary)}>
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
                            {yearSummaries.sort((a, b) => a.month - b.month).map((summary, i) => {
                              const monthData = Object.entries(summary.categories).map(([category, value]) => ({ category, value }))
                              return (
                                <div key={i} className="month-chart-card" onClick={() => handleMonthSelect(summary)}>
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
                          {selectedMonthDetails.month.toLocaleDateString("en-US", { month: "long", year: "numeric" })} Details
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
