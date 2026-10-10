import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import Layout from "../components/Layout";

function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let active = true;

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

        if (active) {
          await fetchUsers(active);
        }
      } catch (error) {
        console.error("Error checking admin access:", error);
        alert("Could not verify admin access.");
      } finally {
        if (active) setLoading(false);
      }
    };

    checkAdmin();

    return () => {
      active = false;
    };
  }, [navigate]);

  const fetchUsers = async (active = true) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Error fetching users:", error);
      alert("Could not load users: " + error.message);
      return;
    }

    if (active) setUsers(data || []);
  };

  const changeRole = async (id, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";

    const confirmed = window.confirm(
      `Are you sure you want to change this user's role to ${newRole}?`
    );

    if (!confirmed) return;

    setUpdatingId(id);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", id);

      if (error) {
        alert("Could not change role: " + error.message);
        return;
      }

      alert("User role updated successfully.");
      await fetchUsers();
    } finally {
      setUpdatingId(null);
    }
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
      <div className="user-management-page">
        <div className="user-management-heading">
          <div>
            <h1>User Management</h1>
            <p>View registered accounts and manage their roles.</p>
          </div>

          <div className="user-count">
            <span>Total Users</span>
            <strong>{users.length}</strong>
          </div>
        </div>

        <div className="user-table-container">
          {users.length === 0 ? (
            <p className="user-empty-state">No users found.</p>
          ) : (
            <table className="user-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id}>
                    <td className="user-id">{index + 1}</td>

                    <td>{user.full_name || "Unnamed User"}</td>

                    <td>{user.email || "No email"}</td>

                    <td>
                      <span
                        className={`role-badge ${
                          user.role === "admin" ? "role-admin" : "role-user"
                        }`}
                      >
                        {user.role || "user"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={
                          user.role === "admin"
                            ? "user-action-button make-user-button"
                            : "user-action-button make-admin-button"
                        }
                        onClick={() => changeRole(user.id, user.role)}
                        disabled={updatingId !== null}
                      >
                        {updatingId === user.id
                          ? "Updating..."
                          : user.role === "admin"
                            ? "Make User"
                            : "Make Admin"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default ManageUsers;

