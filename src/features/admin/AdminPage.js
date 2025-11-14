import React, { useEffect, useState } from 'react'

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('claims')

  const [pendingClaims, setPendingClaims] = useState([])
  const [goals, setGoals] = useState([])
  const [incomes, setIncomes] = useState([])
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])

  const [newCategory, setNewCategory] = useState('')
  const [note, setNote] = useState('')

  const fetchJSON = async (path, init) => {
    const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...init })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  const refresh = async () => {
    setLoading(true)
    try {
      const [claims, goalsData, incomesData, expensesData, categoriesData] = await Promise.all([
        fetchJSON('/api/admin/savings-goal-claims/pending'),
        fetchJSON('/api/admin/savings-goals'),
        fetchJSON('/api/admin/incomes'),
        fetchJSON('/api/admin/expenses'),
        fetchJSON('/api/admin/categories'),
      ])
      setPendingClaims(claims)
      setGoals(goalsData)
      setIncomes(incomesData)
      setExpenses(expensesData)
      setCategories(categoriesData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const approve = async (id) => {
    const body = JSON.stringify({ note })
    await fetchJSON(`/api/admin/savings-goal-claims/${id}/approve`, { method: 'POST', body })
    setNote('')
    await refresh()
  }

  const rejectClaim = async (id) => {
    const body = JSON.stringify({ note })
    await fetchJSON(`/api/admin/savings-goal-claims/${id}/reject`, { method: 'POST', body })
    setNote('')
    await refresh()
  }

  const createCategory = async () => {
    if (!newCategory.trim()) return
    await fetchJSON('/api/admin/categories', { method: 'POST', body: JSON.stringify({ name: newCategory.trim() }) })
    setNewCategory('')
    await refresh()
  }

  const renameCategory = async (id, name) => {
    await fetchJSON(`/api/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify({ name }) })
    await refresh()
  }

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return
    await fetchJSON(`/api/admin/categories/${id}`, { method: 'DELETE' })
    await refresh()
  }

  const currency = (n) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n)

  const PendingClaimsTable = () => (
    <div className="overflow-x-auto">
      <div className="mb-3 flex items-center gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional reviewer note (applies to next action)"
          className="border rounded px-3 py-2 w-full max-w-xl"
        />
        <button onClick={refresh} className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200">Refresh</button>
      </div>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-3">Goal</th>
            <th className="py-2 pr-3">User</th>
            <th className="py-2 pr-3">Progress</th>
            <th className="py-2 pr-3">Claimed</th>
            <th className="py-2 pr-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingClaims.length === 0 && (
            <tr><td className="py-4 text-gray-500" colSpan={5}>No pending claims 🎉</td></tr>
          )}
          {pendingClaims.map((g) => (
            <tr key={g.id} className="border-b align-top">
              <td className="py-2 pr-3">
                <div className="font-medium">{g.goal_name}</div>
                <div className="text-xs text-gray-500">#{g.id}</div>
                {g.description && <div className="text-xs text-gray-600 mt-1">{g.description}</div>}
              </td>
              <td className="py-2 pr-3">
                <div className="text-xs">{g.user_id}</div>
              </td>
              <td className="py-2 pr-3">
                <div>{currency(g.current_amount)} / {currency(g.target_amount)}</div>
                {g.target_date && <div className="text-xs text-gray-500">Target: {new Date(g.target_date).toLocaleDateString()}</div>}
              </td>
              <td className="py-2 pr-3">
                <div className="text-xs">{g.completion_claimed_at ? new Date(g.completion_claimed_at).toLocaleString() : '—'}</div>
              </td>
              <td className="py-2 pr-3">
                <div className="flex gap-2">
                  <button onClick={() => approve(g.id)} className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700">Approve</button>
                  <button onClick={() => rejectClaim(g.id)} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Reject</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const SimpleTable = ({ rows, columns }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            {columns.map((c) => (
              <th key={c.key} className="py-2 pr-3">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b">
              {columns.map((c) => (
                <td key={c.key} className="py-2 pr-3">{c.render ? c.render(r[c.key], r) : String(r[c.key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const CategoryManager = () => (
    <div>
      <div className="mb-3 flex gap-2">
        <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New category name" className="border rounded px-3 py-2" />
        <button onClick={createCategory} className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Add</button>
      </div>
      <ul className="space-y-2">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-2">
            <input
              defaultValue={c.name}
              onBlur={(e) => renameCategory(c.id, e.target.value)}
              className="border rounded px-2 py-1"
            />
            <button onClick={() => deleteCategory(c.id)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      <div className="flex gap-2">
        {['claims','categories','goals','incomes','expenses'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 rounded ${tab===t ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            {t === 'claims' ? 'Pending Goal Claims' : t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
        <div className="ml-auto text-sm text-gray-500">{loading ? 'Loading…' : 'Up to date'}</div>
      </div>

      {tab === 'claims' && <PendingClaimsTable />}
      {tab === 'categories' && <CategoryManager />}
      {tab === 'goals' && (
        <SimpleTable
          rows={goals}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'goal_name', label: 'Goal' },
            { key: 'current_amount', label: 'Current', render: (v) => currency(Number(v)) },
            { key: 'target_amount', label: 'Target', render: (v) => currency(Number(v)) },
            { key: 'completed', label: 'Completed' },
            { key: 'completed_verified', label: 'Verified' },
            { key: 'updated_at', label: 'Updated', render: (v) => new Date(v).toLocaleString() },
          ]}
        />
      )}
      {tab === 'incomes' && (
        <SimpleTable
          rows={incomes}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'date', label: 'Date', render: (v) => new Date(v).toLocaleDateString() },
            { key: 'amount', label: 'Amount', render: (v) => currency(Number(v)) },
            { key: 'source', label: 'Source' },
            { key: 'user_id', label: 'User' },
          ]}
        />
      )}
      {tab === 'expenses' && (
        <SimpleTable
          rows={expenses}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'date', label: 'Date', render: (v) => new Date(v).toLocaleDateString() },
            { key: 'amount', label: 'Amount', render: (v) => currency(Number(v)) },
            { key: 'category_id', label: 'Category ID' },
            { key: 'merchant', label: 'Merchant' },
            { key: 'user_id', label: 'User' },
          ]}
        />
      )}
    </div>
  )
}
