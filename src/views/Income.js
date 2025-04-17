import { useState } from "react"
import ChartComponent from "../components/ChartComponent"
import "../stylesheets/Income.css"
import { Plus } from "lucide-react"

function Income() {
  const [income, setIncome] = useState([
    { category: "Salary", value: 2000.0, description: "Monthly salary", date: "Apr 15, 2025" },
    { category: "Government Benefit", value: 186.0, description: "Unemployment benefit", date: "Apr 10, 2025" },
    { category: "Investments", value: 540.0, description: "Stock dividends", date: "Apr 05, 2025" },
    { category: "Other", value: 73.0, description: "Freelance work", date: "Apr 01, 2025" },
    { category: "Salary", value: 2100.0, description: "Monthly salary", date: "Mar 15, 2025" },
    { category: "Other", value: 50.0, description: "Tutoring", date: "Mar 10, 2025" },
  ])

  const [newIncome, setNewIncome] = useState({
    amount: "",
    description: "",
    category: "",
    date: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewIncome(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddIncome = () => {
    const { amount, description, category, date } = newIncome
    const numericAmount = parseFloat(amount)

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

    setIncome(prev => [...prev, newEntry])

    setNewIncome({
      amount: "",
      description: "",
      category: "",
      date: "",
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
              {/* Amount with icon */}
              <div className="input-field">
                <label htmlFor="amount">Amount</label>
                <div className="input-with-icon">
                  <span className="input-icon">$</span>
                  <input
                    type="text"
                    id="amount"
                    name="amount"
                    placeholder="0.00"
                    value={newIncome.amount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Category */}
              <div className="input-field">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={newIncome.category}
                  onChange={handleInputChange}
                >
                  <option value="" disabled>Select</option>
                  <option value="Salary">Salary</option>
                  <option value="Government Benefit">Government Benefit</option>
                  <option value="Investments">Investments</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Date */}
              <div className="input-field">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={newIncome.date}
                  onChange={handleInputChange}
                />
              </div>

              {/* Add Button */}
              <div className="button-container">
                <button className="add-button" onClick={handleAddIncome}>
                  <Plus className="button-icon" />
                  Add Income
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="input-row description-row">
              <div className="input-field full-width">
                <label htmlFor="description">Description</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  placeholder="Description"
                  value={newIncome.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="income-grid">
        <div className="income-card">
          <h2 className="card-title">Income Chart</h2>
          <p className="card-description">Breakdown of your income sources</p>
          <ChartComponent data={income} type="income" />
        </div>

        <div className="income-card">
          <h2 className="card-title">Income Log</h2>
          <p className="card-description">Your recent income transactions</p>
          <div className="income-list">
            {income.map((entry, index) => (
              <div key={index} className="income-item">
                <div className="income-info">
                  <div className="income-icon">{getCategoryIcon(entry.category)}</div>
                  <div>
                    <div className="income-category">{entry.category}</div>
                    <div className="income-description">{entry.description}</div>
                  </div>
                </div>
                <div className="income-details">
                  <div className="income-amount">+${entry.value.toFixed(2)}</div>
                  <div className="income-date">{entry.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Income


