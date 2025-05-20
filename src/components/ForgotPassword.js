import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase-config";
import { sendPasswordResetEmail } from "firebase/auth";

function ForgotPassword({ dark, setDark }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage("");
      setError("");
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setMessage("Check your inbox for further instructions");
    } catch (error) {
      setError("Failed to reset password. " + error.message);
    }
    setLoading(false);
  }

  return (
    <div className="main-content">
      <div className="material-card">
        <h2 className="material-title">Password Reset</h2>
        {error && <div className="material-alert">{error}</div>}
        {message && <div className="material-success">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div>
            <label className="material-label" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="material-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            disabled={loading}
            className="material-btn"
            type="submit"
            style={{ width: "100%" }}
          >
            Reset Password
          </button>
        </form>
        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <Link
            to="/login"
            className="material-btn secondary"
            style={{ width: "100%" }}
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
