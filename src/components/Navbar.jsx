import React, { useEffect, useRef, useState } from "react";
import { FiSettings, FiLogOut, FiUser } from "react-icons/fi";
import { FaUsersViewfinder } from "react-icons/fa6";
import { SiIconfinder } from "react-icons/si";
import { useNavigate } from "react-router-dom";

const Navbar = ({
  title = "Dashboard",
  profile,
  loading = false,
  error = "",
  onProfile,
  onLogout,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
const navigate = useNavigate();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const getDisplayName = () => {
    if (loading) return "Loading...";
    if (!profile) return "Guest";
    if (profile.full_name?.trim()) return profile.full_name;

    const combinedName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
    if (combinedName) return combinedName;

    return profile.email || "User";
  };

  const handleProfileClick = () => {
    setMenuOpen(false);
    onProfile?.();
  };

  const handleLogoutClick = () => {
    setMenuOpen(false);
    onLogout?.();
  };
  const handleHomeClick = () => {
    navigate("/home");
  };

  return (
    <header className="w-full flex items-center justify-between bg-white border border-gray-200 px-6 py-3 shadow-sm">
      <div className="flex items-center gap-2">
        <SiIconfinder size={24}  onClick={handleHomeClick} className="cursor-pointer hover:text-gray-700 transition"/>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {error && (
          <p className="text-xs text-red-600 mt-1">
            {error}
          </p>
        )}
      </div>

      <div className="relative flex items-center gap-3" ref={menuRef}>
        <div className="text-sm text-gray-700">
          {getDisplayName()}
        </div>
        <button
          type="button"
          aria-label="Settings"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 transition"
        >
          <FiSettings size={18} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-10">
            <button
              type="button"
              onClick={handleProfileClick}
              className="w-full px-4 py-2 flex items-center gap-3 text-sm text-gray-700 hover:bg-gray-50"
            >
              <FiUser size={16} />
              Update profile
            </button>
            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full px-4 py-2 flex items-center gap-3 text-sm text-red-600 hover:bg-red-50"
            >
              <FiLogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

