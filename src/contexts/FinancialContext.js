import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth0 } from "@auth0/auth0-react";

const FinancialContext = createContext();
export const useFinancial = () => useContext(FinancialContext);

export const FinancialProvider = ({ children }) => {
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
  const [supabase, setSupabase] = useState(null);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize Supabase client once Auth0 has issued a token
  useEffect(() => {
    if (!isAuthenticated) {
      setSupabase(null);
      return;
    }
    
    let isMounted = true;
    const initializeSupabase = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/`,
          scope: "openid profile email"
        });
        
        if (!isMounted) return;
        
        const client = createClient(
          process.env.REACT_APP_SUPABASE_URL,
          process.env.REACT_APP_SUPABASE_ANON_KEY,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          }
        );
        
        setSupabase(client);
        setError(null);
      } catch (err) {
        console.error("Failed to initialize Supabase client:", err);
        if (isMounted) {
          setError("Failed to connect to the database. Please try again later.");
          setSupabase(null);
        }
      }
    };

    initializeSupabase();
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, getAccessTokenSilently]);

  // Fetch data function that can be reused
  const fetchData = useCallback(async () => {
    if (!supabase || !isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch income data
      const { data: incomeData, error: incomeError } = await supabase
        .from("income")
        .select("*")
        .order("date", { ascending: false });
        
      if (incomeError) throw incomeError;
      setIncome(incomeData || []);
      
      // Fetch expense data
      const { data: expenseData, error: expenseError } = await supabase
        .from("expense")
        .select("*")
        .order("date", { ascending: false });
        
      if (expenseError) throw expenseError;
      setExpenses(expenseData || []);
    } catch (err) {
      console.error("Error fetching financial data:", err);
      setError("Failed to load your financial data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [supabase, isAuthenticated]);

  // Fetch both income & expenses after Supabase client is ready
  useEffect(() => {
    fetchData();
  }, [supabase, fetchData]);

  // Insert new income row (RLS ensures it belongs to you)
  const addIncome = async (entry) => {
    if (!supabase) throw new Error("Database not connected");
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("income")
        .insert({
          ...entry,
          user_id: user?.sub // Ensure user_id is set for RLS
        })
        .select()
        .single();
        
      if (error) throw error;
      setIncome((prev) => [data, ...prev]);
      return data;
    } catch (error) {
      console.error("Error adding income:", error);
      setError("Failed to add income. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Insert new expense row
  const addExpense = async (entry) => {
    if (!supabase) throw new Error("Database not connected");
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("expense")
        .insert({
          ...entry,
          user_id: user?.sub // Ensure user_id is set for RLS
        })
        .select()
        .single();
        
      if (error) throw error;
      setExpenses((prev) => [data, ...prev]);
      return data;
    } catch (error) {
      console.error("Error adding expense:", error);
      setError("Failed to add expense. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data function that components can call
  const refreshData = () => {
    fetchData();
  };

  return (
    <FinancialContext.Provider
      value={{ 
        supabase, 
        income, 
        expenses, 
        addIncome, 
        addExpense, 
        isLoading,
        error,
        refreshData,
        setIncome, 
        setExpenses 
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};