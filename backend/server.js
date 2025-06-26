// 1. Load environment variables from .env
require("dotenv").config({debug: true}); // Set debug to true to see if .env is loaded correctly

// 2. Import Supabase
const { createClient } = require("@supabase/supabase-js");
const express = require("express");
const cors = require("cors"); 

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// 3. Use your Supabase URL and the key from .env
const supabaseUrl = "https://hotylxrgwkghsjhyudvh.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY; // Must match .env variable name
const supabase = createClient(supabaseUrl, supabaseKey);

app.use((req, res, next) => {
  req.supabase = supabase; // Attach Supabase client to request object
  next();
})

app.use("/api/admin", require("./routes/admin")); // Admin routes
app.use("/api/users", require("./routes/users")); // Finance routes

const port = process.env.PORT || 3000; // Use PORT from .env or default to 3001
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});