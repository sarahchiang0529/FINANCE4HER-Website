"use client"

import { useState } from "react"
import "../stylesheets/SavingGoal.css"
import { PiggyBank, Plus, Calendar, DollarSign, Pencil, Trash2, CheckCircle, Award, Car, Home, Smartphone, Briefcase, Gift, Plane, BookOpen, Coffee, Target, CheckSquare } from 'lucide-react'

function SavingGoals() {
  // State for goals
  const [goals, setGoals] = useState([
    {
      id: 1,
      name: "Emergency Fund",
      target: 1000,
      current: 750,
      deadline: "2025-08-15",
      category: "emergency",
      description: "3 months of expenses",
      completed: false,
    },
    {
      id: 2,
      name: "New Laptop",
      target: 1200,
      current: 600,
      deadline: "2025-10-01",
      category: "tech",
      description: "For school and projects",
      completed: false,
    },
    {
      id: 3,
      name: "Summer Vacation",
      target: 800,
      current: 200,
      deadline: "2025-06-30",
      category: "travel",
      description: "Trip with friends",
      completed: false,
    },
    {
      id: 4,
      name: "Concert Tickets",
      target: 150,
      current: 150,
      deadline: "2025-03-15",
      category: "entertainment",
      description: "Taylor Swift concert",
      completed: true,
    },
  ])

  // State for new goal form
  const [newGoal, setNewGoal] = useState({
    name: "",
    target: "",
    current: "0",
    deadline: "",
    category: "",
    description: "",
  })

  // State for editing and active tab
  const [editingGoalId, setEditingGoalId] = useState(null)
  const [activeTab, setActiveTab] = useState("Current Goals")

  // Handle input change for new goal form
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewGoal((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Add new goal
  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.target || !newGoal.deadline || !newGoal.category) {
      alert("Please fill in all required fields")
      return
    }

    const goalToAdd = {
      id: Date.now(),
      name: newGoal.name,
      target: Number.parseFloat(newGoal.target),
      current: Number.parseFloat(newGoal.current) || 0,
      deadline: newGoal.deadline,
      category: newGoal.category,
      description: newGoal.description,
      completed: false,
    }

    setGoals((prev) => [...prev, goalToAdd])

    // Reset form
    setNewGoal({
      name: "",
      target: "",
      current: "0",
      deadline: "",
      category: "",
      description: "",
    })

    // Switch to Current Goals tab if we're on Completed Goals
    if (activeTab === "Completed Goals") {
      setActiveTab("Current Goals")
    }
  }

  // Update goal progress
  const handleUpdateProgress = (id, amount) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === id) {
          const newCurrent = goal.current + Number.parseFloat(amount)
          const completed = newCurrent >= goal.target

          // If goal becomes completed and we're on Current Goals tab, switch to Completed Goals
          if (completed && !goal.completed && activeTab === "Current Goals") {
            setTimeout(() => setActiveTab("Completed Goals"), 500)
          }

          return {
            ...goal,
            current: completed ? goal.target : newCurrent,
            completed: completed,
          }
        }
        return goal
      }),
    )
  }

  // Delete goal
  const handleDeleteGoal = (id) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      setGoals((prev) => prev.filter((goal) => goal.id !== id))
    }
  }

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case "emergency":
        return <PiggyBank className="category-icon emergency" />
      case "tech":
        return <Smartphone className="category-icon tech" />
      case "travel":
        return <Plane className="category-icon travel" />
      case "education":
        return <BookOpen className="category-icon education" />
      case "entertainment":
        return <Coffee className="category-icon entertainment" />
      case "home":
        return <Home className="category-icon home" />
      case "car":
        return <Car className="category-icon car" />
      case "gift":
        return <Gift className="category-icon gift" />
      case "career":
        return <Briefcase className="category-icon career" />
      default:
        return <PiggyBank className="category-icon" />
    }
  }

  // Calculate days remaining
  const getDaysRemaining = (deadline) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Filter goals based on completion status
  const activeGoals = goals.filter((goal) => !goal.completed)
  const completedGoals = goals.filter((goal) => goal.completed)

  // Tab configuration
  const tabs = [
    { title: "Current Goals", icon: <Target size={20} /> },
    { title: "Completed Goals", icon: <CheckSquare size={20} /> },
  ]

  return (
    <div className="container">
      {/* Page header section - Using global styles */}
      <div className="page-header">
        <h1 className="page-title">Saving Goals</h1>
        <p className="page-subtitle">Set and track your financial targets</p>
      </div>

      {/* Add New Goal Card - Using global card styles */}
      <div className="income-card">
        <h2 className="form-title">Add New Goal</h2>
        <p className="form-subtitle">Create a new saving target to work towards</p>

        <div className="income-form">
          <div className="form-group">
            <div className="input-row">
              <div className="input-field">
                <label htmlFor="name">Goal Name*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="e.g. New Laptop"
                  value={newGoal.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="input-field">
                <label htmlFor="target">Target Amount*</label>
                <div className="input-with-icon">
                  <span className="input-icon">$</span>
                  <input
                    type="number"
                    id="target"
                    name="target"
                    placeholder="0.00"
                    value={newGoal.target}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="input-field">
                <label htmlFor="current">Starting Amount</label>
                <div className="input-with-icon">
                  <span className="input-icon">$</span>
                  <input
                    type="number"
                    id="current"
                    name="current"
                    placeholder="0.00"
                    value={newGoal.current}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="input-row">
              <div className="input-field">
                <label htmlFor="deadline">Target Date*</label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={newGoal.deadline}
                  onChange={handleInputChange}
                />
              </div>

              <div className="input-field">
                <label htmlFor="category">Category*</label>
                <select id="category" name="category" value={newGoal.category} onChange={handleInputChange}>
                  <option value="" disabled>
                    Select a category
                  </option>
                  <option value="emergency">Emergency Fund</option>
                  <option value="tech">Technology</option>
                  <option value="travel">Travel</option>
                  <option value="education">Education</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="home">Home</option>
                  <option value="car">Car</option>
                  <option value="gift">Gift</option>
                  <option value="career">Career</option>
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
                  placeholder="Brief description of your goal"
                  value={newGoal.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Current and Completed Goals */}
      <div className="tabs-container">
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.title}
              className={`tab ${activeTab === tab.title ? "active" : ""}`}
              onClick={() => setActiveTab(tab.title)}
            >
              {tab.icon}
              <span className="tab-label">{tab.title}</span>
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === "Current Goals" && (
            <div className="goals-grid">
              {activeGoals.length > 0 ? (
                activeGoals.map((goal) => {
                  const progressPercentage = Math.min(Math.round((goal.current / goal.target) * 100), 100)
                  const daysRemaining = getDaysRemaining(goal.deadline)

                  return (
                    <div className="goal-card" key={goal.id}>
                      <div className="goal-card-header">
                        <div className="goal-category">
                          {getCategoryIcon(goal.category)}
                          <span>{goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}</span>
                        </div>
                        <div className="goal-actions">
                          <button
                            className="icon-button"
                            onClick={() => setEditingGoalId(goal.id === editingGoalId ? null : goal.id)}
                          >
                            <Pencil className="btn-icon-sm" />
                          </button>
                          <button className="icon-button" onClick={() => handleDeleteGoal(goal.id)}>
                            <Trash2 className="btn-icon-sm" />
                          </button>
                        </div>
                      </div>

                      <h3 className="goal-title">{goal.name}</h3>
                      {goal.description && <p className="goal-description">{goal.description}</p>}

                      <div className="goal-progress-container">
                        <div className="goal-progress-bar">
                          <div className="goal-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                        <div className="goal-progress-text">{progressPercentage}% Complete</div>
                      </div>

                      <div className="goal-details">
                        <div className="goal-detail">
                          <DollarSign className="goal-detail-icon" />
                          <div>
                            <div className="goal-detail-label">Saved</div>
                            <div className="goal-detail-value">
                              ${goal.current.toFixed(2)} of ${goal.target.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div className="goal-detail">
                          <Calendar className="goal-detail-icon" />
                          <div>
                            <div className="goal-detail-label">Deadline</div>
                            <div className="goal-detail-value">{formatDate(goal.deadline)}</div>
                            <div className="goal-detail-subtext">{daysRemaining} days left</div>
                          </div>
                        </div>
                      </div>

                      {editingGoalId === goal.id && (
                        <div className="goal-update-form">
                          <div className="input-with-icon">
                            <span className="input-icon">$</span>
                            <input
                              type="number"
                              placeholder="Amount"
                              id={`update-${goal.id}`}
                              className="goal-update-input"
                            />
                          </div>
                          <button
                            className="btn-primary btn-sm"
                            onClick={() => {
                              const amount = document.getElementById(`update-${goal.id}`).value
                              if (amount && !isNaN(Number.parseFloat(amount))) {
                                handleUpdateProgress(goal.id, Number.parseFloat(amount))
                                setEditingGoalId(null)
                              } else {
                                alert("Please enter a valid amount")
                              }
                            }}
                          >
                            Update Progress
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="no-goals-message">
                  <PiggyBank className="no-goals-icon" />
                  <p>You don't have any active saving goals yet.</p>
                  <p>Add your first goal above to start tracking your progress!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "Completed Goals" && (
            <div className="goals-grid">
              {completedGoals.length > 0 ? (
                completedGoals.map((goal) => (
                  <div className="goal-card completed" key={goal.id}>
                    <div className="goal-card-header">
                      <div className="goal-category">
                        {getCategoryIcon(goal.category)}
                        <span>{goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}</span>
                      </div>
                      <div className="goal-actions">
                        <button className="icon-button" onClick={() => handleDeleteGoal(goal.id)}>
                          <Trash2 className="btn-icon-sm" />
                        </button>
                      </div>
                    </div>

                    <h3 className="goal-title">{goal.name}</h3>
                    {goal.description && <p className="goal-description">{goal.description}</p>}

                    <div className="goal-progress-container">
                      <div className="goal-progress-bar">
                        <div className="goal-progress-fill completed" style={{ width: "100%" }}></div>
                      </div>
                      <div className="goal-progress-text">100% Complete</div>
                    </div>

                    <div className="goal-details">
                      <div className="goal-detail">
                        <DollarSign className="goal-detail-icon" />
                        <div>
                          <div className="goal-detail-label">Saved</div>
                          <div className="goal-detail-value">${goal.target.toFixed(2)}</div>
                        </div>
                      </div>

                      <div className="goal-detail">
                        <Award className="goal-detail-icon" />
                        <div>
                          <div className="goal-detail-label">Achievement</div>
                          <div className="goal-detail-value">Goal Reached!</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-goals-message">
                  <Award className="no-goals-icon" />
                  <p>You haven't completed any goals yet.</p>
                  <p>Keep working on your current goals to see them here!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SavingGoals