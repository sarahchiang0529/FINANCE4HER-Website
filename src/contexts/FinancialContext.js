import React, { createContext, useState, useContext, useEffect } from "react";

// Create context without Auth0 dependency
const FinancialContext = createContext();

export const useFinancial = () => useContext(FinancialContext);

export const FinancialProvider = ({ children }) => {
  // Initialize with data from localStorage
  const [income, setIncome] = useState(() => {
    const storedIncome = localStorage.getItem("income_data");
    return storedIncome ? JSON.parse(storedIncome) : [];
  });
  
  const [expenses, setExpenses] = useState(() => {
    const storedExpenses = localStorage.getItem("expenses_data");
    return storedExpenses ? JSON.parse(storedExpenses) : [];
  });

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("income_data", JSON.stringify(income));
  }, [income]);

  useEffect(() => {
    localStorage.setItem("expenses_data", JSON.stringify(expenses));
  }, [expenses]);

  // Add new income entry
  const addIncome = (entry) => {
    const newEntry = {
      id: Date.now(),
      ...entry
    };
    setIncome(prev => [newEntry, ...prev]);
    return newEntry;
  };

  // Add new expense entry
  const addExpense = (entry) => {
    const newEntry = {
      id: Date.now(),
      ...entry
    };
    setExpenses(prev => [newEntry, ...prev]);
    return newEntry;
  };

  return (
    <FinancialContext.Provider value={{
      income,
      expenses,
      addIncome,
      addExpense,
      setIncome,
      setExpenses
    }}>
      {children}
    </FinancialContext.Provider>
  );
};