import React, { useEffect, useState, useContext } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase-config";
import { AuthContext } from "../contexts/AuthContext";

function Balance({ selectedMonth }) {
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (!currentUser) {
      setIncome(0);
      setExpenses(0);
      setMonthlyIncome(0);
      setMonthlyExpenses(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Use selectedMonth for monthly queries, fallback to current month
    let year, month;
    if (selectedMonth) {
      [year, month] = selectedMonth.split("-").map(Number);
    } else {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth() + 1;
    }
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 1);

    const monthStartTimestamp = Timestamp.fromDate(monthStart);
    const monthEndTimestamp = Timestamp.fromDate(monthEnd);

    // Lifetime queries
    const incomeQuery = query(
      collection(db, "income"),
      where("uid", "==", currentUser.uid)
    );
    const expensesQuery = query(
      collection(db, "expenses"),
      where("uid", "==", currentUser.uid)
    );

    // Monthly queries
    const monthlyIncomeQuery = query(
      collection(db, "income"),
      where("uid", "==", currentUser.uid),
      where("created", ">=", monthStartTimestamp),
      where("created", "<", monthEndTimestamp)
    );
    const monthlyExpensesQuery = query(
      collection(db, "expenses"),
      where("uid", "==", currentUser.uid),
      where("created", ">=", monthStartTimestamp),
      where("created", "<", monthEndTimestamp)
    );

    const unsubs = [];

    unsubs.push(
      onSnapshot(incomeQuery, (snapshot) => {
        const total = snapshot.docs.reduce(
          (sum, doc) => sum + (doc.data().amount || 0),
          0
        );
        setIncome(total);
      })
    );

    unsubs.push(
      onSnapshot(expensesQuery, (snapshot) => {
        const total = snapshot.docs.reduce(
          (sum, doc) => sum + (doc.data().amount || 0),
          0
        );
        setExpenses(total);
      })
    );

    unsubs.push(
      onSnapshot(monthlyIncomeQuery, (snapshot) => {
        const total = snapshot.docs.reduce(
          (sum, doc) => sum + (doc.data().amount || 0),
          0
        );
        setMonthlyIncome(total);
      })
    );

    unsubs.push(
      onSnapshot(monthlyExpensesQuery, (snapshot) => {
        const total = snapshot.docs.reduce(
          (sum, doc) => sum + (doc.data().amount || 0),
          0
        );
        setMonthlyExpenses(total);
      })
    );

    setLoading(false);

    return () => unsubs.forEach((unsub) => unsub());
  }, [currentUser, selectedMonth]);

  if (!currentUser) return <div className="alert alert-info">Loading...</div>;
  if (loading)
    return <div className="alert alert-info">Calculating balances...</div>;

  const overallBalance = income - expenses;
  const monthlyBalance = monthlyIncome - monthlyExpenses;

  const getBalanceClass = (balance) =>
    balance > 0
      ? "text-success"
      : balance < 0
      ? "text-danger"
      : "text-secondary";

  return (
    <div className="mb-4">
      <div className="row g-4">
        {/* Overall Balance */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h4
                className={`card-title fw-bold ${getBalanceClass(
                  overallBalance
                )}`}
              >
                Lifetime Balance: {"\u20B9"}
                {overallBalance}
              </h4>
              <div className="d-flex justify-content-between">
                <span className="text-success">
                  Total Income: {"\u20B9"}
                  {income}
                </span>
                <span className="text-danger">
                  Total Expenses: {"\u20B9"}
                  {expenses}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Balance */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h4
                className={`card-title fw-bold ${getBalanceClass(
                  monthlyBalance
                )}`}
              >
                Monthly Balance: {"\u20B9"}
                {monthlyBalance}
              </h4>
              <div className="d-flex justify-content-between">
                <span className="text-success">
                  Monthly Income: {"\u20B9"}
                  {monthlyIncome}
                </span>
                <span className="text-danger">
                  Monthly Expenses: {"\u20B9"}
                  {monthlyExpenses}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Balance;
