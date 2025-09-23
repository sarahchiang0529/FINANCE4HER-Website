import { useMemo } from "react";
import { Line, Bar } from "react-chartjs-2";
import "./UnifiedChart.css";
import { Chart as ChartJS } from "chart.js";

// Use Funnel Display font to match the app design
const primaryFont = '"Funnel Display", sans-serif';
ChartJS.defaults.font.family = primaryFont;

const UnifiedChart = ({ 
  chartType = "line", // "line" or "bar"
  transactions = [], 
  timeframe = "daily", // "daily" or "monthly"
  selectedMonth = new Date(),
  selectedYear = new Date().getFullYear()
}) => {
  
  // Prepare chart data based on timeframe
  const chartData = useMemo(() => {
    if (timeframe === "daily") {
      // Daily cashflow logic
      const now = selectedMonth;
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

      const incomeData = Array(days.length).fill(0);
      const expenseData = Array(days.length).fill(0);

      transactions.forEach((transaction) => {
        const transactionDate = new Date(transaction.date);
        if (transactionDate.getMonth() === month && transactionDate.getFullYear() === year) {
          const day = transactionDate.getDate() - 1;
          if (transaction.type === "income") {
            incomeData[day] += transaction.value;
          } else {
            expenseData[day] += transaction.value;
          }
        }
      });

      return {
        labels: days.map((day) => `${day}`),
        datasets: [
          {
            label: "Income",
            data: incomeData,
            borderColor: "rgba(46, 204, 113, 1)",
            backgroundColor: "rgba(46, 204, 113, 0.1)",
            tension: 0.1,
            fill: false,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
          {
            label: "Expenses",
            data: expenseData,
            borderColor: "rgba(231, 76, 60, 1)",
            backgroundColor: "rgba(231, 76, 60, 0.1)",
            tension: 0.1,
            fill: false,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
        ],
      };
    } else {
      // Monthly comparison logic
      const incomeByMonth = Array(12).fill(0);
      const expensesByMonth = Array(12).fill(0);

      transactions.forEach((transaction) => {
        const transactionDate = new Date(transaction.date);
        if (transactionDate.getFullYear() === selectedYear) {
          const month = transactionDate.getMonth();
          if (transaction.type === "income") {
            incomeByMonth[month] += transaction.value;
          } else {
            expensesByMonth[month] += transaction.value;
          }
        }
      });

      return {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
          {
            label: "Income",
            data: incomeByMonth,
            backgroundColor: "rgba(46, 204, 113, 0.7)",
            borderColor: "rgba(46, 204, 113, 1)",
            borderWidth: 1,
          },
          {
            label: "Expenses",
            data: expensesByMonth,
            backgroundColor: "rgba(231, 76, 60, 0.7)",
            borderColor: "rgba(231, 76, 60, 1)",
            borderWidth: 1,
          },
        ],
      };
    }
  }, [transactions, timeframe, selectedMonth, selectedYear]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide default legend
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#333",
        bodyColor: "#666",
        borderColor: "#ddd",
        borderWidth: 1,
        padding: 8,
        boxPadding: 4,
        usePointStyle: true,
        titleFont: {
          family: primaryFont,
          size: 12,
        },
        bodyFont: {
          family: primaryFont,
          size: 11,
        },
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: timeframe === "daily" ? "Day of Month" : "Month",
          color: "#666",
          font: {
            family: primaryFont,
            size: 11,
            weight: "normal",
          },
          padding: {
            top: 5,
          },
        },
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          color: "#666",
          font: {
            family: primaryFont,
            size: 10,
          },
          maxRotation: 0,
          padding: 5,
          autoSkip: timeframe === "monthly",
          callback: timeframe === "daily" ? function (value, index) {
            return index % 5 === 0 ? this.getLabelForValue(value) : "";
          } : undefined,
        },
      },
      y: {
        position: "left",
        title: {
          display: true,
          text: "Amount ($)",
          color: "#666",
          font: {
            family: primaryFont,
            size: 11,
            weight: "normal",
          },
        },
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          color: "#666",
          font: {
            family: primaryFont,
            size: 10,
          },
          callback: (value) => {
            if (value >= 1000000000) {
              return "$" + (value / 1000000000).toFixed(1) + "B";
            } else if (value >= 1000000) {
              return "$" + (value / 1000000).toFixed(1) + "M";
            } else if (value >= 1000) {
              return "$" + (value / 1000).toFixed(1) + "k";
            }
            return "$" + value;
          },
          maxTicksLimit: timeframe === "daily" ? 6 : undefined,
          padding: 5,
        },
        beginAtZero: true,
      },
    },
    elements: timeframe === "daily" ? {
      line: {
        tension: 0.1,
      },
      point: {
        radius: 0,
        hoverRadius: 4,
      },
    } : undefined,
    interaction: {
      mode: "index",
      intersect: false,
    },
    layout: {
      padding: {
        left: 5,
        right: 10,
        top: 5,
        bottom: 5,
      },
    },
  };

  // Check if there's data to display
  const hasData = chartData.datasets.some((dataset) => dataset.data.some((value) => value > 0));

  const ChartComponent = chartType === "line" ? Line : Bar;

  return (
    <div className="unified-chart-container">
      {hasData ? (
        <div className="unified-chart-wrapper">
          <div className="unified-chart-legend">
            <div className="unified-legend-item">
              <span className="unified-legend-color income-color"></span>
              <span>Income</span>
            </div>
            <div className="unified-legend-item">
              <span className="unified-legend-color expense-color"></span>
              <span>Expenses</span>
            </div>
          </div>
          <div style={{ height: 'calc(100% - 40px)' }}>
            <ChartComponent data={chartData} options={options} />
          </div>
        </div>
      ) : (
        <div className="unified-chart-no-data">
          <div>No transaction data available for the {timeframe === "daily" ? "current month" : "current year"}.</div>
          <div>Add transactions to see your {timeframe === "daily" ? "daily cashflow" : "monthly comparison"}.</div>
        </div>
      )}
    </div>
  );
};

export default UnifiedChart;