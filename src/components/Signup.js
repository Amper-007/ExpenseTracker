import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { auth, googleProvider } from "../firebase-config";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to create account. Try a different email.");
    }
    setLoading(false);
  };

  // Google sign-up handler
  const handleGoogleSignUp = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (err) {
      setError("Google sign up failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="main-content" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="material-card">
        <div className="material-title" style={{ marginTop: 8 }}>
          Sign Up
        </div>
        {error && <div className="material-alert">{error}</div>}
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <label className="material-label">Full Name</label>
          <input
            type="text"
            className="material-input"
            placeholder="Enter your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            disabled={loading}
          />
          <label className="material-label">Email address</label>
          <input
            type="email"
            className="material-input"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <label className="material-label">Password</label>
          <input
            type="password"
            className="material-input"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="material-btn"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <div style={{ textAlign: "center", margin: "1rem 0 0.5rem 0", color: "var(--text-muted)" }}>
          or
        </div>
        <button
          className="material-btn secondary"
          style={{ width: "100%" }}
          onClick={handleGoogleSignUp}
          disabled={loading}
        >
          <span style={{ fontWeight: 500 }}>Sign up with Google</span>
        </button>
        <div style={{ marginTop: 16, textAlign: "center", color: "var(--text-muted)" }}>
          <span>Already have an account? </span>
          <Link to="/login" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
