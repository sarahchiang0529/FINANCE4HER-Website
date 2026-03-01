// 1. Load environment variables from backend/.env (or root .env as fallback)
const path = require("path");
require("dotenv").config({ 
  path: path.join(__dirname, ".env"),
  debug: false 
});
// Also try loading from root .env as fallback
require("dotenv").config({ 
  path: path.join(__dirname, "..", ".env"),
  override: false 
});

// 2. Imports
const { createClient } = require("@supabase/supabase-js");
const express = require("express");
const cors = require("cors");
const learningJournalRoutes = require("./routes/learningJournal");

const app = express();

// 3. Middleware
app.use(cors());
app.use(express.json());

// 4. Supabase client
// Try backend-specific vars first, then fallback to REACT_APP_ vars (from root .env)
const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || "https://edjzhcymyqhjxufixanr.supabase.co";
// Prefer service role key for admin operations, fallback to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error("❌ Missing Supabase key!");
  console.error("Please set one of these in your .env file:");
  console.error("  - SUPABASE_SERVICE_ROLE_KEY (backend/.env - recommended)");
  console.error("  - SUPABASE_ANON_KEY (backend/.env)");
  console.error("  - REACT_APP_SUPABASE_ANON_KEY (root .env - fallback)");
  process.exit(1);
}

console.log("✅ Supabase configured successfully");
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

// Make supabase available on every request
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// 5. Routes
app.get("/", (_req, res) => {
  res.json({
    message: "FINANCE4HER Backend API",
    version: "1.0.0",
    endpoints: {
      health: "GET /health",
      admin: {
        categories: "GET /api/admin/categories",
        incomes: "GET /api/admin/incomes",
        expenses: "GET /api/admin/expenses",
        savingsGoals: "GET /api/admin/savings-goals"
      },
      users: {
        incomes: "GET /api/users/:userId/incomes",
        expenses: "GET /api/users/:userId/expenses",
        savingsGoals: "GET /api/users/:userId/savings-goals"
      },
      learningJournal: "GET /api/learning-journal/journal-questions"
    }
  });
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/admin", require("./routes/admin")); // e.g. GET /api/admin/my-table
app.use("/api/users", require("./routes/users")); // e.g. POST /api/users/:userId/incomes
app.use("/api/learning-journal", learningJournalRoutes);

// 6. Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`   Health check: http://localhost:${port}/health`);
  console.log(`   API base: http://localhost:${port}/api`);
});
