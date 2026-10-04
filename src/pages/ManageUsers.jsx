import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import Layout from "../components/Layout";

function ManageUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name");

    if (error) {
      console.log(error);
      return;
    }

    setUsers(data);
  };

  const changeRole = async (id, newRole) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", id);

   if (error) {
      alert(error.message);
      return;
    }

  fetchUsers();
};

  return (
    <Layout>
      <h1>Manage Users</h1>

      <div className="recipe-grid">
        {users.map((user) => (
          <div key={user.id} className="card">
            <h3>{user.full_name}</h3>

            <p>
              <strong>Email:</strong> {user.email}
            </p>

            <p>
              <strong>Role:</strong> {user.role}
            </p>

            {user.role === "user" ? (
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
            )}

          </div>
        ))}
      </div>
    </Layout>
  );
}

export default ManageUsers;