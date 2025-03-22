import React from 'react';
import ChartComponent from '../components/ChartComponent'; // Adjust the path as necessary
//import './Expenses.css'; // Import the CSS file

const data = [
    { category: 'Food', value: 200 },
    { category: 'Transport', value: 150 },
    { category: 'Entertainment', value: 100 },
    { category: 'Utilities', value: 250 },
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
        <div className="expenses-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#65318F', color: '#E9D436', minHeight: '100vh' }}>
            <h1>Expenses</h1>
            
            <div className="chart-container" style={{ width: '50%', height: '300px',marginTop:'50px', color: '#E9D436' }}>
                <ChartComponent data={data} />
            </div>
            
            <div className="controls" style={{ display: 'flex', justifyContent: 'center', paddingTop: '75px' }}>
                <label style={{ marginRight: '10px' }}>
                    Month:
                    <select value={selectedMonth} onChange={handleMonthChange}>
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                            <option key={month} value={month}>
                                {month}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Year:
                    <select value={selectedYear} onChange={handleYearChange}>
                        {[2021, 2022, 2023, 2024, 2025].map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            <div className="table-container" style={{ width: '50%' }}>
                <table className="expenses-table" style={{ width: '100%', color: '#E9D436', fontWeight: 'bold' }}>
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index}>
                                <td>{item.category}</td>
                                <td>${item.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Expenses;