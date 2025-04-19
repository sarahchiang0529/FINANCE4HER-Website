"use client"

import { useState } from "react"
import "../stylesheets/SavingGoal.css"
import { Plus, Target, Calendar, DollarSign, Edit, Trash2, CheckCircle } from "lucide-react"

function SavingGoal() {
  const [activeTab, setActiveTab] = useState("current")
  const [goals, setGoals] = useState([
    {
      id: 1,
      name: "Emergency Fund",
      category: "Emergency",
      targetAmount: 5000,
      currentAmount: 2500,
      targetDate: "2025-12-31",
      description: "Emergency fund for unexpected expenses",
      completed: false,
    },
    {
      id: 2,
      name: "New Laptop",
      category: "Tech",
      targetAmount: 1500,
      currentAmount: 500,
      targetDate: "2025-08-15",
      description: "Save for a new MacBook Pro",
      completed: false,
    },
    {
      id: 3,
      name: "Summer Vacation",
      category: "Travel",
      targetAmount: 3000,
      currentAmount: 1200,
      targetDate: "2025-06-01",
      description: "Trip to Hawaii",
      completed: false,
    },
    {
      id: 4,
      name: "Home Renovation",
      category: "Home",
      targetAmount: 10000,
      currentAmount: 10000,
      targetDate: "2025-01-15",
      description: "Kitchen remodel",
      completed: true,
    },
  ])

  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
    category: "",
    description: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewGoal((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddGoal = () => {
    const { name, targetAmount, currentAmount, targetDate, category, description } = newGoal

    if (!name || !targetAmount || !targetDate || !category || !description) {
      alert("Please fill in all required fields.")
      return
    }

    const newGoalObj = {
      id: Date.now(),
      name,
      category,
      targetAmount: Number.parseFloat(targetAmount),
      currentAmount: currentAmount ? Number.parseFloat(currentAmount) : 0,
      targetDate,
      description,
      completed: false,
    }

    setGoals((prev) => [...prev, newGoalObj])

    setNewGoal({
      name: "",
      targetAmount: "",
      currentAmount: "",
      targetDate: "",
      category: "",
      description: "",
    })
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Emergency":
        return <div>🚨</div>
      case "Tech":
        return <div>💻</div>
      case "Travel":
        return <div>✈️</div>
      case "Home":
        return <div>🏠</div>
      case "Education":
        return <div>📚</div>
      default:
        return <div>💲</div>
    }
  }

  const filteredGoals = goals.filter((goal) => (activeTab === "current" ? !goal.completed : goal.completed))

  return (
    <div className="goals-container">
      <div className="page-header">
        <h1 className="page-title">Saving Goals</h1>
        <p className="page-subtitle">Set and track your financial targets</p>
      </div>

      <div className="goal-card">
        <h2 className="form-title">Add New Goal</h2>
        <p className="form-subtitle">Create a new saving target to work towards</p>
        <div className="goal-form">
          <div className="form-group">
            <div className="input-row">
              <div className="input-field">
                <label htmlFor="name">Goal Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Goal"
                  value={newGoal.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="input-field">
                <label htmlFor="targetAmount">Target Amount</label>
                <div className="input-with-icon">
                  <div className="input-icon">$</div>
                  <input
                    type="text"
                    id="targetAmount"
                    name="targetAmount"
                    placeholder="0.00"
                    value={newGoal.targetAmount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="input-field">
                <label htmlFor="currentAmount">Starting Amount</label>
                <div className="input-with-icon">
                  <div className="input-icon">$</div>
                  <input
                    type="text"
                    id="currentAmount"
                    name="currentAmount"
                    placeholder="0.00"
                    value={newGoal.currentAmount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="input-row">
              <div className="input-field">
                <label htmlFor="targetDate">Target Date</label>
                <input
                  type="date"
                  id="targetDate"
                  name="targetDate"
                  value={newGoal.targetDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="input-field">
                <label htmlFor="category">Category</label>
                <select id="category" name="category" value={newGoal.category} onChange={handleInputChange} required>
                  <option value="" disabled>
                    Select a category
                  </option>
                  <option value="Emergency">Emergency</option>
                  <option value="Tech">Tech</option>
                  <option value="Travel">Travel</option>
                  <option value="Home">Home</option>
                  <option value="Education">Education</option>
                </select>
              </div>

              <div className="input-field">
                <label>&nbsp;</label>
                <button className="btn-primary" onClick={handleAddGoal}>
                  <Plus className="btn-icon" />
                  Add Goal
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
                  value={newGoal.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <div className={`tab ${activeTab === "current" ? "active" : ""}`} onClick={() => setActiveTab("current")}>
            <Target size={16} />
            <span className="tab-label">Current Goals</span>
          </div>
          <div className={`tab ${activeTab === "completed" ? "active" : ""}`} onClick={() => setActiveTab("completed")}>
            <CheckCircle size={16} />
            <span className="tab-label">Completed Goals</span>
          </div>
        </div>

        <div className="tab-content">
          {filteredGoals.length === 0 ? (
            <div className="no-goals-message">
              <Target className="no-goals-icon" />
              <p>No {activeTab} goals found. Start by adding a new goal above!</p>
            </div>
          ) : (
            <div className="goals-grid">
              {filteredGoals.map((goal) => (
                <div key={goal.id} className="goal-card">
                  <div className="goal-card-header">
                    <div className="goal-category">
                      <span className="category-icon">{getCategoryIcon(goal.category)}</span>
                      <span>{goal.category}</span>
                    </div>
                    <div className="goal-actions">
                      <button className="icon-button">
                        <Edit size={16} />
                      </button>
                      <button className="icon-button">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="goal-title">{goal.name}</h3>
                  <p className="goal-description">{goal.description}</p>

                  <div className="goal-progress-container">
                    <div className="goal-progress-bar">
                      <div
                        className={`goal-progress-fill ${goal.completed ? "completed" : ""}`}
                        style={{
                          width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="goal-progress-text">
                      {((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)}% complete
                    </div>
                  </div>

                  <div className="goal-details">
                    <div className="goal-detail">
                      <DollarSign className="goal-detail-icon" />
                      <div>
                        <div className="goal-detail-label">Saved</div>
                        <div className="goal-detail-value">
                          ${goal.currentAmount.toFixed(2)} of ${goal.targetAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="goal-detail">
                      <Calendar className="goal-detail-icon" />
                      <div>
                        <div className="goal-detail-label">Target Date</div>
                        <div className="goal-detail-value">
                          {new Date(goal.targetDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SavingGoal