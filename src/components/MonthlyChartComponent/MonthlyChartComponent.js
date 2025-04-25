"use client"

import { useEffect, useRef, useState } from "react"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import "./MonthlyChartComponent.css"

// Register only the necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

// Unregister any existing plugins with IDs that might contain "centerText"
// This ensures we don't have any leftover plugins from previous implementations
Object.keys(ChartJS.registry.plugins.items).forEach(key => {
  if (key.toLowerCase().includes('centertext') || key.toLowerCase().includes('monthlytext')) {
    ChartJS.unregister(ChartJS.registry.plugins.items[key])
  }
})

const MonthlyChartComponent = ({ data, month }) => {
  const chartRef = useRef(null)
  const containerRef = useRef(null)
  // Store the month abbreviation in component state
  const [monthAbbr, setMonthAbbr] = useState("---")

  // Define colors as an array
  const colors = [
    "rgba(77, 192, 181, 1)", // teal
    "rgba(52, 144, 220, 1)", // blue
    "rgba(246, 173, 85, 1)", // yellow/orange
    "rgba(159, 122, 234, 1)", // purple
    "rgba(245, 101, 101, 1)", // red/orange
  ]

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

  // Assign colors to categories (sequentially from the array)
  const backgroundColors = groupedData.map((_, index) => colors[index % colors.length])

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
            return `${label}: ${value.toFixed(2)}`
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
