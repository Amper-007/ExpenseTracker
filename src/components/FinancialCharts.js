// src/components/FinancialCharts.js
import { Pie, Bar } from "react-chartjs-2";

export const CategoryPieChart = ({ income, expenses }) => {
  const data = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        data: [income, expenses],
        backgroundColor: ["#4CAF50", "#F44336"],
      },
    ],
  };

  return <Pie data={data} />;
};

export const CategoryBarChart = ({ categories }) => {
  const data = {
    labels: Object.keys(categories),
    datasets: [
      {
        label: "Amount",
        data: Object.values(categories),
        backgroundColor: "#2196F3",
      },
    ],
  };

  return <Bar data={data} />;
};
