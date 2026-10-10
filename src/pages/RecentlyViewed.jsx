
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import Layout from "../components/Layout";

function RecentlyViewed() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentlyViewed();
  }, []);

  const fetchRecentlyViewed = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setRecipes([]);
        return;
      }

      const { data, error } = await supabase
        .from("recently_viewed")
        .select("*")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false });

      if (error) throw error;

      // Keep only the latest history entry for each recipe.
      const uniqueRecipes = [];
      const seenRecipeIds = new Set();

      for (const item of data || []) {
        const key = String(item.recipe_id ?? item.id);

        if (!seenRecipeIds.has(key)) {
          seenRecipeIds.add(key);
          uniqueRecipes.push(item);
        }
      }

      setRecipes(uniqueRecipes);
    } catch (error) {
      console.error("Recently viewed fetch error:", error);
      alert("Could not load recently viewed recipes: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-heading">
        <div>
          <h1>Recently Viewed</h1>
          <p>Pick up where you left off.</p>
        </div>

        <Link to="/recipes" className="page-primary-link">
          Browse Recipes
        </Link>
      </div>

      <div className="recipe-results-heading">
        <h2>Your History</h2>
        <span>{recipes.length} recipes</span>
      </div>

      {loading ? (
        <div className="page-empty-state">Loading viewing history...</div>
      ) : recipes.length === 0 ? (
        <div className="page-empty-state">
          <div className="empty-state-icon">📖</div>
          <h3>No recently viewed recipes</h3>
          <p>Recipes you open will appear here.</p>
          <Link to="/recipes" className="page-primary-link">
            Explore Recipes
          </Link>
        </div>
      ) : (
        
        <div className="user-table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Recipe Name</th>
                <th>Date Viewed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe, index) => (
                <tr key={recipe.id}>
                  <td>{index + 1}</td>
                  <td>{recipe.recipe_name || "Recipe details unavailable"}</td>
                  <td>
                    {recipe.viewed_at
                      ? new Date(recipe.viewed_at).toLocaleDateString()
                      : "Not available"}
                  </td>
                  <td>
                    <Link
                      to={`/recipe/${recipe.recipe_id}`}
                      className="recipe-action-button"
                    >
                      View Recipe
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      )}
    </Layout>
  );
}

export default RecentlyViewed;
