import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import useProfile from "../hooks/useProfile";
import { clearSession } from "../utils/auth";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const resolvedApiBaseUrl =
    import.meta.env.VITE_BACKEND_URL || "https://g-scraper-backend-6egw.vercel.app";

  const location = useLocation();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    refetchProfile,
    setProfile,
  } = useProfile(resolvedApiBaseUrl);

  const handleLogout = () => {
    clearSession();
    navigate("/", { replace: true });
  };

  const handleProfileNavigation = () => {
    navigate("/profile");
  };

  const navTitle = location.pathname === "/profile" ? "Profile" : "Find People";

  return (
    <div className="min-h-screen bg-slate-100 w-full">
      <div className="flex flex-col space-y-5 w-full h-full">
        <Navbar
          title={navTitle}
          profile={profile}
          loading={profileLoading}
          error={profileError}
          onProfile={handleProfileNavigation}
          onLogout={handleLogout}
        />
        <div className="px-6 pb-6">
          <Outlet
            context={{
              profile,
              profileLoading,
              profileError,
              refetchProfile,
              setProfile,
              apiBaseUrl: resolvedApiBaseUrl,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

