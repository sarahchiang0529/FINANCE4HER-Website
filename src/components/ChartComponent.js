"use client"
import { Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend)

const ChartComponent = ({ data, type }) => {
  // Colors
  const colors = [
    "rgba(77, 192, 181, 1)",  // teal
    "rgba(52, 144, 220, 1)",  // blue
    "rgba(246, 173, 85, 1)",  // yellow/orange
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
      ctx.fillText(`$${totalValue.toFixed(2)}`, width / 2, centerY + 20)
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

  // Chart data
  const chartData = {
    labels: groupedData.map((item) => item.category),
    datasets: [
      {
        label: chartLabel,
        data: groupedData.map((item) => item.value),
        backgroundColor: groupedData.map((_, i) => colors[i % colors.length]),
        borderColor: "white",
        borderWidth: 2,
      },
    ],
  }

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Important for filling container height
    layout: {
      padding: 0, // Remove extra padding so it doesn't shrink
    },
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

  return (
    <div className="chart-wrapper">
      <Pie data={chartData} options={options} />
    </div>
  )
}

export default ChartComponent