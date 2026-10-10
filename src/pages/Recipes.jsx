import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import Layout from "../components/Layout";

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchRecipes();
  }, []);
  const fetchRecipes = async () => {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError) {
        console.log(profileError);
    return;
    }

    let query = supabase
        .from("recipes")
        .select("*")
        .order("id", { ascending: false });

    if (profile.role !== "admin") {
        query = query.eq("user_id", user.id);
    }

    const { data, error } = await query;

    if (error) {
        console.log(error);
    return;
    }

    setRecipes(data);
    };

  const deleteRecipe = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this recipe?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Recipe deleted successfully.");
    fetchRecipes();
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

    const { error } = await supabase
      .from("cooking_queue")
      .insert({
        user_id: user.id,
        recipe_id: recipe.id,
        recipe_name: recipe.recipe_name,
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Recipe added to queue.");
  };


  return (
    <Layout>

      <h1>Recipes</h1>

      <Link to="/add-recipe">
        <button>Add Recipe</button>
      </Link>

        <div className="filter-bar">

          <input
            type="text"
            className="search-input"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Filipino">Filipino</option>
            <option value="Dessert">Dessert</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
          </select>

        </div>


      {recipes.length === 0 ? (
        <p>No recipes found.</p>
      ) : (
        <div className="recipe-grid">
          {recipes
            .filter((recipe) => {
              const matchesSearch =
                recipe.recipe_name
                  .toLowerCase()
                  .includes(search.toLowerCase()) ||
                recipe.category
                  .toLowerCase()
                  .includes(search.toLowerCase());

              const matchesCategory =
                selectedCategory === "" ||
                recipe.category === selectedCategory;

            return matchesSearch && matchesCategory;
          })
          .map((recipe) => (
            <div key={recipe.id} className="card">

              <h3>{recipe.recipe_name}</h3>

              <p>
                <strong>Category:</strong> {recipe.category}
              </p>

              <div className="card-actions">
                <Link to={`/recipe/${recipe.id}`}>
                  <button>View</button>
                </Link>

                <Link to={`/edit-recipe/${recipe.id}`}>
                  <button>Edit</button>
                </Link>

                <button onClick={() => addToQueue(recipe)}>
                  Queue
                </button>

                <button
                  className="delete-btn"
                  onClick={() => deleteRecipe(recipe.id)}
                >
                    Delete
                </button>

              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default Recipes;