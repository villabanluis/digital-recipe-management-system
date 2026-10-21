import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import Layout from "../components/Layout";

function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipeName, setRecipeName] = useState("");
  const [description, setDescription] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [category, setCategory] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
  }, [id]);

  const fetchRecipe = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setRecipeName(data.recipe_name || "");
      setDescription(data.description || "");
      setCookingTime(
        data.cooking_time != null ? String(data.cooking_time) : ""
      );
      setCategory(data.category || "");
      setIngredients(data.ingredients || "");
      setInstructions(data.instructions || "");
    } catch (error) {
      console.error("Error loading recipe:", error);
      alert("Could not load recipe: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateRecipe = async (e) => {
    e.preventDefault();

    if (saving) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("recipes")
        .update({
          recipe_name: recipeName.trim(),
          description: description.trim(),
          cooking_time: Number(cookingTime),
          category,
          ingredients: ingredients.trim(),
          instructions: instructions.trim(),
        })
        .eq("id", id);

      if (error) throw error;

      alert("Recipe updated successfully!");
      navigate(`/recipe/${id}`);
    } catch (error) {
      alert("Could not update recipe: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p>Loading recipe...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="form-card">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate(-1)}
          disabled={saving}
        >
          Back
        </button>

        <h1>Edit Recipe</h1>

        <form onSubmit={updateRecipe}>
          {/* Recipe Name */}
          <input
            type="text"
            placeholder="Recipe Name"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            required
          />

          <br />
          <br />

          {/* Description */}
          <textarea
            placeholder="Describe your recipe..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />

          <br />
          <br />

          {/* Estimated Cooking Time */}
          <label htmlFor="editCookingTime">
            Estimated Cooking Time (minutes)
          </label>

          <input
            id="editCookingTime"
            type="number"
            placeholder="e.g. 45"
            value={cookingTime}
            onChange={(e) => setCookingTime(e.target.value)}
            min="1"
            step="1"
            required
          />

          <br />
          <br />

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select Category</option>

            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <br />
          <br />

          {/* Ingredients */}
          <textarea
            placeholder="Ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            required
          />

          <br />
          <br />

          {/* Cooking Instructions */}
          <textarea
            placeholder="Instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            required
          />

          <br />
          <br />

          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Update Recipe"}
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default EditRecipe;