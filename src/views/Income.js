import React from 'react';
import ChartComponent from '../components/ChartComponent'; // Adjust the path as necessary
import Dropdown from '../components/Dropdown'; 
//import './Expenses.css'; // Import the CSS file

const data = [
    { category: 'Salary', value: 2000.0 },
    { category: 'Government Benefit', value: 186.0 },
    { category: 'Investments', value: 540.0 },
    { category: 'Other', value: 73.0 },
];

const Income = () => {
    const [selectedMonth, setSelectedMonth] = React.useState('January');
    const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
    };

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    return (
        <div className="income-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#65318F', color: '#E9D436', minHeight: '100vh', paddingLeft: '40px', paddingRight: '40px' }}>
            <h1>Income</h1>
            <div className="tab-switch" style={{ padding:'5px' ,marginTop:'20px',marginBottom: '20px', display: 'flex', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#FFFFFF' }}>
                <button onClick={() => window.location.href = '/expenses'} style={{ borderRadius: '25px', flex: 1, padding: '10px 40px', backgroundColor: window.location.pathname === '/expenses' ? '#65318F' : '#FFFFFF', color: window.location.pathname === '/expenses' ? '#FFFFFF' : '#65318F', border: 'none', cursor: 'pointer' }}>
                    Expense
                </button>
                <button onClick={() => window.location.href = '/income'} style={{ borderRadius: '25px', flex: 1, padding: '10px 40px', backgroundColor: window.location.pathname === '/income' ? '#65318F' : '#FFFFFF', color: window.location.pathname === '/income' ? '#FFFFFF' : '#65318F', border: 'none', cursor: 'pointer' }}>
                    Income
                </button>
            </div>
            <div className="chart-container" style={{ width: '50%', height: '300px', marginTop: '50px', color: '#E9D436' }}>
                <ChartComponent data={data} />
            </div>
            
            <div className="controls" style={{ display: 'flex', textAlign:'left', justifyContent: 'left', paddingTop: '75px' }}>
                <label style={{ marginRight: '10px' }}>
                    <Dropdown value={selectedMonth} onChange={handleMonthChange} options={['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']} />
                </label>
                <label style={{ marginLeft: '10px' }}>
                    <Dropdown value={selectedYear} onChange={handleYearChange} options={[2021, 2022, 2023, 2024, 2025]} />
                </label>
            </div>
            <div className="table-container" style={{ width: '50%', display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <table className="income-table" style={{ width: '65%', color: '#E9D436', fontWeight: 'bold', textAlign: 'left' }}>
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

export default Income;