import React, { useEffect, useState, useContext } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { generateReport, fetchDetailedData } from "../utils/reportGenerator";
import { db } from "../firebase-config";
import { AuthContext } from "../contexts/AuthContext";
import { Chart, registerables } from "chart.js";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Register Chart.js components
Chart.register(...registerables);

function Reports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useContext(AuthContext);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const reportType = searchParams.get("type") || "monthly";
  const period = searchParams.get("period") || "";

  // Helper to get default period if none is selected
  const getDefaultPeriod = (type) => {
    const now = new Date();
    switch (type) {
      case "quarterly":
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        return `${now.getFullYear()}-Q${quarter}`;
      case "annual":
        return `${now.getFullYear()}`;
      default: // monthly
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
    }
  };

  // Period selection handler
  const handlePeriodChange = (newPeriod) => {
    setSearchParams({ type: reportType, period: newPeriod });
  };

  // Render period picker based on report type
  const renderPeriodPicker = () => {
    const now = new Date();
    const currentYear = now.getFullYear();

    if (reportType === "monthly") {
      return (
        <input
          type="month"
          className="form-control"
          value={period || getDefaultPeriod("monthly")}
          onChange={(e) => handlePeriodChange(e.target.value)}
          max={`${currentYear}-${String(now.getMonth() + 1).padStart(2, "0")}`}
        />
      );
    }

    if (reportType === "quarterly") {
      // Show last 10 years for selection
      const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
      const selectedYear = period.split("-")[0] || currentYear;
      const selectedQuarter =
        period.split("-")[1] || `Q${Math.floor(now.getMonth() / 3) + 1}`;
      return (
        <div className="d-flex gap-2">
          <select
            className="form-select"
            style={{ width: "auto" }}
            value={selectedYear}
            onChange={(e) =>
              handlePeriodChange(`${e.target.value}-${selectedQuarter}`)
            }
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            className="form-select"
            style={{ width: "auto" }}
            value={period || getDefaultPeriod("quarterly")}
            onChange={(e) => {
              const q = e.target.value.split("-")[1];
              handlePeriodChange(`${selectedYear}-${q}`);
            }}
          >
            <option value={`${selectedYear}-Q1`}>Q1 (Jan-Mar)</option>
            <option value={`${selectedYear}-Q2`}>Q2 (Apr-Jun)</option>
            <option value={`${selectedYear}-Q3`}>Q3 (Jul-Sep)</option>
            <option value={`${selectedYear}-Q4`}>Q4 (Oct-Dec)</option>
          </select>
        </div>
      );
    }

    if (reportType === "annual") {
      return (
        <input
          type="number"
          className="form-control"
          value={period || currentYear}
          min={currentYear - 10}
          max={currentYear}
          onChange={(e) => handlePeriodChange(e.target.value)}
        />
      );
    }
  };

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const data = await generateReport(
          db,
          currentUser.uid,
          reportType,
          period || getDefaultPeriod(reportType)
        );
        setReportData(data);
      } catch (err) {
        setError("Failed to generate report. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchReportData();
    }
  }, [reportType, period, currentUser]);

  const handleDownloadExcel = async () => {
    try {
      setIsDownloading(true);
      const detailedData = await fetchDetailedData(
        db,
        currentUser.uid,
        reportType,
        period || getDefaultPeriod(reportType)
      );

      // Create worksheets
      const incomeWS = XLSX.utils.json_to_sheet(
        detailedData.income.map((item) => ({
          Date: item.created.toDate().toLocaleString(),
          Category: item.category,
          Amount: item.amount,
          Type: item.type || "N/A",
          Description: item.name || "N/A",
        }))
      );

      const expenseWS = XLSX.utils.json_to_sheet(
        detailedData.expenses.map((item) => ({
          Date: item.created.toDate().toLocaleString(),
          Category: item.category,
          Amount: item.amount,
          Type: item.type || "N/A",
          Description: item.name || "N/A",
        }))
      );

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, incomeWS, "Income");
      XLSX.utils.book_append_sheet(wb, expenseWS, "Expenses");

      // Generate file
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const filename = `Financial_Report_${reportType}_${
        period || getDefaultPeriod(reportType)
      }.xlsx`;
      saveAs(new Blob([wbout], { type: "application/octet-stream" }), filename);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to generate Excel report. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) return <div className="text-center my-5">Loading report...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  // Handle empty data
  const incomeLabels = Object.keys(reportData.incomeByCategory);
  const expenseLabels = Object.keys(reportData.expenseByCategory);

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Header Section with Controls */}
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-3">
              <Link to="/dashboard" className="btn btn-primary">
                <i className="bi bi-speedometer2 me-2"></i>
                Dashboard
              </Link>
              <h2 className="mb-0">
                {reportType.charAt(0).toUpperCase() + reportType.slice(1)}{" "}
                Financial Report
              </h2>
            </div>
            <button
              className="btn btn-success"
              onClick={handleDownloadExcel}
              disabled={!reportData || isDownloading}
            >
              {isDownloading ? "Generating..." : "Download Excel Report"}
            </button>
          </div>
          {/* Period Selector */}
          <div className="row g-3 align-items-center mb-4">
            <div className="col-auto">
              <label className="col-form-label">Select Period:</label>
            </div>
            <div className="col-auto">{renderPeriodPicker()}</div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100 report-card">
            <div className="card-body">
              <h5 className="card-title">Total Income</h5>
              <h3 className="text-success">₹{reportData.totalIncome}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm h-100 report-card">
            <div className="card-body">
              <h5 className="card-title">Total Expenses</h5>
              <h3 className="text-danger">₹{reportData.totalExpenses}</h3>
            </div>
          </div>
        </div>

        {/* Income vs Expenses Pie Chart */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">
                Income vs Expenses Distribution
              </h5>
              <div className="chart-container">
                <Pie
                  data={{
                    labels: ["Income", "Expenses"],
                    datasets: [
                      {
                        data: [
                          reportData.totalIncome,
                          reportData.totalExpenses,
                        ],
                        backgroundColor: ["#4CAF50", "#F44336"],
                        hoverOffset: 4,
                      },
                    ],
                  }}
                  options={{
                    plugins: {
                      legend: { position: "bottom" },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown Charts */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-4">Income by Category</h5>
              <div className="chart-container">
                {incomeLabels.length === 0 ? (
                  <div className="text-muted text-center pt-5">
                    No income data
                  </div>
                ) : (
                  <Bar
                    data={{
                      labels: incomeLabels,
                      datasets: [
                        {
                          label: "Income",
                          data: Object.values(reportData.incomeByCategory),
                          backgroundColor: "#4CAF50",
                        },
                      ],
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { title: { display: true, text: "Category" } },
                        y: { title: { display: true, text: "Amount (₹)" } },
                      },
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-4">Expenses by Category</h5>
              <div className="chart-container">
                {expenseLabels.length === 0 ? (
                  <div className="text-muted text-center pt-5">
                    No expense data
                  </div>
                ) : (
                  <Bar
                    data={{
                      labels: expenseLabels,
                      datasets: [
                        {
                          label: "Expenses",
                          data: Object.values(reportData.expenseByCategory),
                          backgroundColor: "#F44336",
                        },
                      ],
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { title: { display: true, text: "Category" } },
                        y: { title: { display: true, text: "Amount (₹)" } },
                      },
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
