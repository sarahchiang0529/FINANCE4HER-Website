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

// Register chart components
ChartJS.register(CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend)

// Center text plugin
const centerTextPlugin = {
  id: "centerText",
  afterDraw: (chart) => {
    const { width, height, ctx } = chart;
    const centerY = height / 2;

    const total = chart.config.data.datasets[0].data.reduce((a, b) => a + b, 0);
    const totalLabel = chart.config.options.plugins.centerText?.label || "Total";
    const displayValue = `$${total.toFixed(2)}`;

    ctx.save();
    ctx.font = "14px Inter, sans-serif";
    ctx.fillStyle = "#666";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(totalLabel, width / 2, centerY - 20);

    ctx.font = "bold 28px Inter, sans-serif";
    ctx.fillStyle = "#333";
    ctx.fillText(displayValue, width / 2, centerY + 20);
    ctx.restore();
  }
};

// Register plugin once
if (!ChartJS.registry.plugins.get("centerText")) {
  ChartJS.register(centerTextPlugin);
}

const ChartComponent = ({ data, type }) => {
  const colors = [
    "rgba(77, 192, 181, 1)",
    "rgba(52, 144, 220, 1)",
    "rgba(246, 173, 85, 1)",
    "rgba(159, 122, 234, 1)",
    "rgba(245, 101, 101, 1)",
  ];

  const groupedData = data.reduce((acc, item) => {
    const existingCategory = acc.find((g) => g.category === item.category);
    if (existingCategory) {
      existingCategory.value += item.value;
    } else {
      acc.push({ category: item.category, value: item.value });
    }
    return acc;
  }, []);

  const chartLabel = type === "income" ? "Income" : "Expenses";

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
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    layout: { padding: 0 },
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
            const label = ctx.label || "";
            const value = ctx.raw || 0;
            return `${label}: $${value.toFixed(2)}`;
          },
        },
      },
      centerText: {
        label: type === "income" ? "Total Income" : "Total Expenses",
      },
    },
  };

  return (
    <div className="chart-wrapper">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default ChartComponent;
