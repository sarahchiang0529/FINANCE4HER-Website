// backend/routes/admin.js
const express = require('express')
const router = express.Router()

/**
 * Categories (CRUD)
 */
router.get('/categories', async (req, res) => {
  const { data, error } = await req.supabase.from('categories').select('*').order('id', { ascending: true })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.post('/categories', async (req, res) => {
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })
  const { data, error } = await req.supabase.from('categories').insert([{ name }]).single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

router.put('/categories/:id', async (req, res) => {
  const { id } = req.params
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })
  const { data, error } = await req.supabase.from('categories').update({ name }).eq('id', Number(id)).single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.delete('/categories/:id', async (req, res) => {
  const { id } = req.params
  const { error } = await req.supabase.from('categories').delete().eq('id', Number(id))
  if (error) return res.status(500).json({ error: error.message })
  res.status(204).send()
})

/**
 * Admin “read-all” endpoints for data inspection
 */
router.get('/savings-goals', async (req, res) => {
  const { data, error } = await req.supabase
    .from('savings_goal')
    .select('id,user_id,goal_name,target_amount,current_amount,target_date,category_id,description,created_at,updated_at,completed')
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.get('/incomes', async (req, res) => {
  const { data, error } = await req.supabase.from('income').select('*').order('date', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.get('/expenses', async (req, res) => {
  const { data, error } = await req.supabase.from('expenses').select('*').order('date', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

module.exports = router
