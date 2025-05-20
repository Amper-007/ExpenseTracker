import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Balance from "./Balance";
import IncomeForm from "./IncomeForm";
import IncomeList from "./IncomeList";
import ExpenseForm from "./ExpenseForm";
import ExpenseList from "./ExpenseList";
import { AuthContext } from "../contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";

function Dashboard({ dark, setDark }) {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const handleLogout = () => {
    import("../firebase-config").then(({ auth }) => {
      auth.signOut().then(() => {
        navigate("/");
      });
    });
  };

  return (
    <>
      <nav className="navbar navbar-dark bg-primary mb-4 shadow">
        <div className="container d-flex justify-content-between align-items-center">
          <span className="navbar-brand">
            <i className="bi bi-cash-stack me-2"></i>
            Expense Tracker
          </span>
          <div className="d-flex align-items-center">
            <div className="dropdown me-3">
              <button
                className="btn btn-outline-light dropdown-toggle"
                type="button"
                id="reportsDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Financial Reports
              </button>
              <ul
                className="dropdown-menu dropdown-menu-end"
                aria-labelledby="reportsDropdown"
              >
                <li>
                  <Link className="dropdown-item" to="/reports?type=monthly">
                    Monthly Report
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/reports?type=quarterly">
                    Quarterly Report
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/reports?type=annual">
                    Annual Report
                  </Link>
                </li>
              </ul>
            </div>
            <span className="text-light me-3">
              {currentUser?.displayName || currentUser?.email}
            </span>
            <button className="btn btn-outline-light" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
            {/* THEME TOGGLE BUTTON */}
            <ThemeToggle dark={dark} setDark={setDark} />
          </div>
        </div>
      </nav>
      <div className="container">
        <div className="mb-4">
          <h5 className="text-muted">
            Welcome,{" "}
            <span className="text-primary">
              {currentUser?.displayName || currentUser?.email}
            </span>
          </h5>
        </div>
        <div className="mb-4" style={{ maxWidth: 220 }}>
          <label htmlFor="monthPicker" className="form-label">
            Select Month
          </label>
          <input
            type="month"
            id="monthPicker"
            className="form-control"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
        <Balance selectedMonth={selectedMonth} />
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card shadow-sm h-100 report-card">
              <div className="card-header bg-white">
                <h5 className="card-title mb-0">Add Income</h5>
              </div>
              <div className="card-body">
                <IncomeForm />
                <IncomeList selectedMonth={selectedMonth} />
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card shadow-sm h-100 report-card">
              <div className="card-header bg-white">
                <h5 className="card-title mb-0">Add Expense</h5>
              </div>
              <div className="card-body">
                <ExpenseForm />
                <ExpenseList selectedMonth={selectedMonth} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
