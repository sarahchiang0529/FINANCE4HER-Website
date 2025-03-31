// 1. Load environment variables from .env
require("dotenv").config({debug: true}); // Set debug to true to see if .env is loaded correctly

// 2. Import Supabase
const { createClient } = require("@supabase/supabase-js");

// 3. Use your Supabase URL and the key from .env
const supabaseUrl = "https://hotylxrgwkghsjhyudvh.supabase.co";
const supabaseKey = process.env.supabaseKey; // Must match .env variable name
const supabase = createClient(supabaseUrl, supabaseKey);

// Log the key to confirm it's loaded (not recommended in production)
console.log("Supabase key:", supabaseKey);

// 4. Optional: Test a query
async function testQuery() {
  // Replace 'my_table' with an actual table in your Supabase project
  const { data, error } = await supabase.from("my_table").select("*");

  if (error) {
    console.error("Error fetching data:", error);
  } else {
    console.log("Data:", data);
  }
}

// Call the test function
testQuery();