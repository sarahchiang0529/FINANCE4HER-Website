
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
  