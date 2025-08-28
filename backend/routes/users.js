// backend/routes/users.js
const express = require('express')
const router = express.Router()

/**
 * Helpers
 */
async function ensureCategoryId(supabase, category_id, category_name) {
  if (category_id) return Number(category_id)
  if (!category_name) return null

  // Find existing (case-insensitive)
  const { data: found, error: findErr } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', category_name)
    .maybeSingle()
  if (findErr) throw findErr
  if (found) return found.id

  // Create new if not found
  const { data: created, error: insertErr } = await supabase
    .from('categories')
    .insert([{ name: category_name }])
    .select('id')
    .single()
  if (insertErr) throw insertErr
  return created.id
}

function parseAmount(amount, value) {
  const amt = Number.parseFloat(amount ?? value)
  return Number.isFinite(amt) ? amt : null
}

// put this near the top of backend/routes/users.js (or a shared util)
async function findCategoryIdByName(supabase, name) {
  const label = (name || "").trim();
  if (!label) return null;

  // case-insensitive match on name
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .ilike("name", label)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? data.id : null;
}


/**
 * SAVINGS GOALS
 */
router.get('/:userId/savings-goals', async (req, res) => {
  const { userId } = req.params
  const { data, error } = await req.supabase
    .from('savings_goal')
    .select('*')
    .eq('user_id', userId)
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.post('/:userId/savings-goals', async (req, res) => {
  try {
    const { userId } = req.params
    const {
      goal_name,          // string
      target_amount,      // number/string
      current_amount = 0, // number/string
      target_date,        // 'YYYY-MM-DD'
      category_id,        // bigint
      category_name,      // string (optional)
      description = '',
      completed = false
    } = req.body

    const tAmt = parseAmount(target_amount)
    const cAmt = parseAmount(current_amount) ?? 0
    if (!goal_name || !tAmt || !target_date) {
      return res.status(400).json({ error: 'goal_name, target_amount, target_date required' })
    }
    const catId = await ensureCategoryId(req.supabase, category_id, category_name)

    const { data, error } = await req.supabase
      .from('savings_goal')
      .insert([{
        user_id: userId,
        goal_name,
        target_amount: tAmt,
        current_amount: cAmt,
        target_date,
        category_id: catId,
        description,
        completed
      }])
      .single()

    if (error) return res.status(500).json({ error: error.message })
    res.status(201).json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.put('/:userId/savings-goals/:id', async (req, res) => {
  try {
    const { userId, id } = req.params
    const {
      goal_name,
      target_amount,
      current_amount,
      target_date,
      category_id,
      category_name,
      description,
      completed
    } = req.body

    const updates = {}
    if (goal_name !== undefined) updates.goal_name = goal_name
    if (target_amount !== undefined) updates.target_amount = parseAmount(target_amount)
    if (current_amount !== undefined) updates.current_amount = parseAmount(current_amount)
    if (target_date !== undefined) updates.target_date = target_date
    if (description !== undefined) updates.description = description
    if (completed !== undefined) updates.completed = !!completed
    if (category_id !== undefined || category_name !== undefined) {
      updates.category_id = await ensureCategoryId(req.supabase, category_id, category_name)
    }

    const { data, error } = await req.supabase
      .from('savings_goal')
      .update(updates)
      .match({ id: Number(id), user_id: userId })
      .single()

    if (error) return res.status(500).json({ error: error.message })
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/:userId/savings-goals/:id', async (req, res) => {
  const { userId, id } = req.params
  const { error } = await req.supabase
    .from('savings_goal')
    .delete()
    .match({ id: Number(id), user_id: userId })
  if (error) return res.status(500).json({ error: error.message })
  res.status(204).send()
})

/**
 * INCOME
 * Your UI uses { amount (string), category (string), date, description } and stores numeric under "value" later,
 * so we accept amount/value and category or category_id and adapt for DB. 
 */
router.get("/:userId/incomes", async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await req.supabase
    .from("income")
    .select("id, user_id, amount, date, description, category_id, categories(name)")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  // Optional: flatten shape so FE can read .category directly
  const rows = (data || []).map((r) => ({
    id: r.id,
    user_id: r.user_id,
    amount: r.amount,
    date: r.date,
    description: r.description,
    category_id: r.category_id,
    category: r.categories?.name ?? "(Unknown)",
  }));

  res.json(rows);
});

router.post("/:userId/incomes", async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, category_id, category, date, description } = req.body;

    const amt = Number.parseFloat(amount);
    if (!amt || !date || !description) {
      return res.status(400).json({ error: "amount, date, description are required" });
    }

    // resolve UUID if only a label was provided
    let finalCategoryId = category_id;
    if (!finalCategoryId) {
      finalCategoryId = await findCategoryIdByName(req.supabase, category);
      if (!finalCategoryId) {
        return res.status(400).json({ error: `Unknown category '${category}'.` });
      }
    }

    const { data, error } = await req.supabase
      .from("income")
      .insert([{ user_id: userId, amount: amt, category_id: finalCategoryId, date, description }])
      .select("*")
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/:userId/incomes/:id", async (req, res) => {
  try {
    const { userId, id } = req.params;
    const { amount, category_id, category, date, description } = req.body;

    const updates = {};
    if (amount !== undefined) updates.amount = Number.parseFloat(amount);
    if (date !== undefined) updates.date = date;
    if (description !== undefined) updates.description = description;

    if (category_id) {
      updates.category_id = category_id;
    } else if (category) {
      const resolved = await findCategoryIdByName(req.supabase, category);
      if (!resolved) return res.status(400).json({ error: `Unknown category '${category}'.` });
      updates.category_id = resolved;
    }

    const { data, error } = await req.supabase
      .from("income")
      .update(updates)
      .match({ id: Number(id), user_id: userId })
      .select("*")
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:userId/incomes/:id', async (req, res) => {
  const { userId, id } = req.params
  const { error } = await req.supabase
    .from('income')
    .delete()
    .match({ id: Number(id), user_id: userId })
  if (error) return res.status(500).json({ error: error.message })
  res.status(204).send()
})

/**
 * EXPENSES
 * Same adaptation (amount/value + category string). Your UI posts these fields from the form. 
 */
router.get("/:userId/expenses", async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await req.supabase
    .from("expenses")
    .select("id, user_id, amount, date, description, category_id, categories(name)")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const rows = (data || []).map((r) => ({
    id: r.id,
    user_id: r.user_id,
    amount: r.amount,
    date: r.date,
    description: r.description,
    category_id: r.category_id,
    category: r.categories?.name ?? "(Unknown)",
  }));

  res.json(rows);
});

router.post("/:userId/expenses", async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, category_id, category, date, description } = req.body;

    const amt = Number.parseFloat(amount);
    if (!amt || !date || !description) {
      return res.status(400).json({ error: "amount, date, description are required" });
    }

    let finalCategoryId = category_id;
    if (!finalCategoryId) {
      finalCategoryId = await findCategoryIdByName(req.supabase, category);
      if (!finalCategoryId) {
        return res.status(400).json({ error: `Unknown category '${category}'.` });
      }
    }

    const { data, error } = await req.supabase
      .from("expenses")
      .insert([{ user_id: userId, amount: amt, category_id: finalCategoryId, date, description }])
      .select("*")
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/:userId/expenses/:id", async (req, res) => {
  try {
    const { userId, id } = req.params;
    const { amount, category_id, category, date, description } = req.body;

    const updates = {};
    if (amount !== undefined) updates.amount = Number.parseFloat(amount);
    if (date !== undefined) updates.date = date;
    if (description !== undefined) updates.description = description;

    if (category_id) {
      updates.category_id = category_id;
    } else if (category) {
      const resolved = await findCategoryIdByName(req.supabase, category);
      if (!resolved) return res.status(400).json({ error: `Unknown category '${category}'.` });
      updates.category_id = resolved;
    }

    const { data, error } = await req.supabase
      .from("expenses")
      .update(updates)
      .match({ id: Number(id), user_id: userId })
      .select("*")
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:userId/expenses/:id', async (req, res) => {
  const { userId, id } = req.params
  const { error } = await req.supabase
    .from('expenses')
    .delete()
    .match({ id: Number(id), user_id: userId })
  if (error) return res.status(500).json({ error: error.message })
  res.status(204).send()
})

module.exports = router
