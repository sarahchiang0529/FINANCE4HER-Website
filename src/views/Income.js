import React from 'react';
import ChartComponent from '../components/ChartComponent'; // Adjust the path as necessary
import Dropdown from '../components/Dropdown'; // Import the Dropdown component

const data = [
    { category: 'Salary', value: 2000.0, description: 'Monthly salary' },
    { category: 'Government Benefit', value: 186.0, description: 'Unemployment benefit' },
    { category: 'Investments', value: 540.0, description: 'Stock dividends' },
    { category: 'Other', value: 73.0, description: 'Freelance work' },
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
        <div className="income-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#65318F', color: '#E9D436', minHeight: '100vh', padding: '20px' }}>
            <h1>Income</h1>
            <div className="tab-switch" style={{ padding: '3px', marginTop: '20px', marginBottom: '20px', display: 'flex', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#FFFFFF' }}>
                <button onClick={() => window.location.href = '/expenses'} style={{ borderRadius: '25px', flex: 1, padding: '10px 40px', backgroundColor: window.location.pathname === '/expenses' ? '#65318F' : '#FFFFFF', color: window.location.pathname === '/expenses' ? '#FFFFFF' : '#65318F', border: 'none', cursor: 'pointer' }}>
                    Expense
                </button>
                <button onClick={() => window.location.href = '/income'} style={{ borderRadius: '25px', flex: 1, padding: '10px 40px', backgroundColor: window.location.pathname === '/income' ? '#65318F' : '#FFFFFF', color: window.location.pathname === '/income' ? '#FFFFFF' : '#65318F', border: 'none', cursor: 'pointer' }}>
                    Income
                </button>
            </div>

            {/* Input Section */}
            <div className="input-container" style={{ width: '100%', maxWidth: '800px', backgroundColor: '#502a6e', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '20px' }}>
                <h2 style={{ marginBottom: '20px', color: '#FFFFFF' }}>Add Income</h2>
                <div className="add-income" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <input 
                        type="number" 
                        name="amount" 
                        placeholder="Amount" 
                        style={{
                            padding: '10px',
                            borderRadius: '5px',
                            border: '1px solid #E9D436',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: '#E9D436',
                            outline: 'none',
                            width: '150px',
                        }}
                    />
                    <input 
                        type="text" 
                        name="description" 
                        placeholder="Description" 
                        style={{
                            padding: '10px',
                            borderRadius: '5px',
                            border: '1px solid #E9D436',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: '#E9D436',
                            outline: 'none',
                            width: '200px',
                        }}
                    />
                    <select 
                        name="category" 
                        style={{
                            padding: '10px',
                            borderRadius: '5px',
                            border: '1px solid #E9D436',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: '#E9D436',
                            outline: 'none',
                            width: '150px',
                        }}
                    >
                        <option value="Salary">Salary</option>
                        <option value="Government Benefit">Government Benefit</option>
                        <option value="Investments">Investments</option>
                        <option value="Other">Other</option>
                    </select>
                    <button 
                        style={{
                            padding: '10px 20px',
                            borderRadius: '5px',
                            border: 'none',
                            backgroundColor: '#E9D436',
                            color: '#65318F',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                        }}
                    >
                        Add Income
                    </button>
                </div>
            </div>

            {/* Chart Section */}
            <div className="chart-container" style={{ width: '100%', maxWidth: '800px', backgroundColor: '#502a6e', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '20px' }}>
                <h2 style={{ marginBottom: '20px', color: '#FFFFFF' }}>Income Chart</h2>
                <div style={{ height: '400px' }}>
                    <ChartComponent data={data} />
                </div>
            </div>

            {/* Table Section */}
            <div className="table-container" style={{ width: '100%', maxWidth: '800px', backgroundColor: '#502a6e', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <h2 style={{ marginBottom: '20px', color: '#FFFFFF' }}>Income Log</h2>
                <table className="income-table" style={{ width: '100%', color: '#E9D436', fontWeight: 'bold', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#65318F', color: '#FFFFFF' }}>
                            <th style={{ padding: '10px', borderBottom: '1px solid #E9D436' }}>Category</th>
                            <th style={{ padding: '10px', borderBottom: '1px solid #E9D436' }}>Description</th>
                            <th style={{ padding: '10px', borderBottom: '1px solid #E9D436' }}>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.1)' : 'transparent' }}>
                                <td style={{ padding: '10px', borderBottom: '1px solid #E9D436' }}>{item.category}</td>
                                <td style={{ padding: '10px', borderBottom: '1px solid #E9D436' }}>{item.description}</td>
                                <td style={{ padding: '10px', borderBottom: '1px solid #E9D436' }}>${item.value.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Income;