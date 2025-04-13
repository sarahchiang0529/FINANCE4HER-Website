import React, { useState } from 'react';
import ChartComponent from '../components/ChartComponent';
import PageWrapper from '../components/PageWrapper';
import "../stylesheets/Expenses.css";

function Expenses() {
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expenses, setExpenses] = useState([
    { category: 'Food', value: 200, description: 'Groceries' },
    { category: 'Transport', value: 150, description: 'Bus pass' },
    { category: 'Entertainment', value: 100, description: 'Movie tickets' },
    { category: 'Utilities', value: 250, description: 'Electricity bill' },
  ]);

  const [newExpense, setNewExpense] = useState({
    amount: '',
    description: '',
    category: 'Food'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddExpense = () => {
    const { amount, description, category } = newExpense;
    const numericAmount = parseFloat(amount);

    if (!amount || isNaN(numericAmount) || !description) {
      alert("Please enter a valid amount and description.");
      return;
    }

    const newEntry = {
      category,
      value: numericAmount,
      description
    };

    setExpenses(prev => [...prev, newEntry]);

    // Reset fields
    setNewExpense({
      amount: '',
      description: '',
      category: 'Food'
    });
  };

  return (
    <PageWrapper>
      <div className="expenses-container">
        {/* Input Section */}
        <div className="input-container">
          <h2 className="input-title">Add Expense</h2>
          <div className="add-expense">
            <input 
              type="text" 
              name="amount" 
              placeholder="$" 
              className="form-input"
              value={newExpense.amount}
              onChange={handleInputChange}
            />
            <input 
              type="text" 
              name="description" 
              placeholder="Description" 
              className="form-input"
              value={newExpense.description}
              onChange={handleInputChange}
            />
            <select 
              name="category" 
              className="form-input"
              value={newExpense.category}
              onChange={handleInputChange}
            >
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Utilities">Utilities</option>
            </select>
            <button className="expense-button" onClick={handleAddExpense}>
              Add Expense
            </button>
          </div>
        </div>

        {/* Chart Section */}
        <div className="input-container">
          <h2 className="chart-title">Expense Chart</h2>
          <div className="chart-wrapper">
            <ChartComponent data={expenses} />
          </div>
        </div>

        {/* Table Section */}
        <div className="input-container">
          <h2 className="table-title">Spending Log</h2>
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'table-row even' : 'table-row'}>
                  <td>{item.category}</td>
                  <td>{item.description}</td>
                  <td>${item.value.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Expenses;