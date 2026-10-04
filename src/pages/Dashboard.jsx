import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import Layout from "../components/Layout";

function Dashboard() {
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [userName, setUserName] = useState("");
  const [recipeCount, setRecipeCount] = useState(0);
  const [queueCount, setQueueCount] = useState(0);
  const [recentCount, setRecentCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setUserName(profile.full_name);

    const { count: recipes } = await supabase
      .from("recipes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const { count: queue } = await supabase
      .from("cooking_queue")
      .select("*", { count: "exact", head: true });

    const { count: recent } = await supabase
      .from("recently_viewed")
      .select("*", { count: "exact", head: true });

    setRecipeCount(recipes || 0);
    setQueueCount(queue || 0);
    setRecentCount(recent || 0);

    const { data: recentData } = await supabase
      .from("recently_viewed")
      .select("*")
      .order("viewed_at", { ascending: false })
      .limit(5);

    setRecentRecipes(recentData || []);

  };

  return (
    <Layout>
      <div className="dashboard-header">
        <h1>Dashboard</h1>

      <p>
        Welcome back, {userName}! Manage your recipes, queue, and cooking activities here.
      </p>
    </div>

      <br />

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Recipes</h3>
          <h1>{recipeCount}</h1>
        </div>

        <div className="stat-card">
          <h3>Queue Items</h3>
          <h1>{queueCount}</h1>
        </div>

        <div className="stat-card">
          <h3>Recently Viewed</h3>
          <h1>{recentCount}</h1>
        </div>
      </div>

      <br />

      <h2 className="quick-actions-title">Quick Actions</h2>

      <br />

      <h2>Recent Activity</h2>

      <div className="card">
        {recentRecipes.length === 0 ? (
          <p>No recent activity yet.</p>
        ) : (
          recentRecipes.map((recipe) => (
            <p key={recipe.id}>
            • {recipe.recipe_name}
            </p>
          ))
        )}
      </div>

      <br />

      <div className="quick-actions">
        <Link to="/add-recipe">
          <button>Add Recipe</button>
        </Link>

      <Link to="/recipes">
        <button>View Recipes</button>
      </Link>

      <Link to="/queue">
        <button>Cooking Queue</button>
      </Link>
    </div>
    </Layout>
  );
}

export default Dashboard;