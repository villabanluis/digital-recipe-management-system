
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import Layout from "../components/Layout";

function GlobalRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    fetchGlobalRecipes();
  }, []);

  const fetchGlobalRecipes = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;

      const recipeList = data || [];
      const userIds = [
        ...new Set(recipeList.map((recipe) => recipe.user_id).filter(Boolean)),
      ];

      let profiles = [];

      if (userIds.length > 0) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

        if (profileError) {
          console.error("Could not load author names:", profileError);
        } else {
          profiles = profileData || [];
        }
      }

      const namesByUserId = new Map(
        profiles.map((profile) => [profile.id, profile.full_name])
      );

      setRecipes(
        recipeList.map((recipe) => ({
          ...recipe,
          authorName:
            namesByUserId.get(recipe.user_id) || "Community Member",
        }))
      );
    } catch (error) {
      console.error("Error loading global recipes:", error);
      alert("Could not load community recipes: " + error.message);
    } finally {
      setLoading(false);
    }
  };

    const addToQueue = async (recipe) => {
  setAddingId(recipe.id);

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("Please log in to add recipes to your queue.");
      return;
    }

    // Check whether this recipe is already in the user's queue.
    const { data: existing, error: checkError } = await supabase
      .from("cooking_queue")
      .select("id")
      .eq("user_id", user.id)
      .eq("recipe_id", recipe.id)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      alert("This recipe is already in your cooking queue.");
      return;
    }

    const { error: insertError } = await supabase
        .from("cooking_queue")
        .insert({
            user_id: user.id,
            recipe_id: recipe.id,
            recipe_name: recipe.recipe_name || "Untitled Recipe",
        });

        if (insertError) throw insertError;

        alert("Recipe added to your cooking queue!");
    } catch (error) {
        console.error("Error adding recipe to queue:", error);
        alert("Could not add recipe to queue: " + error.message);
    } finally {
        setAddingId(null);
    }
    };

    const filteredRecipes = recipes.filter((recipe) => {
    const name = (recipe.recipe_name || "").toLowerCase();
    const recipeCategory = (recipe.category || "").toLowerCase();
    const searchTerm = search.toLowerCase();

    const matchesSearch =
      name.includes(searchTerm) || recipeCategory.includes(searchTerm);

    const matchesCategory =
      category === "" || recipe.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <div className="global-recipes-heading">
        <div>
          <h1>Global Recipes</h1>

            <br></br>

          <p>Discover recipes shared by the community.</p>
        </div>

        <Link to="/add-recipe" className="global-add-recipe">
          + Add Recipe
        </Link>
      </div>

      <div className="global-recipe-filters">
        <input
          className="search-input"
          type="text"
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="category-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Filipino">Filipino</option>
          <option value="Dessert">Dessert</option>
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
        </select>
      </div>

      {loading ? (
        <p>Loading community recipes...</p>
      ) : filteredRecipes.length === 0 ? (
        <div className="global-recipes-empty">
          <h3>No recipes found</h3>
          <p>Try another search or add the first recipe.</p>
        </div>
      ) : (
        <div className="global-recipe-grid">
          {filteredRecipes.map((recipe) => (
            <article className="global-recipe-card" key={recipe.id}>
              <div>
                <span className="global-recipe-category">
                  {recipe.category || "Uncategorized"}
                </span>

                <h2>{recipe.recipe_name || "Untitled Recipe"}</h2>

                <p className="global-recipe-author">
                  Posted by <strong>{recipe.authorName}</strong>
                </p>
              </div>

              <div className="global-recipe-actions">
                <Link to={`/recipe/${recipe.id}`} className="global-view-button">
                    View Recipe
                </Link>

                <button
                    type="button"
                    className="global-queue-button"
                    onClick={() => addToQueue(recipe)}
                    disabled={addingId === recipe.id}
                >
                    {addingId === recipe.id ? "Adding..." : "Add to Queue"}
                </button>
                </div>
            </article>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default GlobalRecipes;
