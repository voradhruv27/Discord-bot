// src/App.jsx
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

export default function App() {
  const path = window.location.pathname;

  // Simple client-side router
  if (path === "/" || path === "/dashboard") {
    return <Dashboard />;
  }

  return <NotFound />;
}
