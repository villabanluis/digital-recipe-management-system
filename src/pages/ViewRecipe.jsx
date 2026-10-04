import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";

function ViewRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    fetchRecipe();
    addToRecentlyViewed();
  }, []);

  const fetchRecipe = async () => {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setRecipe(data);
  };

  const addToRecentlyViewed = async () => {
    const { data } = await supabase.auth.getUser();

    if (!data.user) return;

    await supabase
      .from("recently_viewed")
      .insert([
        {
          user_id: data.user.id,
          recipe_id: id,
        },
      ]);
  };

  if (!recipe) {
    return <p>Loading...</p>;
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

        <hr />

        <h3>Category</h3>
        <p>{recipe.category}</p>

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