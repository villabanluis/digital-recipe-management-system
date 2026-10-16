
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { supabase } from "../services/supabase";
import Layout from "../components/Layout";

function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [adminUserId, setAdminUserId] = useState(null);

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
          setAdminUserId(user.id);
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

    if (
      !window.confirm(
        `Are you sure you want to change this user's role to ${newRole}?`
      )
    ) {
      return;
    }

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
    } catch (error) {
      alert("Could not change role: " + error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteUser = async (user) => {
    if (user.id === adminUserId) {
      alert("You cannot delete your own administrator account here.");
      return;
    }

    const confirmed = window.confirm(
      `PERMANENTLY DELETE ACCOUNT?\n\n` +
        `Name: ${user.full_name || "Unnamed User"}\n` +
        `Email: ${user.email || "No email"}\n\n` +
        "This action cannot be undone. Continue?"
    );

    if (!confirmed) return;

    setDeletingId(user.id);

    try {
      const { data, error } = await supabase.functions.invoke("delete-user", {
        body: { userId: user.id },
      });

      if (error) {
        throw new Error(
          error.message ||
            "Could not contact the account deletion service."
        );
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setUsers((previous) =>
        previous.filter((item) => item.id !== user.id)
      );

      alert("Account deleted successfully.");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(
        "Could not delete account: " +
          error.message +
          "\n\nMake sure the delete-user Supabase Edge Function is deployed."
      );
    } finally {
      setDeletingId(null);
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
                          user.role === "admin"
                            ? "role-admin"
                            : "role-user"
                        }`}
                      >
                        {user.role || "user"}
                      </span>
                    </td>

                    <td>
                      <div className="user-action-group">
                        <button
                          type="button"
                          className={
                            user.role === "admin"
                              ? "user-action-button make-user-button"
                              : "user-action-button make-admin-button"
                          }
                          onClick={() =>
                            changeRole(user.id, user.role)
                          }
                          disabled={
                            updatingId !== null || deletingId !== null
                          }
                        >
                          {updatingId === user.id
                            ? "Updating..."
                            : user.role === "admin"
                              ? "Make User"
                              : "Make Admin"}
                        </button>

                        <button
                          type="button"
                          className="user-delete-icon-button"
                          title={`Delete ${user.full_name || user.email || "user"}`}
                          aria-label={`Delete ${user.full_name || user.email || "user"}`}
                          onClick={() => deleteUser(user)}
                          disabled={
                            user.id === adminUserId ||
                            updatingId !== null ||
                            deletingId !== null
                          }
                        >
                          <FaTrash />
                          <span>
                            {deletingId === user.id
                              ? "Deleting..."
                              : "Delete"}
                          </span>
                        </button>
                      </div>
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
