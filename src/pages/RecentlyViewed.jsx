import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import Layout from "../components/Layout";

function RecentlyViewed() {
  const [recipes, setRecipes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentlyViewed();
  }, []);

  
  const fetchRecentlyViewed = async () => {
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

    if (error) {
      console.error("Recently viewed fetch error:", error);
      return;
    }

    setRecipes(data || []);
  };


  return (
    <Layout>
      <button
        className="btn-secondary"
        onClick={() => navigate("/dashboard")}
      >
        Dashboard
      </button>

    <h1>Recently Viewed</h1>

      {recipes.length === 0 ? (
        <p>No recently viewed recipes.</p>
      ) : (
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="card">

              <h2>{recipe.recipe_name}</h2>

              <p>Recently Viewed Recipe</p>

              <Link to={`/recipe/${recipe.recipe_id}`}>
                <button className="btn-primary">
                  View Recipe
                </button>
              </Link>

            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default RecentlyViewed;