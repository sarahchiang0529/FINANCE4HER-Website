import { useEffect, useRef } from "react"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend } from "chart.js"
import "./ChartComponent.css"

ChartJS.register(CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend)

// Unregister any existing plugins with IDs that might contain "centerText"
// This ensures we don't have any leftover plugins from previous implementations
Object.keys(ChartJS.registry.plugins.items || {}).forEach((key) => {
  if (key.toLowerCase().includes("centertext") || key.toLowerCase().includes("monthlytext")) {
    ChartJS.unregister(ChartJS.registry.plugins.items[key])
  }
})

const ChartComponent = ({ data, type, chartId = "income-distribution-chart" }) => {
  const chartRef = useRef(null)
  const containerRef = useRef(null)

  // Define colors as an array
  const colors = [
    "rgba(77, 192, 181, 1)", // teal
    "rgba(52, 144, 220, 1)", // blue
    "rgba(246, 173, 85, 1)", // yellow/orange  192, 181, 1)", // teal
    "rgba(52, 144, 220, 1)", // blue
    "rgba(246, 173, 85, 1)", // yellow/orange
    "rgba(159, 122, 234, 1)", // purple
    "rgba(245, 101, 101, 1)", // red/orange
  ]

  // Group data
  const groupedData = data
    ? data.reduce((acc, item) => {
        const existingCategory = acc.find((g) => g.category === item.category)
        if (existingCategory) {
          existingCategory.value += item.value
        } else {
          acc.push({ category: item.category, value: item.value })
        }
        return acc
      }, [])
    : []

  const totalValue = groupedData.reduce((acc, item) => acc + item.value, 0)

  // Labels
  const chartLabel = type === "income" ? "Income" : "Expenses"
  const totalLabel = type === "income" ? "Total Income" : "Total Expenses"

  // Assign colors to categories (sequentially from the array)
  const backgroundColors = groupedData.map((_, index) => colors[index % colors.length])

  // Chart data
  const chartData = {
    labels: groupedData.map((item) => item.category),
    datasets: [
      {
        label: chartLabel,
        data: groupedData.map((item) => item.value),
        backgroundColor: backgroundColors,
        borderColor: "white",
        borderWidth: 2,
      },
    ],
  }

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false, // This is important to respect the container size
    layout: {
      padding: 0,
    },
    plugins: {
      legend: {
        position: "top",
        align: "center",
        onClick: null, // Disable legend click functionality
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 8,
          boxHeight: 8,
          padding: 15,
          color: "#333",
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = ctx.label || ""
            const value = ctx.raw || 0
            return `${label}: $${value.toFixed(2)}`
          },
        },
      },
      // Explicitly disable any custom plugins
      centerText: false,
      monthlyChartCenterText: false,
      doughnutLabel: false,
    },
    cutout: "70%", // Donut hole size
  }

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && containerRef.current) {
        // Force chart update on resize
        chartRef.current.update()
      }
    }

    // Add resize listener
    window.addEventListener("resize", handleResize)

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <div className="chart-wrapper" ref={containerRef}>
      <div className="chart-container">
        <Pie ref={chartRef} data={chartData} options={options} id={chartId} />
        {/* Add center text as DOM element instead of plugin */}
        <div className="chart-center-text">
          <div className="chart-center-label">{totalLabel}</div>
          <div className="chart-center-value">${totalValue.toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}

export default ChartComponent