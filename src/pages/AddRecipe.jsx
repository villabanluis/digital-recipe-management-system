import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import Layout from "../components/Layout";

function AddRecipe() {
  const navigate = useNavigate();

  const [recipeName, setRecipeName] = useState("");
  const [description, setDescription] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [category, setCategory] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Please log in before adding a recipe.");
        return;
      }

      const { error } = await supabase.from("recipes").insert([
        {
          recipe_name: recipeName.trim(),
          description: description.trim(),
          cooking_time: Number(cookingTime),
          category,
          ingredients: ingredients.trim(),
          instructions: instructions.trim(),
          user_id: user.id,
        },
      ]);

      if (error) {
        alert("Could not add recipe: " + error.message);
        return;
      }

      alert("Recipe added successfully!");
      navigate("/dashboard");
    } catch (error) {
      alert("Something went wrong: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="form-card">
        <h1>Add Recipe</h1>

        <form onSubmit={handleSubmit}>
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
          <label htmlFor="cookingTime">
            Estimated Cooking Time (minutes)
          </label>

          <input
            id="cookingTime"
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
            placeholder="Enter ingredients..."
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            required
          />

          <br />
          <br />

          {/* Cooking Instructions */}
          <textarea
            placeholder="Enter cooking instructions..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            required
          />

          <br />
          <br />

          <div className="card-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Add Recipe"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default AddRecipe;