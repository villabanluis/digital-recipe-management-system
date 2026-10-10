
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import {
  FaHome,
  FaBook,
  FaPlusCircle,
  FaFire,
  FaHistory,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

function Sidebar() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    const getProfile = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        if (active) navigate("/", { replace: true });
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (active && !error && data) {
        setFullName(data.full_name || user.email || "User");
        setRole(data.role || "user");
      } else if (active) {
        setFullName(user.email || "User");
        setRole("user");
      }
    };

    getProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    if (loggingOut) return;

    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;

    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Logout failed: " + error.message);
      setLoggingOut(false);
      return;
    }

    navigate("/", { replace: true });
  };

  const linkClass = ({ isActive }) =>
    `sidebar-link${isActive ? " active" : ""}`;

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setCollapsed((previous) => !previous)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <FaBars /> : <FaTimes />}
      </button>

      <div className="sidebar-brand">
        <div className="brand-icon">
          <FaBook />
        </div>
        {!collapsed && (
          <div className="brand-text">
            <strong>Digital Recipe</strong>
            <span>Management System</span>
          </div>
        )}
      </div>

      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {(fullName || "U").charAt(0).toUpperCase()}
        </div>

        {!collapsed && (
          <div className="sidebar-user-info">
            <strong title={fullName}>{fullName || "Loading user..."}</strong>
            <span>{role === "admin" ? "Administrator" : "User"}</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {!collapsed && <p className="sidebar-section-label">MENU</p>}

        <NavLink to="/dashboard" className={linkClass} title="Dashboard">
          <FaHome />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        <NavLink to="/recipes" className={linkClass} title="Recipes">
          <FaBook />
          {!collapsed && <span>Recipes</span>}
        </NavLink>

        <NavLink to="/add-recipe" className={linkClass} title="Add Recipe">
          <FaPlusCircle />
          {!collapsed && <span>Add Recipe</span>}
        </NavLink>

        <NavLink to="/queue" className={linkClass} title="Cooking Queue">
          <FaFire />
          {!collapsed && <span>Cooking Queue</span>}
        </NavLink>

        <NavLink
          to="/recently-viewed"
          className={linkClass}
          title="Recently Viewed"
        >
          <FaHistory />
          {!collapsed && <span>Recently Viewed</span>}
        </NavLink>

        {role === "admin" && (
          <NavLink
            to="/manage-users"
            className={linkClass}
            title="User Management"
          >
            <FaUsers />
            {!collapsed && <span>User Management</span>}
          </NavLink>
        )}
      </nav>

      <div className="sidebar-bottom">
        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
          disabled={loggingOut}
          title="Logout"
        >
          <FaSignOutAlt />
          {!collapsed && (
            <span>{loggingOut ? "Logging out..." : "Logout"}</span>
          )}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
