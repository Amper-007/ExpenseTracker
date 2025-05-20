import React from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

function Home({ dark, setDark }) {
  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div
        className="card shadow-sm"
        style={{ maxWidth: "420px", width: "100%" }}
      >
        <div className="card-body p-4">
          {/* Theme Toggle at top right */}
          <div className="position-absolute top-0 end-0 p-3">
            <ThemeToggle dark={dark} setDark={setDark} />
          </div>

          <h2 className="card-title text-primary mb-4 text-center">
            <span className="me-2">💸</span>
            Welcome to Expense Tracker
          </h2>

          <p className="text-muted text-center mb-4">
            Track your income and expenses easily, securely, and beautifully.
          </p>

          <Link to="/login" className="btn btn-primary w-100 mb-3">
            Log In
          </Link>

          <Link to="/signup" className="btn btn-outline-primary w-100">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
