const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

// Supabase client setup (included directly for now)
const supabaseUrl = "https://hotylxrgwkghsjhyudvh.supabase.co";
const supabaseKey = process.env.supabaseKey;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/saving-categories
router.get("/saving-categories", async (req, res) => {
  try {
    const { data, error } = await supabase.from("categories").select("id, name");
    if (error) {
      console.error("Supabase fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch categories" });
    }

    res.json({ categories: data });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/saving-goals
router.post("/saving-goals", async (req, res) => {
const {
    name,
    category,
    targetAmount,
    currentAmount,
    targetDate,
    description,
    user_id,
} = req.body;

if (!user_id || !name || !targetAmount || !targetDate || !category || !description) {
    return res.status(400).json({ error: "Missing required fields" });
}

try {
    const { data, error } = await supabase.from("savings_goal").insert([
    {
        goal_name: name,
        category_id: category,
        target_amount: targetAmount,
        current_amount: currentAmount,
        target_date: targetDate,
        description,
        user_id,
    },
    ]).select("*");

    if (error) {
    console.error("Insert error:", error);
    return res.status(500).json({ error: "Failed to save goal" });
    }

    const camelCaseGoal = toCamelCase(data[0]);
    res.status(201).json({ goal: camelCaseGoal });
} catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
}
});

// In your savinggoal.js (Express route)

router.get("/saving-goals", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "Missing userId" });
  
    try {
      const { data, error } = await supabase
        .from("savings_goal")
        .select("*")
        .eq("user_id", userId);
  
      if (error) throw error;
  
      const toCamelCase = (obj) =>
        Object.fromEntries(
          Object.entries(obj).map(([key, val]) => [
            key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
            val,
          ])
        );
  
      res.json({ goals: data.map(toCamelCase) });
    } catch (err) {
      console.error("Fetch error:", err);
      res.status(500).json({ error: "Failed to fetch saving goals" });
    }
  });

  // POST /api/saving-goals/:id/complete

  router.post('/saving-goals/:id/toggle-complete', async (req, res) => {
    const goalId = req.params.id;
  
    // First, fetch current state
    const { data: currentData, error: fetchError } = await supabase
      .from('savings_goal')
      .select('completed')
      .eq('id', goalId)
      .single();
  
    if (fetchError) {
      console.error(fetchError);
      return res.status(500).json({ error: fetchError.message });
    }
  
    const newStatus = !currentData.completed;
  
    const { data, error } = await supabase
      .from('savings_goal')
      .update({ completed: newStatus })
      .eq('id', goalId)
      .select()
      .single();
  
    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  
    res.json({ goal: data });
  });
  
  // PUT /api/saving-goals/:id
router.put("/saving-goals/:id", async (req, res) => {
  const goalId = req.params.id;
  const {
    name,
    category,
    targetAmount,
    currentAmount,
    targetDate,
    description,
  } = req.body;

  if (!name || !category || !targetAmount || !targetDate || !description) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { data, error } = await supabase
      .from("savings_goal")
      .update({
        goal_name: name,
        category_id: category,
        target_amount: targetAmount,
        current_amount: currentAmount,
        target_date: targetDate,
        description,
      })
      .eq("id", goalId)
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      return res.status(500).json({ error: "Failed to update goal" });
    }

    const toCamelCase = (obj) =>
      Object.fromEntries(
        Object.entries(obj).map(([key, val]) => [
          key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
          val,
        ])
      );

    res.json({ goal: toCamelCase(data) });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
