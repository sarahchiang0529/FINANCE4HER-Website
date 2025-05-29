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

module.exports = router;
