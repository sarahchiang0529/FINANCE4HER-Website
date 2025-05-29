export async function fetchSavingCategories() {
    try {
      const response = await fetch('http://localhost:3001/api/saving-categories'); // use .env variable for production
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
  
      // Ensure structure and filter only needed fields
      const categories = data.categories?.map(cat => ({
        id: cat.id,
        name: cat.name,
      })) || [];
  
      return categories;
    } catch (error) {
      console.error('Error fetching saving categories:', error);
      return [];
    }
  }
  
  export async function saveSavingGoal(goalPayload) {
    try {
      const response = await fetch("http://localhost:3001/api/saving-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalPayload),
      });
  
      if (!response.ok) {
        throw new Error("Failed to save goal");
      }
  
      const result = await response.json();
      return result.goal;
    } catch (error) {
      console.error("Error saving goal:", error);
      throw error;
    }
  }

export const fetchSavingGoals = async (userId) => {
    if (!userId) return [];
  
    try {
      const res = await fetch(`http://localhost:3001/api/saving-goals?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch goals");
  
      const data = await res.json();
      return data.goals || [];
    } catch (err) {
      console.error("Fetch goals error:", err);
      return [];
    }
  };
  