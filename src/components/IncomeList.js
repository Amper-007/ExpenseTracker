import React, { useEffect, useState, useContext } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase-config";
import { AuthContext } from "../contexts/AuthContext";

function IncomeList() {
  const [incomeList, setIncomeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    // Calculate start and end of selected month
    const [year, month] = selectedMonth.split("-");
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 1);

    // Convert to Firestore Timestamps
    const monthStartTimestamp = Timestamp.fromDate(monthStart);
    const monthEndTimestamp = Timestamp.fromDate(monthEnd);

    const q = query(
      collection(db, "income"),
      where("uid", "==", currentUser.uid),
      where("created", ">=", monthStartTimestamp),
      where("created", "<", monthEndTimestamp),
      orderBy("created", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setIncomeList(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setLoading(false);
      },
      (err) => {
        setError("Failed to load income data.");
        setLoading(false);
        console.error("Income list error:", err);
      }
    );

    return () => unsubscribe();
  }, [currentUser, selectedMonth]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this income entry?")) {
      try {
        await deleteDoc(doc(db, "income", id));
      } catch (err) {
        setError("Failed to delete income entry.");
        console.error("Delete error:", err);
      }
    }
  };

  if (!currentUser)
    return (
      <div className="alert alert-info">Please log in to view income.</div>
    );
  if (loading) return <div className="alert alert-info">Loading income...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="mb-3" style={{ maxWidth: 200 }}>
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

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-0">
          <h5 className="mb-0">Income History</h5>
        </div>
        <div className="card-body p-0">
          <ul className="list-group list-group-flush">
            {incomeList.length === 0 ? (
              <li className="list-group-item text-center py-4 text-muted">
                No income entries yet!
              </li>
            ) : (
              incomeList.map((item) => (
                <li
                  key={item.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div className="me-3">
                    <span className="fw-semibold text-success">
                      {item.category}
                    </span>
                    <small className="text-muted d-block">
                      {item.created?.toDate
                        ? item.created.toDate().toLocaleDateString() +
                          " " +
                          item.created.toDate().toLocaleTimeString()
                        : ""}
                    </small>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="me-3">₹{item.amount}</span>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(item.id)}
                      title="Delete"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-trash"
                        viewBox="0 0 16 16"
                      >
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default IncomeList;
