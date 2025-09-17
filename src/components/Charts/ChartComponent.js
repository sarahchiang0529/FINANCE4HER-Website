import { useEffect, useRef, useState } from "react"
import Chart from "chart.js/auto"

const ChartComponent = ({ data, chartType = "pie", options = {}, plugins = [], isIncome = false }) => {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const [chartHeight, setChartHeight] = useState("400px")

  // Use Funnel Display font to match the rest of the page
  const primaryFont = "Funnel Display"

  useEffect(() => {
    // Function to render the chart
    const renderChart = () => {
      if (!chartRef.current) return

      const chartCanvas = chartRef.current.getContext("2d")

      // Clean up any existing chart
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      // Group data by category
      const groupedData = data
        ? data.reduce((acc, item) => {
            const idx = acc.findIndex((g) => g.category === item.category)
            if (idx >= 0) acc[idx].value += item.value
            else acc.push({ category: item.category, value: item.value })
            return acc
          }, [])
        : []

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
      const backgroundColors = groupedData.map((item) => categoryColors[item.category] || categoryColors.default)

      // Prepare chart data
      const chartData = {
        labels: groupedData.map((item) => item.category),
        datasets: [
          {
            label: "Amount",
            data: groupedData.map((item) => item.value),
            backgroundColor: backgroundColors,
            borderWidth: 0, // Remove borders
          },
        ],
      }

      // Calculate total for center text
      const total = groupedData.reduce((sum, item) => sum + item.value, 0)

      // Create center text plugin
      const centerTextPlugin = {
        id: "centerText",
        beforeDraw: (chart) => {
          const width = chart.width
          const height = chart.height
          const ctx = chart.ctx

          ctx.restore()

          // Draw "Total Income/Expense" text
          ctx.font = `bold 18px ${primaryFont}, sans-serif`
          ctx.textBaseline = "middle"
          ctx.textAlign = "center"
          ctx.fillStyle = "#333" // Changed to dark grey

          const text = isIncome ? "Total Income" : "Total Expense"
          ctx.fillText(text, width / 2, height / 2 - 10)

          // Draw total amount
          ctx.font = `bold 28px ${primaryFont}, sans-serif`
          ctx.fillStyle = "#333" // Changed to dark grey
          ctx.fillText(`$${total.toFixed(2)}`, width / 2, height / 2 + 20)

          ctx.save()
        },
      }

      // Default options based on chart type
      const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%", // Add cutout percentage for doughnut chart
        plugins: {
          legend: {
            display: false, // Hide the legend
          },
          title: {
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
        layout: {
          padding: 20,
        },
        elements: {
          arc: {
            borderWidth: 0, // Remove borders
          },
        },
      }

      // Merge default options with provided options
      const mergedOptions = { ...defaultOptions, ...options }

      // Create the chart - always use doughnut regardless of chartType prop
      chartInstance.current = new Chart(chartCanvas, {
        type: "doughnut",
        data: chartData,
        options: mergedOptions,
        plugins: [centerTextPlugin, ...plugins],
      })
    }

    // Render the chart when component mounts and when data changes
    if (data && data.length > 0) {
      renderChart()
    }

    // Cleanup function to destroy the chart when the component unmounts
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, chartType, options, plugins, isIncome])

  return (
    <div className="chart-wrapper" style={{ height: chartHeight }}>
      <canvas ref={chartRef} />
    </div>
  )
}

export default ChartComponent