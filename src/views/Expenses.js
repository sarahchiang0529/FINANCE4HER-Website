"use client"

import { useState } from "react"
import ChartComponent from "../components/ChartComponent"
import PageWrapper from "../components/PageWrapper"
import "../stylesheets/Expenses.css"
import { Plus } from "lucide-react"

function Expenses() {
  const [expenses, setExpenses] = useState([
    { category: "Food", value: 45.0, description: "Groceries", date: "Apr 14, 2025" },
    { category: "Transport", value: 15.5, description: "Bus fare", date: "Apr 13, 2025" },
    { category: "Utilities", value: 60.0, description: "Electricity bill", date: "Apr 12, 2025" },
    { category: "Entertainment", value: 30.0, description: "Movie", date: "Apr 10, 2025" },
    { category: "Food", value: 55.0, description: "Dinner", date: "Mar 15, 2025" },
    { category: "Transport", value: 20.0, description: "Taxi", date: "Mar 10, 2025" },
  ])

  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    category: "",
    date: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewExpense((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddExpense = () => {
    const { amount, description, category, date } = newExpense
    const numericAmount = Number.parseFloat(amount)

    if (!amount || isNaN(numericAmount) || !description) {
      alert("Please enter a valid amount and description.")
      return
    }

    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

    const newEntry = {
      category,
      value: numericAmount,
      description,
      date: formattedDate,
    }

    setExpenses((prev) => [...prev, newEntry])

    // Reset input fields
    setNewExpense({
      amount: "",
      description: "",
      category: "",
      date: "",
    })
  }

  // Retrieve icon based on expense category
  const getCategoryIcon = (category) => {
    switch (category) {
      case "Food":
        return "🍽️"
      case "Transport":
        return "🚌"
      case "Utilities":
        return "💡"
      case "Entertainment":
        return "🎬"
      case "Shopping":
        return "🛍️"
      case "Other":
        return "📋"
    }
  }

  return (
    <PageWrapper>
      <div className="expenses-container">
        {/* Expenses header section */}
        <div className="page-header">
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">Track your spending habits</p>
        </div>

        {/* Expenses form */}
        <div className="expense-card">
          <h2 className="form-title">Add Expense</h2>
          <p className="form-subtitle">Record a new expense transaction</p>
          <div className="expense-form">
            <div className="form-group">
              <div className="input-row">
                <div className="input-field">
                  <label htmlFor="amount">Amount</label>
                  <div className="input-with-icon">
                    <span className="input-icon">$</span>
                    <input
                      type="text"
                      id="amount"
                      name="amount"
                      placeholder="0.00"
                      value={newExpense.amount}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="input-field">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={newExpense.category}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Shopping">Shopping</option>
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
                  />
                </div>

                <div className="button-container">
                  <button className="add-button" onClick={handleAddExpense}>
                    <Plus className="button-icon" />
                    Add Expense
                  </button>
                </div>
              </div>

              <div className="input-row description-row">
                <div className="input-field full-width">
                  <label htmlFor="description">Description</label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    placeholder="Description"
                    value={newExpense.description}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid layout: Chart and Log */}
        <div className="expenses-grid">
          {/* Chart Section */}
          <div className="expense-card">
            <h2 className="card-title">Expenses Chart</h2>
            <p className="card-description">Spending breakdown</p>
            <ChartComponent data={expenses} type="expenses" />
          </div>

          {/* Expense Log Section */}
          <div className="expense-card">
            <h2 className="card-title">Expense Log</h2>
            <p className="card-description">Your recent expense transactions</p>
            <div className="expenses-list">
              {/* Only show the first 6 items */}
              {expenses.slice(0, 6).map((entry, index) => (
                <div key={index} className="expense-item">
                  <div className="expense-info">
                    <div className="expense-icon">{getCategoryIcon(entry.category)}</div>
                    <div>
                      <div className="expense-category">{entry.category}</div>
                      <div className="expense-description">{entry.description}</div>
                    </div>
                  </div>
                  <div className="expense-details">
                    <div className="expense-amount">-${entry.value.toFixed(2)}</div>
                    <div className="expense-date">{entry.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

export default Expenses