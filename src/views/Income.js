import React, { useState } from 'react';
import ChartComponent from '../components/ChartComponent';
import PageWrapper from '../components/PageWrapper';
import "../stylesheets/Income.css";

function Income() {
  const [incomeData, setIncomeData] = useState([
    { category: 'Salary', value: 2000.0, description: 'Monthly salary' },
    { category: 'Government Benefit', value: 186.0, description: 'Unemployment benefit' },
    { category: 'Investments', value: 540.0, description: 'Stock dividends' },
    { category: 'Other', value: 73.0, description: 'Freelance work' },
  ]);

  const [newIncome, setNewIncome] = useState({
    amount: '',
    description: '',
    category: 'Salary'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewIncome(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddIncome = () => {
    const { amount, description, category } = newIncome;
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

    setIncomeData(prev => [...prev, newEntry]);

    // Reset fields
    setNewIncome({
      amount: '',
      description: '',
      category: 'Salary'
    });
  };

  return (
    <PageWrapper>
      <div className="income-container">
        {/* Input Section */}
        <div className="input-container">
          <h2 className="input-title">Add Income</h2>
          <div className="add-income">
            <input 
              type="text" 
              name="amount" 
              placeholder="$" 
              className="form-input"
              value={newIncome.amount}
              onChange={handleInputChange}
            />
            <input 
              type="text" 
              name="description" 
              placeholder="Description" 
              className="form-input"
              value={newIncome.description}
              onChange={handleInputChange}
            />
            <select 
              name="category" 
              className="form-input"
              value={newIncome.category}
              onChange={handleInputChange}
            >
              <option value="Salary">Salary</option>
              <option value="Government Benefit">Government Benefit</option>
              <option value="Investments">Investments</option>
              <option value="Other">Other</option>
            </select>
            <button className="income-button" onClick={handleAddIncome}>
              Add Income
            </button>
          </div>
        </div>

        {/* Chart Section */}
        <div className="input-container">
          <h2 className="chart-title">Income Chart</h2>
          <div className="chart-wrapper">
            <ChartComponent data={incomeData} />
          </div>
        </div>

        {/* Table Section */}
        <div className="input-container">
          <h2 className="table-title">Income Log</h2>
          <table className="income-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {incomeData.map((item, index) => (
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

export default Income;