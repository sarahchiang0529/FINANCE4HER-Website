import { useMemo } from "react"
import { Bar } from "react-chartjs-2"
import "./MonthlyComparisonChart.css"

const MonthlyComparisonChart = ({ transactions }) => {
  // Get monthly data for the selected year
  const getMonthlyData = useMemo(() => {
    // Determine the year from the transactions
    let selectedYear = new Date().getFullYear()

    if (transactions.length > 0) {
      // Find the year from the transactions we received
      const years = transactions.map((t) => new Date(t.date).getFullYear())
      // Get the most common year in the transactions
      const yearCounts = {}
      years.forEach((year) => {
        yearCounts[year] = (yearCounts[year] || 0) + 1
      })

      // Find the year with the most transactions
      let maxCount = 0
      Object.entries(yearCounts).forEach(([year, count]) => {
        if (count > maxCount) {
          maxCount = count
          selectedYear = Number.parseInt(year)
        }
      })
    }

    // Initialize arrays with zeros for each month
    const incomeByMonth = Array(12).fill(0)
    const expensesByMonth = Array(12).fill(0)

    // Process transactions
    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date)

      // Only include transactions from selected year
      if (transactionDate.getFullYear() === selectedYear) {
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
      selectedYear,
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
          <p>
            No transaction data available for {getMonthlyData.selectedYear}. Add transactions to see your monthly
            comparison.
          </p>
        </div>
      )}
    </div>
  )
}

export default MonthlyComparisonChart