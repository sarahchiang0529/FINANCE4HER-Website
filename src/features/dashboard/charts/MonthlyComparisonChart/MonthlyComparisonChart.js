import { useMemo } from "react"
import { Bar } from "react-chartjs-2"
import "./MonthlyComparisonChart.css"
import { Chart as ChartJS } from "chart.js"

// Pull in the primary font from your CSS variables
const rootStyles = getComputedStyle(document.documentElement)
const primaryFont = rootStyles.getPropertyValue("--font-primary").trim()
ChartJS.defaults.font.family = primaryFont

const MonthlyComparisonChart = ({ transactions }) => {
  // Get monthly data for the current year
  const getMonthlyData = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()

    // Initialize arrays with zeros for each month
    const incomeByMonth = Array(12).fill(0)
    const expensesByMonth = Array(12).fill(0)

    // Process transactions
    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date)

      // Only include transactions from current year
      if (transactionDate.getFullYear() === currentYear) {
        const month = transactionDate.getMonth()

        if (transaction.type === "income") {
          incomeByMonth[month] += transaction.value
        } else {
          expensesByMonth[month] += transaction.value
        }
      }
    })

    return {
      incomeByMonth,
      expensesByMonth,
    }
  }, [transactions])

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Income",
        data: getMonthlyData.incomeByMonth,
        backgroundColor: "rgba(46, 204, 113, 0.7)",
        borderColor: "rgba(46, 204, 113, 1)",
        borderWidth: 1,
      },
      {
        label: "Expenses",
        data: getMonthlyData.expensesByMonth,
        backgroundColor: "rgba(231, 76, 60, 0.7)",
        borderColor: "rgba(231, 76, 60, 1)",
        borderWidth: 1,
      },
    ],
  }

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
            let label = context.dataset.label || ""
            if (label) {
              label += ": "
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(context.parsed.y)
            }
            return label
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Month",
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
          autoSkip: false,
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
              return "$" + (value / 1000000000).toFixed(1) + "B"
            } else if (value >= 1000000) {
              return "$" + (value / 1000000).toFixed(1) + "M"
            } else if (value >= 1000) {
              return "$" + (value / 1000).toFixed(1) + "k"
            }
            return "$" + value
          },
          padding: 5,
        },
        beginAtZero: true,
      },
    },
    layout: {
      padding: {
        left: 5,
        right: 10,
        top: 30, // Increased to make room for the legend at the top
        bottom: 5,
      },
    },
  }

  // Check if there's data to display
  const hasData = chartData.datasets.some((dataset) => dataset.data.some((value) => value > 0))

  const currentYear = new Date().getFullYear()

  return (
    <div className="monthly-comparison-container">
      {hasData ? (
        <div className="monthly-comparison-wrapper">
          <div className="monthly-comparison-legend">
            <div className="monthly-legend-item">
              <span className="monthly-legend-color monthly-income-color"></span>
              <span>Income</span>
            </div>
            <div className="monthly-legend-item">
              <span className="monthly-legend-color monthly-expense-color"></span>
              <span>Expenses</span>
            </div>
          </div>
          <Bar data={chartData} options={options} />
        </div>
      ) : (
        <div className="monthly-comparison-no-data">
          <p>No transaction data available for the current year. Add transactions to see your monthly comparison.</p>
        </div>
      )}
    </div>
  )
}

export default MonthlyComparisonChart