import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import Layout from "../components/Layout";

function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate("/", { replace: true });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile || profile.role !== "admin") {
        alert("Access denied. Admins only.");
        navigate("/dashboard", { replace: true });
        return;
      }

      await fetchUsers();
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name");

    if (error) {
      console.error("Error fetching users:", error);
      alert("Could not load users: " + error.message);
      return;
    }

    setUsers(data || []);
  };

  const changeRole = async (id, newRole) => {
    if (!["user", "admin"].includes(newRole)) return;

    const confirmed = window.confirm(
      `Are you sure you want to change this user's role to ${newRole}?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", id);

    if (error) {
      alert("Could not change role: " + error.message);
      return;
    }

    alert("Role updated.");
    await fetchUsers();
  };

  if (loading) {
    return (
      <Layout>
        <p>Checking admin access...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1>Manage Users</h1>

      {users.length === 0 ? (
        <p>No users found, or the users could not be loaded.</p>
      ) : (
        <div className="recipe-grid">
          {users.map((user) => (
            <div key={user.id} className="card">
              <h3>{user.full_name || "Unnamed User"}</h3>

              <p>
                <strong>Email:</strong> {user.email}
              </p>

              <p>
                <strong>Role:</strong> {user.role}
              </p>

              {user.id !== undefined && (
                user.role === "user" ? (
                  <button
                    className="btn-primary"
                    onClick={() => changeRole(user.id, "admin")}
                  >
                    Make Admin
                  </button>
                ) : (
                  <button
                    className="btn-danger"
                    onClick={() => changeRole(user.id, "user")}
                  >
                    Make User
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default ManageUsers;
