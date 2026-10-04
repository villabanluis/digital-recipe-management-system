import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import Layout from "../components/Layout";

function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipeName, setRecipeName] = useState("");
  const [category, setCategory] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");

  const categories = [
  "Filipino",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Dessert",
  "Snack",
  "Soup",
  "Beverage",
  "Pasta",
  "Seafood",
  "Chicken",
  "Beef",
  "Vegetarian",
];

  useEffect(() => {
    fetchRecipe();
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

    setRecipeName(data.recipe_name);
    setCategory(data.category);
    setIngredients(data.ingredients);
    setInstructions(data.instructions);
  };

  const updateRecipe = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("recipes")
      .update({
        recipe_name: recipeName,
        category: category,
        ingredients: ingredients,
        instructions: instructions,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Recipe updated successfully!");
    navigate("/recipes");
  };

  return (
  <Layout>
    <div className="form-card">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        
      <h1>Edit Recipe</h1>

      <form onSubmit={updateRecipe}>
          <input
            type="text"
            placeholder="Recipe Name"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
          />
        <br /><br />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>

          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
          </select>
          <br /><br />

          <textarea
            placeholder="Ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />
          <br /><br />

          <textarea
            placeholder="Instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
          <br /><br />

          <button
            type="submit"
            className="btn-primary"
          >
            Update Recipe
          </button>
        </form>
      </div>
  </Layout>
  );
}

export default EditRecipe;