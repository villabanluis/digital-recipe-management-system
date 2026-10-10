
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Users,
  ListChecks,
  History,
  Plus,
  Search,
  Settings,
  LayoutDashboard,
  ChefHat,
} from "lucide-react";

import { supabase } from "../services/supabase";
import Layout from "../components/Layout";

function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("user");
  const [recentRecipes, setRecentRecipes] = useState([]);

  const [userCount, setUserCount] = useState(0);
  const [recipeCount, setRecipeCount] = useState(0);
  const [queueCount, setQueueCount] = useState(0);
  const [recentCount, setRecentCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate("/");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        console.error("Could not load profile:", profileError);
        return;
      }

      const isAdmin = profile.role === "admin";

      setUserName(profile.full_name || user.email || "User");
      setRole(profile.role || "user");

      // Total registered users: admins only
      if (isAdmin) {
        const { count, error } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        if (error) console.error("User count error:", error);
        setUserCount(count || 0);
      }

      // Recipe count
      let recipeQuery = supabase
        .from("recipes")
        .select("*", { count: "exact", head: true });

      if (!isAdmin) {
        recipeQuery = recipeQuery.eq("user_id", user.id);
      }

      const { count: recipes, error: recipeError } = await recipeQuery;

      if (recipeError) console.error("Recipe count error:", recipeError);
      setRecipeCount(recipes || 0);

      // Queue count
      let queueQuery = supabase
        .from("cooking_queue")
        .select("*", { count: "exact", head: true });

      if (!isAdmin) {
        queueQuery = queueQuery.eq("user_id", user.id);
      }

      const { count: queue, error: queueError } = await queueQuery;

      if (queueError) console.error("Queue count error:", queueError);
      setQueueCount(queue || 0);

      // Recently viewed count
      let recentQuery = supabase
        .from("recently_viewed")
        .select("*", { count: "exact", head: true });

      if (!isAdmin) {
        recentQuery = recentQuery.eq("user_id", user.id);
      }

      const { count: recent, error: recentError } = await recentQuery;

      if (recentError) console.error("Recent count error:", recentError);
      setRecentCount(recent || 0);

      // Recent activity
      let activityQuery = supabase
        .from("recently_viewed")
        .select("id, recipe_id, recipe_name, viewed_at")
        .order("viewed_at", { ascending: false })
        .limit(5);

      if (!isAdmin) {
        activityQuery = activityQuery.eq("user_id", user.id);
      }

      const { data: activity, error: activityError } =
        await activityQuery;

      if (activityError) {
        console.error("Recent activity error:", activityError);
      }

      setRecentRecipes(activity || []);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p>Loading dashboard...</p>
      </Layout>
    );
  }

  const isAdmin = role === "admin";

  return (
    <Layout>
      <div className="dashboard-header">
        <h1>
          <LayoutDashboard size={28} />
          {" "}
          {isAdmin ? "Admin Dashboard" : "Dashboard"}
        </h1>

        <p>
          Welcome back, {userName}!{" "}
          {isAdmin
            ? "Manage your users, recipes, and system activity."
            : "Manage your recipes and cooking activities."}
        </p>
      </div>

      <div className="stats-grid">
        {isAdmin && (
          <div className="stat-card">
            <Users size={28} />
            <h3>Total Users</h3>
            <h1>{userCount}</h1>
          </div>
        )}

        <div className="stat-card">
          <BookOpen size={28} />
          <h3>{isAdmin ? "Total Recipes" : "My Recipes"}</h3>
          <h1>{recipeCount}</h1>
        </div>

        <div className="stat-card">
          <ListChecks size={28} />
          <h3>Queue Items</h3>
          <h1>{queueCount}</h1>
        </div>

        <div className="stat-card">
          <History size={28} />
          <h3>Recently Viewed</h3>
          <h1>{recentCount}</h1>
        </div>
      </div>

      <h2 className="quick-actions-title">Quick Actions</h2>

      <div className="quick-actions">
        <Link to="/add-recipe">
          <button>
            <Plus size={18} /> Add Recipe
          </button>
        </Link>

        <Link to="/recipes">
          <button>
            <Search size={18} /> View Recipes
          </button>
        </Link>

        <Link to="/queue">
          <button>
            <ListChecks size={18} /> Cooking Queue
          </button>
        </Link>

        <Link to="/recently-viewed">
          <button>
            <History size={18} /> Recently Viewed
          </button>
        </Link>

        {isAdmin && (
          <Link to="/manage-users">
            <button>
              <Settings size={18} /> Manage Users
            </button>
          </Link>
        )}
      </div>

      <h2 className="quick-actions-title">Recent Activity</h2>

      <div className="card">
        {recentRecipes.length === 0 ? (
          <p>No recent activity yet.</p>
        ) : (
          recentRecipes.map((recipe) => (
            <div key={recipe.id}>
              <p>
                <ChefHat size={18} />
                {" "}
                {recipe.recipe_name || "Recipe name unavailable"}
              </p>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;
