// 1. Load environment variables
// Try backend/.env first, then fallback to root .env
const path = require("path");
const fs = require("fs");

// Load backend/.env if it exists
const backendEnvPath = path.join(__dirname, ".env");
if (fs.existsSync(backendEnvPath)) {
  require("dotenv").config({ path: backendEnvPath });
}

// Also load root .env (for REACT_APP_ variables as fallback)
const rootEnvPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(rootEnvPath)) {
  require("dotenv").config({ path: rootEnvPath });
}

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
const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || "https://hotylxrgwkghsjhyudvh.supabase.co";
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
const supabase = createClient(supabaseUrl, supabaseKey);

// Make supabase available on every request
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// 5. Routes
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/admin", require("./routes/admin")); // e.g. GET /api/admin/my-table
app.use("/api/users", require("./routes/users")); // e.g. POST /api/users/:userId/incomes
app.use("/api/learning-journal", learningJournalRoutes);

// 6. Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
