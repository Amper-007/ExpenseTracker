import React from "react";

export default function ThemeToggle({ dark, setDark }) {
  return (
    <button
      className="btn btn-outline-light ms-2 d-flex align-items-center justify-content-center"
      onClick={() => setDark((d) => !d)}
      title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      type="button"
      style={{ width: "40px", height: "40px", padding: "0" }}
    >
      {dark ? (
        <i className="bi bi-brightness-high-fill fs-5"></i>
      ) : (
        <i className="bi bi-moon-fill fs-5"></i>
      )}
    </button>
  );
}
