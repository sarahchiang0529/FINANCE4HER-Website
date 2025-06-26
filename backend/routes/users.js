// users.js
const expressUsers = require('express')
const routerUsers = expressUsers.Router()

// GET /api/users/:userId/savings-goals
routerUsers.get('/:userId/savings-goals', async (req, res) => {
  const { userId } = req.params
  const { data, error } = await req.supabase
    .from('savings_goal')
    .select('*')
    .eq('user_id', userId)
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /api/users/:userId/savings-goals
routerUsers.post('/:userId/savings-goals', async (req, res) => {
  const { userId } = req.params
  const {
    goal_name,
    target_amount,
    current_amount,
    target_date,
    category_id,
    description
  } = req.body

  const { data, error } = await req.supabase
    .from('savings_goal')
    .insert([{
      user_id: userId,
      goal_name,
      target_amount,
      current_amount,
      target_date,
      category_id,
      description
    }])
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

// PUT /api/users/:userId/savings-goals/:id
routerUsers.put('/:userId/savings-goals/:id', async (req, res) => {
  const { userId, id } = req.params
  const updates = req.body

  const { data, error } = await req.supabase
    .from('savings_goal')
    .update({
      goal_name: updates.goal_name,
      target_amount: updates.target_amount,
      current_amount: updates.current_amount,
      target_date: updates.target_date,
      category_id: updates.category_id,
      description: updates.description,
      completed: updates.completed
    })
    .match({ id: Number(id), user_id: userId })
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// DELETE /api/users/:userId/savings-goals/:id
routerUsers.delete('/:userId/savings-goals/:id', async (req, res) => {
  const { userId, id } = req.params
  const { error } = await req.supabase
    .from('savings_goal')
    .delete()
    .match({ id: Number(id), user_id: userId })

  if (error) return res.status(500).json({ error: error.message })
  res.status(204).send()
})

// GET /users/:userId/incomes
routerUsers.get('/:userId/incomes', async (req, res) => {
  const { userId } = req.params
  const { data, error } = await req.supabase
    .from('income')
    .select('*')
    .eq('user_id', userId)
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /users/:userId/incomes
routerUsers.post('/:userId/incomes', async (req, res) => {
  const { userId } = req.params
  const { amount, category_id, date, description } = req.body
  const payload = { user_id: userId, amount, category_id, date, description }
  const { data, error } = await req.supabase
    .from('income')
    .insert([ payload ])
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

// PUT /users/:userId/incomes/:id
routerUsers.put('/:userId/incomes/:id', async (req, res) => {
  const { userId, id } = req.params
  const updates = req.body
  const { data, error } = await req.supabase
    .from('income')
    .update(updates)
    .match({ id: Number(id), user_id: userId })
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// DELETE /users/:userId/incomes/:id
routerUsers.delete('/:userId/incomes/:id', async (req, res) => {
  const { userId, id } = req.params
  const { error } = await req.supabase
    .from('income')
    .delete()
    .match({ id: Number(id), user_id: userId })
  if (error) return res.status(500).json({ error: error.message })
  res.status(204).send()
})


// EXPENSES

// GET /users/:userId/expenses
routerUsers.get('/:userId/expenses', async (req, res) => {
  const { userId } = req.params
  const { data, error } = await req.supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /users/:userId/expenses
routerUsers.post('/:userId/expenses', async (req, res) => {
  const { userId } = req.params
  const { amount, category_id, date, description } = req.body
  const payload = { user_id: userId, amount, category_id, date, description }
  const { data, error } = await req.supabase
    .from('expenses')
    .insert([ payload ])
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

// PUT /users/:userId/expenses/:id
routerUsers.put('/:userId/expenses/:id', async (req, res) => {
  const { userId, id } = req.params
  const updates = req.body
  const { data, error } = await req.supabase
    .from('expenses')
    .update(updates)
    .match({ id: Number(id), user_id: userId })
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// DELETE /users/:userId/expenses/:id
routerUsers.delete('/:userId/expenses/:id', async (req, res) => {
  const { userId, id } = req.params
  const { error } = await req.supabase
    .from('expenses')
    .delete()
    .match({ id: Number(id), user_id: userId })
  if (error) return res.status(500).json({ error: error.message })
  res.status(204).send()
})

module.exports = routerUsers