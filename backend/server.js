// 1. Load environment variables from .env
require("dotenv").config({ debug: true });

// 2. Imports
const { createClient } = require("@supabase/supabase-js");
const express = require("express");
const cors = require("cors");

const app = express();

// 3. Middleware
app.use(cors());
app.use(express.json());

// 4. Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "https://hotylxrgwkghsjhyudvh.supabase.co";
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY; // <-- .env must define SUPABASE_KEY
if (!supabaseKey) {
  console.error("Missing SUPABASE_KEY in .env");
  process.exit(1);
}
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

// 6. Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
