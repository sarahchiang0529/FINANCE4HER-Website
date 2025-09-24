import { useState, useEffect, useMemo } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "./SavingGoal.css";
import { Plus, Target, CheckCircle, Edit, Trash2, DollarSign, Calendar } from "lucide-react";
import EmptyState from "../../components/EmptyState";

// ---- API helper (dev: hard-code your backend port) ----
const BASE_URL = "http://localhost:4000";

async function api(path, { method = "GET", body, token } = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");

  if (!res.ok) {
    const msg = isJson ? await res.json().catch(() => ({})) : await res.text();
    const text = isJson ? (msg.error || msg.message || JSON.stringify(msg)) : String(msg);
    throw new Error(`HTTP ${res.status} ${url} → ${text.slice(0, 400)}`);
  }
  return isJson ? res.json() : res.text();
}

// category icons just for UI
const categoryIcon = (cName) =>
  cName === "Emergency" ? "🚨" :
  cName === "Tech"      ? "💻" :
  cName === "Travel"    ? "✈️" :
  cName === "Home"      ? "🏠" :
  cName === "Education" ? "📚" : "💲";

function SavingGoal() {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const [activeTab, setActiveTab] = useState("current"); // "current" | "completed"
  const [goals, setGoals] = useState([]);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // categories: [{id, name}]
  const [categories, setCategories] = useState([]);

  // form state
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
    categoryId: "",     // ← store ID for saving
    description: "",
  });

  // ---------- Load categories & goals ----------
  useEffect(() => {
    (async () => {
      if (!isAuthenticated || !user) return;
      const token = await getAccessTokenSilently().catch(() => null);

      // 1) Load categories (must return at least id & name)
      //    Adjust endpoint if yours is different (e.g., /api/admin/categories or /api/users/:id/categories)
      const cats = await api(`/api/admin/categories`, { token });
      // normalize shape
      const normalizedCats = (Array.isArray(cats) ? cats : []).map(c => ({
        id: c.id ?? c.category_id ?? c.uuid ?? c.value,
        name: c.name ?? c.label ?? c.category_name ?? String(c.id ?? ""),
      })).filter(c => c.id && c.name);
      setCategories(normalizedCats);

      // 2) Load goals
      const rows = await api(`/api/users/${user.sub}/savings-goals`, { token });
      const mapped = rows.map((r) => {
        // Try to pull both the FK id and a displayable name from whatever your API returns
        const catId =
          r.category_id ??
          r.categoryId ??
          r.category?.id ??
          r.categories?.id ??
          null;

        const catNameRaw =
          r.category?.name ??
          r.categories?.name ??
          r.category_name ??
          r.category ?? // sometimes APIs send the label directly
          null;

        // If we only have catId, try to resolve the name from loaded categories
        const resolvedName = catNameRaw || normalizedCats.find(c => String(c.id) === String(catId))?.name || "(Unknown)";

        return {
          id: r.id,
          name: r.name ?? r.goal_name ?? "",
          targetAmount: Number(r.target_amount ?? r.targetAmount ?? 0),
          currentAmount: Number(r.current_amount ?? r.currentAmount ?? 0),
          targetDate: r.target_date ?? r.targetDate ?? "",
          description: r.description ?? "",
          completed: Boolean(r.completed ?? false),
          categoryId: catId,          // keep the FK id for updates
          categoryName: resolvedName, // keep a friendly name for UI
        };
      });

      mapped.sort((a, b) => new Date(b.targetDate) - new Date(a.targetDate));
      setGoals(mapped);
    })().catch((e) => {
      console.error("Failed to load saving goals:", e);
      alert(e.message || "Failed to load saving goals");
    });
  }, [isAuthenticated, user, getAccessTokenSilently]);

  // ---------- Derived ----------
  const filteredGoals = useMemo(
    () => goals.filter((g) => (activeTab === "current" ? !g.completed : g.completed)),
    [goals, activeTab]
  );
  const hasGoals = filteredGoals.length > 0;

  const calculateProgress = (current, target) => {
    const t = Number(target) || 0;
    if (t <= 0) return 0;
    const pct = (Number(current) || 0) / t * 100;
    return Math.min(Math.max(pct, 0), 100);
  };

  // helper to resolve name by id for display
  const nameForCategoryId = (id) => {
    if (!id) return "(Unknown)";
    return categories.find(c => String(c.id) === String(id))?.name ?? "(Unknown)";
  };

  // ---------- Form handlers ----------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGoal((prev) => ({ ...prev, [name]: value }));
  };

  const startEditGoal = (goal) => {
    setEditingGoal({
      ...goal,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
    });
  };
  const cancelEditGoal = () => setEditingGoal(null);

  // ---------- Create ----------
  const handleAddGoal = async () => {
    const {
      name: goal_name,
      targetAmount: target_amount,
      currentAmount: current_amount,
      targetDate: target_date,
      categoryId, // ← use id
      description
    } = newGoal;

    if (!goal_name || !target_amount || !target_date || !categoryId || !description) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const token = await getAccessTokenSilently().catch(() => null);

      const created = await api(`/api/users/${user.sub}/savings-goals`, {
        method: "POST",
        token,
        body: {
          goal_name: goal_name, // backend requires goal_name
          target_amount: Number.parseFloat(target_amount),
          current_amount: current_amount ? Number.parseFloat(current_amount) : 0,
          target_date: target_date,
          description,
          category_id: categoryId, // ← send FK id
          completed: false,
        },
      });

      const createdCatId =
        created.category_id ??
        created.categoryId ??
        created.category?.id ??
        created.categories?.id ??
        categoryId;

      const createdCatName =
        created.category?.name ??
        created.categories?.name ??
        nameForCategoryId(createdCatId);

      const uiRow = {
        id: created.id,
        name: created.name ?? created.goal_name ?? goal_name,
        targetAmount: Number(created.target_amount ?? created.targetAmount ?? target_amount),
        currentAmount: Number((created.current_amount ?? created.currentAmount ?? current_amount) ?? 0),
        targetDate: created.target_date ?? created.targetDate ?? target_date,
        description: created.description ?? description,
        completed: Boolean(created.completed ?? false),
        categoryId: createdCatId,
        categoryName: createdCatName,
      };

      setGoals((prev) => [uiRow, ...prev]);
      setNewGoal({ name: "", targetAmount: "", currentAmount: "", targetDate: "", categoryId: "", description: "" });
      console.log(categoryId);
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to add saving goal");
    }
  };

  // ---------- Update ----------
  const saveEditGoal = async () => {
    if (!editingGoal) return;

    const { name, targetAmount, currentAmount, targetDate, categoryId, description, completed } = editingGoal;
    if (!name || !targetAmount || !targetDate || !categoryId || !description) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const token = await getAccessTokenSilently().catch(() => null);

      const updated = await api(`/api/users/${user.sub}/savings-goals/${editingGoal.id}`, {
        method: "PUT",
        token,
        body: {
          goal_name: name,
          target_amount: Number.parseFloat(targetAmount),
          current_amount: currentAmount ? Number.parseFloat(currentAmount) : 0,
          target_date: targetDate,
          description,
          category_id: categoryId, // ← send FK id
          completed: Boolean(completed),
        },
      });

      const updatedCatId =
        updated.category_id ??
        updated.categoryId ??
        updated.category?.id ??
        updated.categories?.id ??
        categoryId;

      const updatedCatName =
        updated.category?.name ??
        updated.categories?.name ??
        nameForCategoryId(updatedCatId);

      setGoals((list) =>
        list.map((g) =>
          g.id === updated.id
            ? {
                id: updated.id,
                name: updated.name ?? updated.goal_name ?? name,
                targetAmount: Number(updated.target_amount ?? updated.targetAmount ?? targetAmount),
                currentAmount: Number((updated.current_amount ?? updated.currentAmount ?? currentAmount) ?? 0),
                targetDate: updated.target_date ?? updated.targetDate ?? targetDate,
                description: updated.description ?? description,
                completed: Boolean(updated.completed ?? completed),
                categoryId: updatedCatId,
                categoryName: updatedCatName,
              }
            : g
        )
      );
      setEditingGoal(null);
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to update saving goal");
    }
  };

  // ---------- Delete ----------
  const confirmDeleteGoal = (goalId) => setShowDeleteConfirm(goalId);
  const cancelDeleteGoal = () => setShowDeleteConfirm(null);

  const deleteGoal = async (goalId) => {
    try {
      const token = await getAccessTokenSilently().catch(() => null);
      await api(`/api/users/${user.sub}/savings-goals/${goalId}`, { method: "DELETE", token });
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      setShowDeleteConfirm(null);
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to delete saving goal");
    }
  };

  // ---------- Toggle completion ----------
  const toggleGoalCompletion = async (goal) => {
    try {
      const token = await getAccessTokenSilently().catch(() => null);
      const updated = await api(`/api/users/${user.sub}/savings-goals/${goal.id}`, {
        method: "PUT",
        token,
        body: { completed: !goal.completed },
      });
      setGoals((list) =>
        list.map((g) =>
          g.id === goal.id ? { ...g, completed: Boolean(updated.completed) } : g
        )
      );
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to toggle completion");
    }
  };

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Saving Goals</h1>
        <p className="page-subtitle">Set and track your financial targets</p>
      </div>

      {/* Add goal form */}
      <div className="goal-card">
        <h2 className="form-title">Add New Goal</h2>
        <p className="form-subtitle">Create a new saving target to work towards</p>
        <div className="goal-form">
          <div className="form-group">
            <div className="input-row">
              <div className="input-field">
                <label htmlFor="name">Goal Name</label>
                <input id="name" name="name" value={newGoal.name} onChange={handleInputChange} placeholder="Goal" required />
              </div>

              <div className="input-field">
                <label htmlFor="targetAmount">Target Amount</label>
                <div className="input-with-icon">
                  <div className="input-icon">$</div>
                  <input id="targetAmount" name="targetAmount" value={newGoal.targetAmount} onChange={handleInputChange} placeholder="0.00" required />
                </div>
              </div>

              <div className="input-field">
                <label htmlFor="currentAmount">Starting Amount</label>
                <div className="input-with-icon">
                  <div className="input-icon">$</div>
                  <input id="currentAmount" name="currentAmount" value={newGoal.currentAmount} onChange={handleInputChange} placeholder="0.00" />
                </div>
              </div>
            </div>

            <div className="input-row">
              <div className="input-field">
                <label htmlFor="targetDate">Target Date</label>
                <input id="targetDate" name="targetDate" type="date" value={newGoal.targetDate} onChange={handleInputChange} required />
              </div>

              <div className="input-field">
                <label htmlFor="categoryId">Category</label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={newGoal.categoryId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-field">
                <label>&nbsp;</label>
                <button className="btn-primary" onClick={handleAddGoal}>
                  <Plus className="btn-icon" /> Add Goal
                </button>
              </div>
            </div>

            <div className="input-row">
              <div className="input-field full-width">
                <label htmlFor="description">Description</label>
                <input id="description" name="description" value={newGoal.description} onChange={handleInputChange} placeholder="Description" required />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <div className={`tab ${activeTab === "current" ? "active" : ""}`} onClick={() => setActiveTab("current")}>
            <Target size={16} /> <span className="tab-label">Current Goals</span>
          </div>
          <div className={`tab ${activeTab === "completed" ? "active" : ""}`} onClick={() => setActiveTab("completed")}>
            <CheckCircle size={16} /> <span className="tab-label">Completed Goals</span>
          </div>
        </div>

        <div className="tab-content">
          {!hasGoals ? (
            <div className="goal-card" style={{ marginTop: 32 }}>
              <EmptyState
                title={`No ${activeTab} goals found`}
                message="Start by adding a new goal using the form above. Your goal will appear here."
                icon={<Target size={48} className="text-[#8a4baf]" />}
              />
            </div>
          ) : (
            <div className="goals-grid">
              {filteredGoals.map((goal) => {
                const displayName = goal.categoryName || nameForCategoryId(goal.categoryId);
                return (
                  <div key={goal.id} className="goal-card">
                    {/* Delete confirm overlay */}
                    {showDeleteConfirm === goal.id && (
                      <div className="delete-confirm-overlay">
                        <div className="delete-confirm-modal">
                          <h3>Delete Goal</h3>
                          <p>Are you sure you want to delete "{goal.name}"?</p>
                          <div className="delete-confirm-actions">
                            <button className="btn-secondary" onClick={cancelDeleteGoal}>Cancel</button>
                            <button className="btn-danger" onClick={() => deleteGoal(goal.id)}>Delete</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Edit mode */}
                    {editingGoal && editingGoal.id === goal.id ? (
                      <div className="edit-transaction-form">
                        <div className="edit-form-row">
                          <div className="edit-field">
                            <label>Goal Name</label>
                            <input value={editingGoal.name} onChange={(e) => setEditingGoal({ ...editingGoal, name: e.target.value })} />
                          </div>
                        </div>

                        <div className="edit-form-row">
                          <div className="edit-field">
                            <label>Category</label>
                            <select
                              value={editingGoal.categoryId || ""}
                              onChange={(e) => setEditingGoal({ ...editingGoal, categoryId: e.target.value, categoryName: nameForCategoryId(e.target.value) })}
                            >
                              {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="edit-field">
                            <label>Target Amount</label>
                            <div className="input-with-icon">
                              <div className="input-icon">$</div>
                              <input
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
                              onChange={(e) => setEditingGoal({ ...editingGoal, targetDate: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="edit-form-row">
                          <div className="edit-field">
                            <label>Description</label>
                            <input
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
                                onChange={(e) => setEditingGoal({ ...editingGoal, completed: e.target.checked })}
                              />
                              <label htmlFor={`edit-completed-${goal.id}`} className="checkbox-label">Mark as completed</label>
                            </div>
                          </div>
                        </div>

                        <div className="edit-actions">
                          <button className="btn-secondary" onClick={cancelEditGoal}>Cancel</button>
                          <button className="btn-primary" onClick={saveEditGoal}>Save</button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div className="goal-content">
                        <div className="goal-info-container">
                          <div className="goal-card-header">
                            <div className="goal-category">
                              <span className="category-icon">{categoryIcon(displayName)}</span>
                              <span>{displayName}</span>
                            </div>
                            <div className="goal-actions">
                              <button className="icon-button" onClick={() => startEditGoal(goal)}><Edit size={16} /></button>
                              <button className="icon-button" onClick={() => confirmDeleteGoal(goal.id)}><Trash2 size={16} /></button>
                            </div>
                          </div>

                          <h3 className="goal-title">{goal.name}</h3>
                          <p className="goal-description">{goal.description}</p>

                          <div className="goal-progress-container">
                            <div className="goal-progress-bar">
                              <div
                                className={`goal-progress-fill ${goal.completed ? "completed" : ""}`}
                                style={{ width: `${calculateProgress(goal.currentAmount, goal.targetAmount)}%` }}
                              />
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
                                <div className="goal-detail-value">{fmtDate(goal.targetDate)}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="goal-completion-toggle">
                          <button
                            className={`btn-toggle-completion ${goal.completed ? "completed" : ""}`}
                            onClick={() => toggleGoalCompletion(goal)}
                          >
                            {goal.completed ? "Mark as In Progress" : "Mark as Completed"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SavingGoal;
