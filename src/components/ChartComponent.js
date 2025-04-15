"use client"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend)

const ChartComponent = ({ data, type }) => {
  // Colors that match the image
  const colors = [
    "rgba(77, 192, 181, 1)", // teal
    "rgba(52, 144, 220, 1)", // blue
    "rgba(246, 173, 85, 1)", // yellow/orange
    "rgba(159, 122, 234, 1)", // purple
    "rgba(245, 101, 101, 1)", // red/orange
  ]

  // Group income/expenses by category
  const groupedData = data.reduce((acc, item) => {
    const existingCategory = acc.find((group) => group.category === item.category)
    if (existingCategory) {
      existingCategory.value += item.value
    } else {
      acc.push({ category: item.category, value: item.value })
    }
    return acc
  }, [])

  const totalValue = groupedData.reduce((acc, item) => acc + item.value, 0)

  // Determine label based on type
  const chartLabel = type === "income" ? "Income" : "Expenses"
  const totalLabel = type === "income" ? "Total Income" : "Total Expenses"

  // Create a new plugin instance for each render to ensure it uses the current totalLabel
  const centerTextPlugin = {
    id: "centerText",
    beforeDraw: (chart) => {
      const { width, height, ctx } = chart
      ctx.restore()

      // Calculate vertical center
      const centerY = height / 2

      // Add total label text
      ctx.font = "14px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "#666"
      ctx.fillText(totalLabel, width / 2, centerY - 20)

      // Add dollar amount
      ctx.font = "bold 28px Inter, sans-serif"
      ctx.fillStyle = "#333"
      ctx.fillText(`$${totalValue.toFixed(2)}`, width / 2, centerY + 20)

      ctx.save()
    },
  }

  // Unregister any existing centerText plugin to avoid duplicates
  const existingPlugin = ChartJS.registry.plugins.get("centerText")
  if (existingPlugin) {
    ChartJS.unregister(existingPlugin)
  }

  // Register the new plugin
  ChartJS.register(centerTextPlugin)

  const chartData = {
    labels: groupedData.map((item) => item.category),
    datasets: [
      {
        label: chartLabel,
        data: groupedData.map((item) => item.value),
        backgroundColor: groupedData.map((_, index) => colors[index % colors.length]),
        borderColor: "white",
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "center",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 8,
          boxHeight: 8,
          padding: 15,
          color: "#333",
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || ""
            const value = context.raw || 0
            return `${label}: $${value.toFixed(2)}`
          },
        },
      },
    },
    cutout: "70%", // Makes it a donut chart with a large center
    layout: {
      padding: 20,
    },
  }

  return (
    <div className="chart-wrapper">
      <Pie data={chartData} options={options} />
    </div>
  )
}

export default ChartComponent