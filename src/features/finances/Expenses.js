import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { Plus, Calendar, BarChart3, ChevronDown, ChevronUp, CreditCard, Edit, Trash2 } from "lucide-react"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import ChartComponent from "../../components/Charts/ChartComponent"
import MonthlyChartComponent from "../../components/Charts/MonthlyChartComponent"
import EmptyState from "../../components/EmptyState"
import "./Finances.css"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const CATEGORY_ICONS = {
  Food: "🍽️",
  Transport: "🚌",
  Entertainment: "🎬",
  Shopping: "🛍️",
  Utilities: "💡",
  Other: "📋",
  default: "💸",
}

const BASE_URL = "http://localhost:4000"

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

function Expenses() {
  const { user, getAccessTokenSilently, isAuthenticated } = useAuth0()

  const [activeView, setActiveView] = useState("transactions")
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  })

  const [expenses, setExpenses] = useState([])
  const [monthlySummaries, setMonthlySummaries] = useState([])
  const [selectedMonthDetails, setSelectedMonthDetails] = useState(null)
  const [editingExpense, setEditingExpense] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    category_id: "",
    date: "",
  })

  const [categories, setCategories] = useState([])
  const [categoryIdToLabel, setCategoryIdToLabel] = useState({})

  const monthlyDetailsRef = useRef(null)

  // Load categories + expenses from API
  useEffect(() => {
    (async () => {
      if (!isAuthenticated || !user) return
      const token = await getAccessTokenSilently()

      // 1) categories
      const cats = await api(`/api/admin/categories`, { token })
      setCategories(cats)
      const idToLabel = Object.fromEntries(cats.map(c => [String(c.id), c.name]))
      setCategoryIdToLabel(idToLabel)

      // 2) expenses list
      const rows = await api(`/api/users/${user.sub}/expenses`, { token })
      const uiRows = rows.map(r => ({
        id: r.id,
        categoryId: r.category_id,
        category: idToLabel[String(r.category_id)] || "Other",
        value: Number(r.amount),
        description: r.description,
        date: r.date,
      }))
      uiRows.sort((a, b) => new Date(b.date) - new Date(a.date))
      setExpenses(uiRows)
    })().catch(console.error)
  }, [isAuthenticated, user, getAccessTokenSilently])

  // Derived monthly summaries
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
    const summariesArray = Object.values(summaries).sort((a, b) => b.month - a.month)
    setMonthlySummaries(summariesArray)
  }, [expenses])

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((item) => {
        const d = new Date(item.date)
        return d >= dateRange.start && d <= dateRange.end
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [expenses, dateRange])

  const chartData = useMemo(
    () => filteredExpenses.map((i) => ({ category: i.category, value: i.value })),
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
        { total: 0, categories: {} }
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

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setNewExpense((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleAddExpense = useCallback(async () => {
    const { amount, description, category_id, date } = newExpense
    const numericAmount = Number.parseFloat(amount)
    if (!amount || Number.isNaN(numericAmount) || !category_id || !date || !description) {
      alert("Please fill in all required fields.")
      return
    }
    try {
      const token = await getAccessTokenSilently()
      const created = await api(`/api/users/${user.sub}/expenses`, {
        method: "POST",
        token,
        body: { amount: numericAmount, category_id, date, description },
      })
      const uiRow = {
        id: created.id,
        categoryId: created.category_id,
        category: categoryIdToLabel[String(created.category_id)],
        value: Number(created.amount),
        description: created.description,
        date: created.date,
      }
      setExpenses(prev => [uiRow, ...prev])
      setNewExpense({ amount: "", description: "", category_id: "", date: "" })
    } catch (e) {
      console.error(e)
      alert(e.message || "Failed to add expense")
    }
  }, [newExpense, user, getAccessTokenSilently, categoryIdToLabel])

  const startEditExpense = (entry) => {
    setEditingExpense({
      ...entry,
      amount: entry.value.toString(),
      categoryId: entry.categoryId
    })
    setShowDeleteConfirm(null)
  }

  const cancelEditExpense = () => setEditingExpense(null)

  const saveEditExpense = useCallback(async () => {
    if (!editingExpense) return
    if (!editingExpense.categoryId || !editingExpense.amount || !editingExpense.date || !editingExpense.description) {
      alert("Please fill in all required fields.")
      return
    }
    const numericAmount = Number.parseFloat(editingExpense.amount)
    if (Number.isNaN(numericAmount)) {
      alert("Please enter a valid amount.")
      return
    }
    try {
      const token = await getAccessTokenSilently()
      const updated = await api(`/api/users/${user.sub}/expenses/${editingExpense.id}`, {
        method: "PUT",
        token,
        body: {
          amount: numericAmount,
          category_id: editingExpense.categoryId,
          date: editingExpense.date,
          description: editingExpense.description,
        },
      })
      setExpenses(list =>
        list.map(e =>
          e.id === updated.id
            ? {
                id: updated.id,
                categoryId: updated.category_id,
                category: categoryIdToLabel[String(updated.category_id)],
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
      alert(e.message || "Failed to update")
    }
  }, [editingExpense, user, getAccessTokenSilently, categoryIdToLabel])

  const confirmDeleteExpense = (id) => setShowDeleteConfirm(id)
  const cancelDeleteExpense = () => setShowDeleteConfirm(null)

  const deleteExpense = useCallback(async (id) => {
    try {
      const token = await getAccessTokenSilently()
      await api(`/api/users/${user.sub}/expenses/${id}`, { method: "DELETE", token })
      setExpenses(list => list.filter(e => e.id !== id))
      setShowDeleteConfirm(null)
    } catch (e) {
      console.error(e)
      alert(e.message || "Failed to delete")
    }
  }, [getAccessTokenSilently, user])

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

  return (
    <div className="expenses-container">
      <div className="page-header">
        <h1 className="page-title">Expenses</h1>
        <p className="page-subtitle">Track and manage your spending</p>
      </div>

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
                <label htmlFor="category_id">Category</label>
                <select
                  id="category_id"
                  name="category_id"
                  value={newExpense.category_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>Select</option>
                  {categories
                    .filter(cat => ["Food", "Transport", "Entertainment", "Shopping", "Utilities", "Other"].includes(cat.name))
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))
                  }
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
          <div className="tabs-container">
            <div className="tabs">
              <button
                className={`tab ${activeView === "transactions" ? "active" : ""}`}
                onClick={() => setActiveView("transactions")}
              >
                <Calendar size={16} />
                Transactions
              </button>
              <button
                className={`tab ${activeView === "monthly" ? "active" : ""}`}
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

          {activeView === "monthly" && (
            <div className="summary-header">
              <h2 className="summary-title-header">All-time Summary</h2>
            </div>
          )}

          <div className="summary-cards" style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap" }}>
            <div className="card" style={{ flex: "1 1 0" }}>
              <div className="summary-content">
                <div className="summary-icon-wrapper total-icon">
                  <div className="summary-icon">💸</div>
                </div>
                <h3 className="summary-title">Total Expenses</h3>
                <p className="summary-value">${currentViewTotal.toFixed(2)}</p>
              </div>
            </div>

            {["Food", "Transport", "Entertainment", "Shopping", "Utilities"].map((category) => (
              <div className="card" key={category} style={{ flex: "1 1 0" }}>
                <div className="summary-content">
                  <div className={`summary-icon-wrapper ${category.toLowerCase().replace(" ", "-")}-icon`}>
                    <div className="summary-icon">{getCategoryIcon(category)}</div>
                  </div>
                  <h3 className="summary-title">{category}</h3>
                  <p className="summary-value">${(categoryTotals[category] || 0).toFixed(2)}</p>
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
                    <div>No expense data for this period.</div>
                    <div>Add transactions to see your expense distribution.</div>
                  </div>
                )}
              </div>

              <div className="expense-data-card">
                <div className="finance-card-header">
                  <h2 className="card-title">Expense Transactions</h2>
                  <p className="card-description">Your expense transactions for {formatMonthYear(selectedMonth)}</p>
                </div>

                <div className="expenses-list">
                  {filteredExpenses.length === 0 ? (
                    <div className="no-data-message">
                      <div>No expense data for this period.</div>
                      <div>Add transactions to see your expenses.</div>
                    </div>
                  ) : (
                    filteredExpenses.map((entry) => (
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
                                value={editingExpense.categoryId}
                                onChange={(e) => setEditingExpense({ ...editingExpense, categoryId: e.target.value })}
                              >
                                {categories
                                  .filter(cat => ["Food", "Transport", "Entertainment", "Shopping", "Utilities", "Other"].includes(cat.name))
                                  .map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                  ))
                                }
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
                            <button className="cancel-btn" onClick={cancelEditExpense}>Cancel</button>
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
                            <div className="goal-actions">
                              <button className="icon-button" onClick={() => startEditExpense(entry)}>
                                <Edit size={16} />
                              </button>
                              <button className="icon-button" onClick={() => confirmDeleteExpense(entry.id)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )))}
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
                        <div className="section-header">
                          <h2 className="section-title">{year} Monthly Expenses</h2>
                        </div>
                        {isSingleMonth ? (
                          <div className="monthly-single-chart-container">
                            {yearSummaries.map((summary, i) => {
                              const monthData = Object.entries(summary.categories).map(([category, value]) => ({ category, value }))
                              return (
                                <div key={i} className="expense-data-card single-month" onClick={() => handleMonthSelect(summary)}>
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
                                <div key={i} className="expense-data-card" onClick={() => handleMonthSelect(summary)}>
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
                              {Object.entries(selectedMonthDetails.categories).map(([category, amount], index) => {
                                const categoryClass = `category-${category.toLowerCase().replace(/\s+/g, '-')}`;
                                return (
                                  <div key={index} className={`details-category-item ${categoryClass}`}>
                                    <div className="category-info">
                                      <span className="category-icon">{CATEGORY_ICONS[category] || CATEGORY_ICONS.default}</span>
                                      <span className="category-name">{category}</span>
                                    </div>
                                    <div className="category-amount">${amount.toFixed(2)}</div>
                                  </div>
                                );
                              })}
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