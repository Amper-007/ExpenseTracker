// src/components/ReportFilters.js
import { useState, useMemo } from "react";

export default function ReportFilters({ onGenerate }) {
  const [reportType, setReportType] = useState("monthly");
  const [selectedPeriod, setSelectedPeriod] = useState("");

  const periodOptions = useMemo(() => {
    // Generate options based on report type
    const now = new Date();
    const options = [];

    if (reportType === "monthly") {
      for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), i, 1);
        options.push({
          value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`,
          label: date.toLocaleString("default", {
            month: "long",
            year: "numeric",
          }),
        });
      }
    }
    // Add similar logic for quarterly/annual

    return options;
  }, [reportType]);

  return (
    <div className="report-filters">
      {/* Dropdowns for report type and period */}
      <select
        value={reportType}
        onChange={(e) => setReportType(e.target.value)}
      >
        <option value="monthly">Monthly</option>
        <option value="quarterly">Quarterly</option>
        <option value="annual">Annual</option>
      </select>

      <select
        value={selectedPeriod}
        onChange={(e) => setSelectedPeriod(e.target.value)}
      >
        {periodOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button onClick={() => onGenerate(reportType, selectedPeriod)}>
        Generate Report
      </button>
    </div>
  );
}
