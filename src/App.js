import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import ForgotPassword from "./components/ForgotPassword";
import UpdateProfile from "./components/UpdateProfile";
import Footer from "./components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function App() {
  const [dark, setDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  useEffect(() => {
    if (dark) {
      document.body.classList.add("bg-dark", "text-light");
    } else {
      document.body.classList.remove("bg-dark", "text-light");
    }
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <Router>
      <AuthProvider>
        <div
          className={`d-flex flex-column min-vh-100 ${
            dark ? "bg-dark text-light" : "bg-light"
          }`}
        >
          <div className="flex-grow-1">
            <Routes>
              <Route
                path="/"
                element={<Home dark={dark} setDark={setDark} />}
              />
              <Route
                path="/login"
                element={<Login dark={dark} setDark={setDark} />}
              />
              <Route
                path="/signup"
                element={<Signup dark={dark} setDark={setDark} />}
              />
              <Route
                path="/forgot-password"
                element={<ForgotPassword dark={dark} setDark={setDark} />}
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard dark={dark} setDark={setDark} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/update-profile"
                element={
                  <PrivateRoute>
                    <UpdateProfile dark={dark} setDark={setDark} />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
