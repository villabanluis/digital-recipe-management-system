import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import {
  FaHome,
  FaBook,
  FaPlusCircle,
  FaFire,
  FaHistory,
  FaUsers,
  FaChartBar,
  FaSignOutAlt,
} from "react-icons/fa";

function Sidebar() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");

  useEffect(() => {
    getRole();
  }, []);

  const getRole = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (data) {
      setRole(data.role);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <h3>Menu</h3>

      {role === "admin" && (
        <>
          <Link to="/manage-users">Manage Users</Link>

          <Link to="/admin">Admin Dashboard</Link>
          
        </>
      )}

      <Link to="/dashboard">
        <FaHome /> Dashboard
      </Link>

      <Link to="/recipes">
        <FaBook /> Recipes
      </Link>

      <Link to="/add-recipe">
        <FaPlusCircle /> Add Recipe
      </Link>

      <Link to="/queue">
        <FaFire /> Queue
      </Link>

      <Link to="/recently-viewed">
        <FaHistory /> Recently Viewed
      </Link>

      <button onClick={handleLogout}>
        <FaSignOutAlt /> Logout
      </button>
    </aside>
  );
}

export default Sidebar;