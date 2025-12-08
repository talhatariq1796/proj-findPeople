import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { clearSession, ensureFreshToken } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState("checking");
  const apiBaseUrl =
    import.meta.env.VITE_BACKEND_URL ||
    "https://g-scraper-backend-6egw.vercel.app";

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      try {
        const token = await ensureFreshToken(apiBaseUrl);
        if (!isMounted) return;
        setStatus(token ? "authorized" : "unauthorized");
      } catch (err) {
        clearSession();
        if (!isMounted) return;
        setStatus("unauthorized");
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [apiBaseUrl]);

  if (status === "checking") {
    return null;
  }

  if (status === "unauthorized") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
