import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import Layout from "../components/Layout";

function AddRecipe() {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("recipes")
      .insert([
        {
            recipe_name: recipeName,
            category: category,
            ingredients: ingredients,
            instructions: instructions,
            user_id: user.id,
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Recipe added successfully!");
    navigate("/dashboard");

    setRecipeName("");
    setCategory("");
    setIngredients("");
    setInstructions("");
  };

 return (
  <Layout>
    <div className="form-card">

      <h1>Add Recipe</h1>

      <form onSubmit={handleSubmit}>
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
          placeholder="Enter ingredients..."
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
        <br /><br />

        <textarea
          placeholder="Enter cooking instructions..."
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
        <br /><br />

        <div className="card-actions">
          <button type="submit">
            Add Recipe
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
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