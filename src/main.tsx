import React from "react";
import ReactDOM from "react-dom/client";
// Import CSS in the correct order - base CSS first, then app-specific styles
import "./index.css";
import "./App.css";
import App from "./App";
import { AuthContextProvider } from "./contexts/Auth/AuthContext"; // Adjust path as needed

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <App />
    </AuthContextProvider>
  </React.StrictMode>
);
