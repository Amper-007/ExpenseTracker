import React, { useState, useContext } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase-config";
import { AuthContext } from "../contexts/AuthContext";

function IncomeForm() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState(""); // New: Income type
  const [source, setSource] = useState(""); // New: Income source name
  const [customDateTime, setCustomDateTime] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!currentUser) {
      setError("You must be logged in to add income.");
      return;
    }
    if (!amount || !category || !type || !source.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (parseFloat(amount) <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "income"), {
        amount: parseFloat(amount),
        category,
        type, // Save income type
        source: source.trim(), // Save income source name
        created: customDateTime
          ? Timestamp.fromDate(new Date(customDateTime))
          : serverTimestamp(),
        uid: currentUser.uid,
      });

      setAmount("");
      setCategory("");
      setType("");
      setSource("");
      setCustomDateTime("");
    } catch (err) {
      setError("Failed to add income. Please try again.");
      console.error("Add income error:", err);
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 p-4 bg-light border rounded shadow-sm"
    >
      <h4 className="mb-3 text-success">Add Income</h4>
      {error && <div className="alert alert-danger py-2">{error}</div>}

      {/* Amount */}
      <div className="mb-3">
        <label className="form-label">Amount</label>
        <input
          type="number"
          className="form-control"
          placeholder="Add money"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="0"
          step="0.01"
          disabled={loading}
        />
      </div>

      {/* Income Source Name */}
      <div className="mb-3">
        <label className="form-label">Income Source Name</label>
        <input
          type="text"
          className="form-control"
          placeholder="e.g. Company, Friend, Project"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      {/* Category */}
      <div className="mb-3">
        <label className="form-label">Category</label>
        <select
          className="form-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          disabled={loading}
        >
          <option value="">Select Category</option>
          <option value="Salary">Salary</option>
          <option value="Gift">Gift</option>
          <option value="Freelance">Freelance</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Income Type */}
      <div className="mb-3">
        <label className="form-label">Income Type</label>
        <select
          className="form-select"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          disabled={loading}
        >
          <option value="">Select Type</option>
          <option value="Online">Online</option>
          <option value="Offline">Offline</option>
        </select>
      </div>

      {/* Date & Time */}
      <div className="mb-3">
        <label className="form-label">Date & Time</label>
        <input
          type="datetime-local"
          className="form-control"
          value={customDateTime}
          onChange={(e) => setCustomDateTime(e.target.value)}
          max={new Date().toISOString().slice(0, 16)}
          disabled={loading}
        />
        <div className="form-text">
          Leave blank to use current time automatically.
        </div>
      </div>
      <button
        type="submit"
        className="btn btn-success w-100"
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Money"}
      </button>
    </form>
  );
}

export default IncomeForm;
