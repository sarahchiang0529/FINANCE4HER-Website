import { useEffect, useState } from "react";
import "./AdminPage.css";

export default function AdminPage() {
  const [categories, setCategories] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [myTable, setMyTable] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const endpoints = [
        { key: "categories", setter: setCategories },
        { key: "savings-goals", setter: setSavingsGoals },
        { key: "incomes", setter: setIncomes },
        { key: "expenses", setter: setExpenses },
        { key: "my-table", setter: setMyTable }
      ];

      for (let { key, setter } of endpoints) {
        try {
          const res = await fetch(`/api/admin/${key}`);
          const data = await res.json();
          setter(data);
        } catch (err) {
          console.error(`Failed to fetch ${key}`, err);
        }
      }
    };

    fetchData();
  }, []);

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Dashboard</h1>

      <AdminSection title="Categories" data={categories} />
      <AdminSection title="Savings Goals" data={savingsGoals} />
      <AdminSection title="Incomes" data={incomes} />
      <AdminSection title="Expenses" data={expenses} />
      <AdminSection title="My Table" data={myTable} />
    </div>
  );
}

function AdminSection({ title, data }) {
  return (
    <div className="admin-section">
      <h2>{title}</h2>
      {data && data.length > 0 ? (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((value, i) => (
                    <td key={i}>{value !== null ? String(value) : "-"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="admin-empty">No data available.</p>
      )}
    </div>
  );
}
