import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";

// Helper function for date range calculations
function getDateRange(periodType, periodValue) {
  let startDate, endDate;

  switch (periodType) {
    case "monthly":
      const [year, month] = periodValue.split("-");
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 1);
      break;
    case "quarterly":
      const [qYear, quarter] = periodValue.split("-Q");
      const quarterStartMonth = (parseInt(quarter) - 1) * 3;
      startDate = new Date(qYear, quarterStartMonth, 1);
      endDate = new Date(qYear, quarterStartMonth + 3, 1);
      break;
    case "annual":
      const annualYear = parseInt(periodValue, 10);
      startDate = new Date(annualYear, 0, 1);
      endDate = new Date(annualYear + 1, 0, 1);
      break;
    default:
      throw new Error("Invalid periodType");
  }

  return { startDate, endDate };
}

// Main report generation (aggregated data)
export async function generateReport(db, uid, periodType, periodValue) {
  const { startDate, endDate } = getDateRange(periodType, periodValue);
  const start = Timestamp.fromDate(startDate);
  const end = Timestamp.fromDate(endDate);

  const [incomeSnapshot, expenseSnapshot] = await Promise.all([
    getDocs(
      query(
        collection(db, "income"),
        where("uid", "==", uid),
        where("created", ">=", start),
        where("created", "<", end)
      )
    ),
    getDocs(
      query(
        collection(db, "expenses"),
        where("uid", "==", uid),
        where("created", ">=", start),
        where("created", "<", end)
      )
    ),
  ]);

  return {
    totalIncome: incomeSnapshot.docs.reduce(
      (sum, doc) => sum + (doc.data().amount || 0),
      0
    ),
    totalExpenses: expenseSnapshot.docs.reduce(
      (sum, doc) => sum + (doc.data().amount || 0),
      0
    ),
    incomeByCategory: groupByCategory(incomeSnapshot),
    expenseByCategory: groupByCategory(expenseSnapshot),
  };
}

// Detailed data export (raw transactions)
export async function fetchDetailedData(db, uid, periodType, periodValue) {
  const { startDate, endDate } = getDateRange(periodType, periodValue);
  const start = Timestamp.fromDate(startDate);
  const end = Timestamp.fromDate(endDate);

  const [incomeSnapshot, expenseSnapshot] = await Promise.all([
    getDocs(
      query(
        collection(db, "income"),
        where("uid", "==", uid),
        where("created", ">=", start),
        where("created", "<", end)
      )
    ),
    getDocs(
      query(
        collection(db, "expenses"),
        where("uid", "==", uid),
        where("created", ">=", start),
        where("created", "<", end)
      )
    ),
  ]);

  return {
    income: incomeSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    expenses: expenseSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })),
  };
}

// Helper function for category grouping
function groupByCategory(snapshot) {
  return snapshot.docs.reduce((acc, doc) => {
    const data = doc.data();
    const category = data.category || "Uncategorized";
    acc[category] = (acc[category] || 0) + (data.amount || 0);
    return acc;
  }, {});
}
