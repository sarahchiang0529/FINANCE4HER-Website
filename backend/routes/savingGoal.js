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
  
const toCamelCase = (obj) =>
Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
    key.replace(/_([a-z])/g, (_, char) => char.toUpperCase()),
    value,
    ])
);

module.exports = router;
