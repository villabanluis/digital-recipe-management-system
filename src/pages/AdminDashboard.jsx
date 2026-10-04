import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import Layout from "../components/Layout";

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [recipeCount, setRecipeCount] = useState(0);
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/");
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      navigate("/");
      return;
    }

    if (profile.role !== "admin") {
      alert("Access denied. Admins only.");
      navigate("/dashboard");
      return;
    }

    const { count: users } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: recipes } = await supabase
      .from("recipes")
      .select("*", { count: "exact", head: true });

    const { count: queue } = await supabase
      .from("cooking_queue")
      .select("*", { count: "exact", head: true });

    setUserCount(users || 0);
    setRecipeCount(recipes || 0);
    setQueueCount(queue || 0);

    setLoading(false);
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <Layout>

      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage users, recipes, and system data.</p>
      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Users</h3>
          <h1>{userCount}</h1>
        </div>

        <div className="stat-card">
          <h3>Total Recipes</h3>
          <h1>{recipeCount}</h1>
        </div>

        <div className="stat-card">
          <h3>Queue Items</h3>
          <h1>{queueCount}</h1>
        </div>

      </div>

    </Layout>
  );
}

export default AdminDashboard;