import React, { useState, useContext } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase-config";
import { AuthContext } from "../contexts/AuthContext";

function ExpenseForm() {
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState(""); // New: Expense type
  const [customDateTime, setCustomDateTime] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!currentUser) {
      setError("You must be logged in to add expenses.");
      return;
    }
    if (!amount || !name.trim() || !category || !type) {
      setError("Please fill in all fields.");
      return;
    }
    if (parseFloat(amount) <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "expenses"), {
        amount: parseFloat(amount),
        name: name.trim(),
        category,
        type, // Save expense type
        created: customDateTime
          ? Timestamp.fromDate(new Date(customDateTime))
          : serverTimestamp(),
        uid: currentUser.uid,
      });

      setAmount("");
      setName("");
      setCategory("");
      setType("");
      setCustomDateTime("");
    } catch (err) {
      setError("Failed to add expense. Please try again.");
      console.error("Add expense error:", err);
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 p-4 bg-light border rounded shadow-sm"
    >
      <h4 className="mb-3" style={{ color: "red" }}>
        Add Expense
      </h4>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {/* Amount */}
      <div className="mb-3">
        <label className="form-label">Amount</label>
        <input
          type="number"
          className="form-control"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="0"
          step="0.01"
          disabled={loading}
        />
      </div>

      {/* Expense Name */}
      <div className="mb-3">
        <label className="form-label">Expense Name</label>
        <input
          type="text"
          className="form-control"
          placeholder="Expense name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Shopping">Shopping</option>
          <option value="Bills">Bills</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Health">Health</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Expense Type */}
      <div className="mb-3">
        <label className="form-label">Expense Type</label>
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
      <button type="submit" className="btn btn-danger w-100" disabled={loading}>
        {loading ? "Adding..." : "Add Expense"}
      </button>
    </form>
  );
}

export default ExpenseForm;
