import React, { useState } from 'react';
import ChartComponent from '../components/ChartComponent'; 
import PageWrapper from '../components/PageWrapper'; 
import "../stylesheets/Income.css";

const data = [
  { category: 'Salary', value: 2000.0, description: 'Monthly salary' },
  { category: 'Government Benefit', value: 186.0, description: 'Unemployment benefit' },
  { category: 'Investments', value: 540.0, description: 'Stock dividends' },
  { category: 'Other', value: 73.0, description: 'Freelance work' },
];

function Income() {
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  return (
    <PageWrapper> 
      <div className="income-container">
        {/* Input Section */}
        <div className="input-container">
          <h2 className="input-heading">Add Income</h2>
          <div className="add-income">
            <input
              type="text"
              name="amount"
              placeholder="$"
              className="income-input"
            />
            <input
              type="text"
              name="description"
              placeholder="Description"
              className="income-input description-input"
            />
            <select name="category" className="income-select">
              <option value="Salary">Salary</option>
              <option value="Government Benefit">Government Benefit</option>
              <option value="Investments">Investments</option>
              <option value="Other">Other</option>
            </select>
            <button className="income-button">
              Add Income
            </button>
          </div>
        </div>

        {/* Chart Section */}
        <div className="chart-container">
          <h2 className="chart-heading">Income Chart</h2>
          <div className="chart-wrapper">
            <ChartComponent data={data} />
          </div>
        </div>

        {/* Table Section */}
        <div className="table-container">
          <h2 className="table-heading">Income Log</h2>
          <table className="income-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? 'table-row even' : 'table-row'}
                >
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