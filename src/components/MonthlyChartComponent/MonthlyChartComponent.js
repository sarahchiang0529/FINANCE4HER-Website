"use client"

import { useEffect, useRef, useState } from "react"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import "./MonthlyChartComponent.css"

// Register only the necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

// Unregister any existing plugins with IDs that might contain "centerText"
// This ensures we don't have any leftover plugins from previous implementations
Object.keys(ChartJS.registry.plugins.items).forEach((key) => {
  if (key.toLowerCase().includes("centertext") || key.toLowerCase().includes("monthlytext")) {
    ChartJS.unregister(ChartJS.registry.plugins.items[key])
  }
})

// Define consistent colors for each category - same as in ChartComponent
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

const MonthlyChartComponent = ({ data, month }) => {
  const chartRef = useRef(null)
  const containerRef = useRef(null)
  // Store the month abbreviation in component state
  const [monthAbbr, setMonthAbbr] = useState("---")

  // Calculate month abbreviation on mount and when month changes
  useEffect(() => {
    if (month && month instanceof Date && !isNaN(month.getTime())) {
      const abbr = month.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
      setMonthAbbr(abbr)
    } else {
      console.error("Invalid month date:", month)
      setMonthAbbr("---")
    }
  }, [month])

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

  // Calculate total for percentage in tooltip
  const totalValue = groupedData.reduce((acc, item) => acc + item.value, 0)

  // Assign consistent colors to categories - same logic as in ChartComponent
  const backgroundColors = groupedData.map((item) => {
    // Use predefined color if available, otherwise use a fallback color
    return CATEGORY_COLORS[item.category] || "rgba(156, 156, 156, 0.9)" // Gray fallback color
  })

  // Chart data
  const chartData = {
    labels: groupedData.map((item) => item.category),
    datasets: [
      {
        data: groupedData.map((item) => item.value),
        backgroundColor: backgroundColors,
        borderColor: "white",
        borderWidth: 2,
      },
    ],
  }

  // Generate a unique chart ID based on the month
  const chartId = `monthly-chart-${
    month instanceof Date
      ? `${month.getMonth()}-${month.getFullYear()}-${Math.random().toString(36).substring(2, 9)}`
      : `default-${Math.random().toString(36).substring(2, 9)}`
  }`

  // Chart options - explicitly disable any plugins that might add text
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 0,
    },
    plugins: {
      legend: {
        display: false, // Hide legend
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
    cutout: "75%", // Increase donut hole size to better fit the month text
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
    <div className="chart-wrapper monthly-chart-wrapper" ref={containerRef}>
      <div className="chart-container">
        <Pie ref={chartRef} data={chartData} options={options} id={chartId} />
        {/* Overlay the month abbreviation directly in the DOM instead of using Chart.js plugins */}
        <div className="month-abbreviation-overlay">{monthAbbr}</div>
      </div>
    </div>
  )
}

export default MonthlyChartComponent