import { useState, useEffect, useRef } from "react"
import Chart from "chart.js/auto"

const MonthlyChartComponent = ({ month, data }) => {
  const [chartData, setChartData] = useState({ datasets: [] })
  const [monthAbbr, setMonthAbbr] = useState("---")
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  // Function to generate a unique plugin ID
  const generatePluginId = (prefix) => {
    return `${prefix}_${Math.random().toString(36).substring(2, 15)}`
  }

  useEffect(() => {
    if (data && data.length > 0) {
      // Define category-specific colors
      const categoryColors = {
        // Income categories
        Salary: "rgba(52, 144, 220, 0.7)",
        "Government Benefit": "rgba(106, 90, 205, 0.7)",
        Investments: "rgba(46, 204, 113, 0.7)",

        // Expense categories
        Food: "rgba(52, 144, 220, 0.7)",
        Transport: "rgba(46, 204, 113, 0.7)",
        Entertainment: "rgba(106, 90, 205, 0.7)",
        Shopping: "rgba(255, 159, 64, 0.7)",
        Utilities: "rgba(156, 39, 176, 0.7)",

        // Default for other categories
        Other: "rgba(156, 39, 176, 0.7)",
        default: "rgba(255, 99, 132, 0.7)",
      }

      // Assign colors based on category
      const backgroundColors = data.map((item) => categoryColors[item.category] || categoryColors.default)

      setChartData({
        labels: data.map((item) => item.category),
        datasets: [
          {
            data: data.map((item) => item.value),
            backgroundColor: backgroundColors,
            borderWidth: 0, // Set border width to 0 to remove borders
          },
        ],
      })
    }
  }, [data])

  // Calculate month abbreviation on mount and when month changes
  useEffect(() => {
    try {
      setMonthAbbr(
        month instanceof Date && !isNaN(month.getTime())
          ? month.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
          : "---",
      )
    } catch (e) {
      console.error("Invalid month date:", month)
      setMonthAbbr("---")
    }
  }, [month])

  useEffect(() => {
    const renderChart = () => {
      if (!chartRef.current) return

      const ctx = chartRef.current.getContext("2d")

      // Clean up existing chart
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      // Create center text plugin
      const centerTextPluginId = generatePluginId("monthlyCenterText")
      const centerTextPlugin = {
        id: centerTextPluginId,
        beforeDraw: (chart) => {
          const width = chart.width
          const height = chart.height
          const ctx = chart.ctx

          ctx.restore()
          const fontSize = (height / 114).toFixed(2)
          ctx.font = `${fontSize}em sans-serif`
          ctx.textBaseline = "middle"
          ctx.textAlign = "center"
          ctx.fillStyle = "#36454F" // Charcoal color

          const text = monthAbbr
          const textX = width / 2
          const textY = height / 2

          ctx.fillText(text, textX, textY)
          ctx.save()
        },
      }

      // Create chart
      chartInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: chartData,
        options: {
          cutout: "70%",
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || ""
                  const value = context.raw || 0
                  const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0)
                  const percentage = Math.round((value / total) * 100)
                  return `${label}: $${value} (${percentage}%)`
                },
              },
            },
          },
          elements: {
            arc: {
              borderWidth: 0, // Ensure no borders on arc elements
            },
          },
        },
        plugins: [centerTextPlugin],
      })
    }

    if (chartData.datasets.length > 0 && chartRef.current) {
      renderChart()
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [chartData, monthAbbr])

  return (
    <div className="monthly-chart-wrapper">
      <canvas ref={chartRef} />
    </div>
  )
}

export default MonthlyChartComponent