// Format currency values
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Format date to readable format
  export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  
  // Format date to month and year only
  export const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };
  
  // Get first and last day of a month
  export const getMonthDateRange = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return {
      start: new Date(year, month, 1),
      end: new Date(year, month + 1, 0),
    };
  };