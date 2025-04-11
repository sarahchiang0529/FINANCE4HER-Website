import React from 'react';
import ChartComponent from '../components/ChartComponent';
import "../stylesheets/Expenses.css";

const data = [
  { category: 'Food', value: 200, description: 'Groceries' },
  { category: 'Transport', value: 150, description: 'Bus pass' },
  { category: 'Entertainment', value: 100, description: 'Movie tickets' },
  { category: 'Utilities', value: 250, description: 'Electricity bill' },
];

const Expenses = () => {
  const [selectedMonth, setSelectedMonth] = React.useState('January');
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  return (
    <div className="expenses-container">
      {/* Input Section */}
      <div className="input-container">
        <h2 className="input-heading">Add Expense</h2>
        <div className="add-expense">
          <input 
            type="number" 
            name="amount" 
            placeholder="Amount" 
            className="expense-input"
          />
          <input 
            type="text" 
            name="description" 
            placeholder="Description" 
            className="expense-input description-input"
          />
          <select name="category" className="expense-select">
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Utilities">Utilities</option>
          </select>
          <button className="expense-button">
            Add Expense
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-container">
        <h2 className="chart-heading">Expense Chart</h2>
        <div className="chart-wrapper">
          <ChartComponent data={data} />
        </div>
      </div>

      {/* Table Section */}
      <div className="table-container">
        <h2 className="table-heading">Spending Log</h2>
        <table className="expenses-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
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
  );
};

export default Expenses;
