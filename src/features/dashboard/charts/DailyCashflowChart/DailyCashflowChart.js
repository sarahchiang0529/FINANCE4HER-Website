import { useMemo } from "react"
import { Line } from "react-chartjs-2"
import "./DailyCashflowChart.css"

const DailyCashflowChart = ({ transactions }) => {
  // Prepare data for the chart
  const chartData = useMemo(() => {
    // Get the date from the first transaction to determine which month we're viewing
    let selectedDate = new Date()
    if (transactions.length > 0) {
      // Find the month/year from the transactions we received
      const dates = transactions.map((t) => new Date(t.date))
      if (dates.length > 0) {
        // Use the most recent transaction date to determine month/year
        selectedDate = new Date(Math.max(...dates.map((d) => d.getTime())))
      }
    }

    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()

    // Get days in the selected month
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    // Initialize arrays with zeros for each day
    const incomeData = Array(days.length).fill(0)
    const expenseData = Array(days.length).fill(0)

    // Process transactions
    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date)

      // Only include transactions from the selected month
      if (transactionDate.getMonth() === month && transactionDate.getFullYear() === year) {
        const day = transactionDate.getDate() - 1 // Array is 0-indexed

        if (transaction.type === "income") {
          incomeData[day] += transaction.value
        } else {
          expenseData[day] += transaction.value
        }
      }
    })

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
    }
  }, [transactions])

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
          text: "Day of Month",
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
          padding: 5,
          autoSkip: false,
          callback: function (value, index) {
            // Show every 5th tick for better readability
            return index % 5 === 0 ? this.getLabelForValue(value) : ""
          },
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
            if (value >= 1000) {
              return "$" + value / 1000 + "k"
            }
            return "$" + value
          },
          maxTicksLimit: 6,
          padding: 5,
        },
        beginAtZero: true,
      },
    },
    elements: {
      line: {
        tension: 0.1, // Smoother curves
      },
      point: {
        radius: 0, // Hide points by default
        hoverRadius: 4, // Show on hover
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
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
    <div className="daily-chart-container">
      {hasData ? (
        <div className="daily-chart-wrapper">
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-color income-color"></span>
              <span>Income</span>
            </div>
            <div className="legend-item">
              <span className="legend-color expense-color"></span>
              <span>Expenses</span>
            </div>
          </div>
          <Line data={chartData} options={options} />
          {/* Add legend below the chart but inside the container */}
        </div>
      ) : (
        <div className="chart-no-data">
          <p>No transaction data available for the current month. Add transactions to see your daily cashflow.</p>
        </div>
      )}
    </div>
  )
}

export default DailyCashflowChart