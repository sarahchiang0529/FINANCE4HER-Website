"use client"

import { useEffect, useRef } from "react"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend } from "chart.js"
import "../stylesheets/ChartComponent.css"

ChartJS.register(CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend)

const ChartComponent = ({ data, type }) => {
  const chartRef = useRef(null)
  const containerRef = useRef(null)

  // Define colors as an array
  const colors = [
    "rgba(77, 192, 181, 1)", // teal
    "rgba(52, 144, 220, 1)", // blue
    "rgba(246, 173, 85, 1)", // yellow/orange
    "rgba(159, 122, 234, 1)", // purple
    "rgba(245, 101, 101, 1)", // red/orange
  ]

  // Group data
  const groupedData = data.reduce((acc, item) => {
    const existingCategory = acc.find((g) => g.category === item.category)
    if (existingCategory) {
      existingCategory.value += item.value
    } else {
      acc.push({ category: item.category, value: item.value })
    }
    return acc
  }, [])

  const totalValue = groupedData.reduce((acc, item) => acc + item.value, 0)

  // Labels
  const chartLabel = type === "income" ? "Income" : "Expenses"
  const totalLabel = type === "income" ? "Total Income" : "Total Expenses"

  // Center text plugin
  const centerTextPlugin = {
    id: "centerText",
    beforeDraw: (chart) => {
      const { width, height, ctx } = chart
      ctx.restore()
      const centerY = height / 2

      // Title
      ctx.font = "14px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "#666"
      ctx.fillText(totalLabel, width / 2, centerY - 20)

      // Amount
      ctx.font = "bold 28px Inter, sans-serif"
      ctx.fillStyle = "#333"
      ctx.fillText(`$${totalValue.toFixed(2)}`, width / 2, centerY + 10)
      ctx.save()
    },
  }

  // Unregister existing plugin
  const existingPlugin = ChartJS.registry.plugins.get("centerText")
  if (existingPlugin) {
    ChartJS.unregister(existingPlugin)
  }
  // Register new plugin
  ChartJS.register(centerTextPlugin)

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
    maintainAspectRatio: false,
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
        <Pie ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  )
}

export default ChartComponent