
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import Layout from "../components/Layout";

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    setLoading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setRecipes([]);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: false });

      if (error) throw error;

      setRecipes(data || []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      alert("Could not load recipes: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteRecipe = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) {
      return;
    }

    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Could not delete recipe: " + error.message);
      return;
    }

    setRecipes((previous) => previous.filter((recipe) => recipe.id !== id));
  };

  const addToQueue = async (recipe) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("Please log in first.");
      return;
    }

    const { data: existingRecipe, error: checkError } = await supabase
      .from("cooking_queue")
      .select("id")
      .eq("user_id", user.id)
      .eq("recipe_id", recipe.id)
      .maybeSingle();

    if (checkError) {
      alert(checkError.message);
      return;
    }

    if (existingRecipe) {
      alert("This recipe is already in your cooking queue.");
      return;
    }

    const { error } = await supabase.from("cooking_queue").insert({
      user_id: user.id,
      recipe_id: recipe.id,
      recipe_name: recipe.recipe_name || "Untitled Recipe",
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Recipe added to queue.");
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const name = (recipe.recipe_name || "").toLowerCase();
    const category = (recipe.category || "").toLowerCase();
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      name.includes(searchText) || category.includes(searchText);

    const matchesCategory =
      !selectedCategory || recipe.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
  <Layout>
    <div className="global-recipes-heading">
      <div>
        <h1>My Recipes</h1>
        <br />
        <p>Manage your personal recipes.</p>
      </div>

      <Link to="/add-recipe" className="global-add-recipe">
        + Add Recipe
      </Link>
    </div>

    <div className="user-table-container">
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Recipe Name</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecipes.map((recipe, index) => (
            <tr key={recipe.id}>
              <td>{index + 1}</td>
              <td>{recipe.recipe_name || "Untitled Recipe"}</td>
              <td>{recipe.category || "Uncategorized"}</td>
              <td>
                <div className="recipe-table-actions">

                  <Link
                    to={`/recipe/${recipe.id}`}
                    className="recipe-action-button"
                  >
                    View
                  </Link>
                  
                  <Link
                    to={`/edit-recipe/${recipe.id}`}
                    className="recipe-action-button"
                  >
                    Edit
                  </Link>

                  <button
                    type="button"
                    className="recipe-action-button"
                    onClick={() => addToQueue(recipe)}
                  >
                    Queue
                  </button>

                  <button
                    type="button"
                    className="recipe-action-button recipe-delete-button"
                    onClick={() => deleteRecipe(recipe.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </Layout>
  );
}
export default Recipes;
