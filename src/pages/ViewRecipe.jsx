
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import Layout from "../components/Layout";

function ViewRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      navigate("/");
      return;
    }

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching recipe:", error);
      setErrorMessage("Unable to load this recipe.");
      return;
    }

    setRecipe(data);

    // Save recently viewed only after the recipe has loaded.
    const { error: historyError } = await supabase
      .from("recently_viewed")
      .insert({
        user_id: user.id,
        recipe_id: data.id,
        recipe_name: data.recipe_name,
      });

    if (historyError) {
      console.error("Error saving recently viewed recipe:", historyError);
    }
  };

  if (errorMessage) {
    return (
      <Layout>
        <p>{errorMessage}</p>
        <button onClick={() => navigate("/recipes")}>
          Back to Recipes
        </button>
      </Layout>
    );
  }

  if (!recipe) {
    return (
      <Layout>
        <p>Loading recipe...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="recipe-view-card">
        <div className="card-actions">
          <button onClick={() => navigate(-1)}>
            Back
          </button>

          <Link to={`/edit-recipe/${recipe.id}`}>
            <button>Edit Recipe</button>
          </Link>
        </div>

        <h1>{recipe.recipe_name}</h1>

      {recipe.description && (
        <>
          <p className="recipe-description">
            {recipe.description}
          </p>

          <br />
        </>
      )}

      {recipe.cooking_time && (
        <>
          <h3>Estimated Cooking Time</h3>
          <p>
            {recipe.cooking_time} minutes
          </p>

          <br />
        </>
      )}

      <hr />

      <h3>Category</h3>
      <p>{recipe.category || "Uncategorized"}</p>

        <br />

        <h3>Ingredients</h3>
        <p>{recipe.ingredients}</p>

        <br />

        <h3>Instructions</h3>
        <p>{recipe.instructions}</p>
      </div>
    </Layout>
  );
}

export default ViewRecipe;
