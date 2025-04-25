"use client"

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

// Define consistent colors for each category
const CATEGORY_COLORS = {
  // Income categories
  Salary: "rgba(52, 144, 220, 0.9)", // Blue
  "Government Benefit": "rgba(106, 90, 205, 0.9)", // Slate Blue
  Investments: "rgba(46, 204, 113, 0.9)", // Green
  Other: "rgba(156, 39, 176, 0.9)", // Purple

  // Expense categories
  Housing: "rgba(231, 76, 60, 0.9)", // Red
  Food: "rgba(255, 152, 0, 0.9)", // Orange
  Transportation: "rgba(255, 193, 7, 0.9)", // Amber
  Utilities: "rgba(3, 169, 244, 0.9)", // Light Blue
  Entertainment: "rgba(233, 30, 99, 0.9)", // Pink
  Healthcare: "rgba(0, 150, 136, 0.9)", // Teal
  Education: "rgba(103, 58, 183, 0.9)", // Deep Purple
  Personal: "rgba(121, 85, 72, 0.9)", // Brown
  Debt: "rgba(244, 67, 54, 0.9)", // Red
  Savings: "rgba(76, 175, 80, 0.9)", // Green
}

const ChartComponent = ({ data, type, chartId = "income-distribution-chart" }) => {
  const chartRef = useRef(null)
  const containerRef = useRef(null)

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

  // Assign consistent colors to categories
  const backgroundColors = groupedData.map((item) => {
    // Use predefined color if available, otherwise use a fallback color
    return CATEGORY_COLORS[item.category] || "rgba(156, 156, 156, 0.9)" // Gray fallback color
  })

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
            const percentage = ((value / totalValue) * 100).toFixed(1)
            return `${label}: $${value.toFixed(2)} (${percentage}%)`
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
