import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend);

const ChartComponent = ({ data }) => {
    const colors = [
        "rgba(75, 192, 192, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
        "rgba(255, 99, 132, 1)",
        "rgba(201, 203, 207, 1)",
        "rgba(255, 205, 86, 1)",
        "rgba(75, 192, 192, 0.5)",
        "rgba(54, 162, 235, 0.5)",
        "rgba(255, 206, 86, 0.5)",
        "rgba(153, 102, 255, 0.5)",
        "rgba(255, 159, 64, 0.5)",
        "rgba(255, 99, 132, 0.5)",
        "rgba(201, 203, 207, 0.5)",
        "rgba(255, 205, 86, 0.5)",
    ];

    const chartData = {
        labels: data.map(item => item.category),
        datasets: [
            {
                label: "Expenses",
                data: data.map(item => item.value),
                backgroundColor: data.map((_, index) => colors[index % colors.length]),
                borderColor: data.map((_, index) => colors[index % colors.length]),
                borderWidth: 1,
            },
        ],
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false, // Add this line to allow the chart to resize properly
        plugins: {
            legend: {
                position: "right",
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
            },
            title: {
                display: false,
                text: "Expenses Chart",
            },
        },
        cutout: "70%", // Increased cutout percentage to make the donut thinner
    };

    const chartContainerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
    };

    return <Pie data={chartData} options={options} />;
};

export default ChartComponent;
