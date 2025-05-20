// src/utils/reportGenerator.js
import { collection, query, where, getDocs } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

export async function generateReport(db, uid, periodType, periodValue) {
  let startDate, endDate;

  // Calculate date range based on period type
  switch (periodType) {
    case "monthly":
      const [year, month] = periodValue.split("-");
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 1);
      break;
    case "quarterly":
      // Add quarterly calculation
      break;
    case "annual":
      // Add annual calculation
      break;
  }

  // Convert to Firestore Timestamps
  const start = Timestamp.fromDate(startDate);
  const end = Timestamp.fromDate(endDate);

  // Fetch data
  const incomeSnapshot = await getDocs(
    query(
      collection(db, "income"),
      where("uid", "==", uid),
      where("created", ">=", start),
      where("created", "<", end)
    )
  );

  const expenseSnapshot = await getDocs(
    query(
      collection(db, "expenses"),
      where("uid", "==", uid),
      where("created", ">=", start),
      where("created", "<", end)
    )
  );

  // Process data
  const reportData = {
    totalIncome: incomeSnapshot.docs.reduce(
      (sum, doc) => sum + doc.data().amount,
      0
    ),
    totalExpenses: expenseSnapshot.docs.reduce(
      (sum, doc) => sum + doc.data().amount,
      0
    ),
    incomeByCategory: groupByCategory(incomeSnapshot),
    expenseByCategory: groupByCategory(expenseSnapshot),
  };

  return reportData;
}

function groupByCategory(snapshot) {
  return snapshot.docs.reduce((acc, doc) => {
    const category = doc.data().category;
    acc[category] = (acc[category] || 0) + doc.data().amount;
    return acc;
  }, {});
}
