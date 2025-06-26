// admin.js
const express = require('express')
const router = express.Router()

// GET all categories
router.get('/categories', async (req, res) => {
  const { data, error } = await req.supabase
    .from('categories')
    .select('*')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET all savings goals (including all fields)
router.get('/savings-goals', async (req, res) => {
  const { data, error } = await req.supabase
    .from('savings_goal')
    .select(
      `id, user_id, goal_name, target_amount, current_amount,
       target_date, category_id, description, created_at,
       updated_at, completed`
    )
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET all rows in my_table
router.get('/my-table', async (req, res) => {
  const { data, error } = await req.supabase
    .from('my_table')
    .select('*')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET all income transactions
router.get('/incomes', async (req, res) => {
  const { data, error } = await req.supabase
    .from('income')
    .select('*')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET all expense transactions
router.get('/expenses', async (req, res) => {
  const { data, error } = await req.supabase
    .from('expenses')
    .select('*')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

module.exports = router