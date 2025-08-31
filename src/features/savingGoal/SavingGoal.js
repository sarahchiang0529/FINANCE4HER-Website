import { useState, useEffect } from "react"
import "./SavingGoal.css"
import { Plus, Target, CheckCircle, Edit, Trash2, DollarSign, Calendar } from "lucide-react"
import EmptyState from "../../components/EmptyState"

function SavingGoal() {
  const [activeTab, setActiveTab] = useState("current")
  const [goals, setGoals] = useState([])

  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
    category: "",
    description: "",
  })

  // State for editing goals
  const [editingGoal, setEditingGoal] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  useEffect(() => {
    // Load goals from localStorage when component mounts
    const storedGoals = localStorage.getItem("savingGoals")
    if (storedGoals) {
      try {
        setGoals(JSON.parse(storedGoals))
      } catch (error) {
        console.error("Error parsing goals from localStorage:", error)
      }
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewGoal((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    setEditingGoal((prev) => ({
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

    const updatedGoals = [...goals, newGoalObj]
    setGoals(updatedGoals)

    // Save to localStorage
    localStorage.setItem("savingGoals", JSON.stringify(updatedGoals))

    setNewGoal({
      name: "",
      targetAmount: "",
      currentAmount: "",
      targetDate: "",
      category: "",
      description: "",
    })
  }

  // Function to start editing a goal
  const startEditGoal = (goal) => {
    setEditingGoal({
      ...goal,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
    })
  }

  // Function to cancel editing
  const cancelEditGoal = () => {
    setEditingGoal(null)
  }

  const saveEditGoal = () => {
    if (
      !editingGoal.name ||
      !editingGoal.targetAmount ||
      !editingGoal.targetDate ||
      !editingGoal.category ||
      !editingGoal.description
    ) {
      alert("Please fill in all required fields.")
      return
    }

    const updatedGoal = {
      ...editingGoal,
      targetAmount: Number.parseFloat(editingGoal.targetAmount),
      currentAmount: editingGoal.currentAmount ? Number.parseFloat(editingGoal.currentAmount) : 0,
    }

    const updatedGoals = goals.map((goal) => (goal.id === updatedGoal.id ? updatedGoal : goal))
    setGoals(updatedGoals)

    // Save to localStorage
    localStorage.setItem("savingGoals", JSON.stringify(updatedGoals))

    setEditingGoal(null)
  }

  // Function to confirm deletion
  const confirmDeleteGoal = (goalId) => {
    setShowDeleteConfirm(goalId)
  }

  // Function to cancel deletion
  const cancelDeleteGoal = () => {
    setShowDeleteConfirm(null)
  }

  const deleteGoal = (goalId) => {
    const updatedGoals = goals.filter((goal) => goal.id !== goalId)
    setGoals(updatedGoals)

    // Save to localStorage
    localStorage.setItem("savingGoals", JSON.stringify(updatedGoals))

    setShowDeleteConfirm(null)
  }

  // Function to toggle goal completion status
  const toggleGoalCompletion = (goalId) => {
    const updatedGoals = goals.map((goal) => (goal.id === goalId ? { ...goal, completed: !goal.completed } : goal))
    setGoals(updatedGoals)

    // Save to localStorage
    localStorage.setItem("savingGoals", JSON.stringify(updatedGoals))
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

  // Calculate progress percentage correctly
  const calculateProgress = (current, target) => {
    if (target <= 0) return 0
    const percentage = (current / target) * 100
    return Math.min(percentage, 100) // Cap at 100%
  }

  const filteredGoals = goals.filter((goal) => (activeTab === "current" ? !goal.completed : goal.completed))
  const hasGoals = filteredGoals.length > 0

  return (
    <div className="goals-container">
      {/* Header Section */}
      <div className="page-header">
        <h1 className="page-title">Saving Goals</h1>
        <p className="page-subtitle">Set and track your financial targets</p>
      </div>

      {/* Add Expense Form Section */}
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
          {!hasGoals ? (
            <div className="goal-card" style={{ marginTop: "32px" }}>
              <EmptyState
                title={`No ${activeTab} goals found`}
                message="Start by adding a new goal using the form above. Your goal will appear here."
                icon={<Target size={48} className="text-[#8a4baf]" />}
              />
            </div>
          ) : (
            <div className="goals-grid">
              {filteredGoals.map((goal) => (
                <div key={goal.id} className="card goal-card">
                  {/* Show delete confirmation if this goal is being deleted */}
                  {showDeleteConfirm === goal.id && (
                    <div className="delete-confirm-overlay">
                      <div className="delete-confirm-modal">
                        <h3>Delete Goal</h3>
                        <p>Are you sure you want to delete "{goal.name}"?</p>
                        <div className="delete-confirm-actions">
                          <button className="btn-secondary" onClick={cancelDeleteGoal}>
                            Cancel
                          </button>
                          <button className="btn-danger" onClick={() => deleteGoal(goal.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show edit form if this goal is being edited */}
                  {editingGoal && editingGoal.id === goal.id ? (
                    <div className="edit-transaction-form">
                      <div className="edit-form-row">
                        <div className="edit-field">
                          <label>Goal Name</label>
                          <input
                            type="text"
                            value={editingGoal.name}
                            onChange={(e) => setEditingGoal({ ...editingGoal, name: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="edit-form-row">
                        <div className="edit-field">
                          <label>Category</label>
                          <select
                            value={editingGoal.category}
                            onChange={(e) => setEditingGoal({ ...editingGoal, category: e.target.value })}
                          >
                            <option value="Emergency">Emergency</option>
                            <option value="Tech">Tech</option>
                            <option value="Travel">Travel</option>
                            <option value="Home">Home</option>
                            <option value="Education">Education</option>
                          </select>
                        </div>
                        <div className="edit-field">
                          <label>Target Amount</label>
                          <div className="input-with-icon">
                            <div className="input-icon">$</div>
                            <input
                              type="text"
                              value={editingGoal.targetAmount}
                              onChange={(e) => setEditingGoal({ ...editingGoal, targetAmount: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="edit-form-row">
                        <div className="edit-field">
                          <label>Current Amount</label>
                          <div className="input-with-icon">
                            <div className="input-icon">$</div>
                            <input
                              type="text"
                              value={editingGoal.currentAmount}
                              onChange={(e) => setEditingGoal({ ...editingGoal, currentAmount: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="edit-field">
                          <label>Target Date</label>
                          <input
                            type="date"
                            value={editingGoal.targetDate}
                            onChange={(e) => setEditingGoal({ ...editingGoal, date: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="edit-form-row">
                        <div className="edit-field">
                          <label>Description</label>
                          <input
                            type="text"
                            value={editingGoal.description}
                            onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="edit-form-row">
                        <div className="edit-field">
                          <div className="checkbox-field">
                            <input
                              type="checkbox"
                              id={`edit-completed-${goal.id}`}
                              checked={editingGoal.completed}
                              onChange={(e) =>
                                setEditingGoal({
                                  ...editingGoal,
                                  completed: e.target.checked,
                                })
                              }
                            />
                            <label htmlFor={`edit-completed-${goal.id}`} className="checkbox-label">
                              Mark as completed
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="edit-actions">
                        <button className="btn-secondary" onClick={cancelEditGoal}>
                          Cancel
                        </button>
                        <button className="btn-primary" onClick={saveEditGoal}>
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="goal-content">
                      <div className="goal-info-container">
                        <div className="goal-card-header">
                          <div className="goal-category">
                            <span className="category-icon">{getCategoryIcon(goal.category)}</span>
                            <span>{goal.category}</span>
                          </div>
                          <div className="goal-actions">
                            <button className="icon-button" onClick={() => startEditGoal(goal)}>
                              <Edit size={16} />
                            </button>
                            <button className="icon-button" onClick={() => confirmDeleteGoal(goal.id)}>
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
                                width: `${calculateProgress(goal.currentAmount, goal.targetAmount)}%`,
                              }}
                            ></div>
                          </div>
                          <div className="goal-progress-text">
                            {calculateProgress(goal.currentAmount, goal.targetAmount).toFixed(0)}% complete
                          </div>
                        </div>

                        <div className="goal-details">
                          <div className="goal-detail">
                            <DollarSign className="goal-detail-icon" />
                            <div>
                              <div className="goal-detail-label">Saved</div>
                              <div className="goal-detail-value amount-container">
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

                      {/* Add toggle completion button */}
                      <div className="goal-completion-toggle">
                        <button
                          className={`btn-toggle-completion ${goal.completed ? "completed" : ""}`}
                          onClick={() => toggleGoalCompletion(goal.id)}
                        >
                          {goal.completed ? "Mark as In Progress" : "Mark as Completed"}
                        </button>
                      </div>
                    </div>
                  )}
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