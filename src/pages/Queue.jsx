import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import Layout from "../components/Layout";

function Queue() {
  const [queue, setQueue] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    const { data, error } = await supabase
      .from("cooking_queue")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.log(error);
      return;
    }

    setQueue(data);
  };

  const removeRecipe = async (id) => {
    const confirmRemove = window.confirm(
      "Remove this recipe from queue?"
    );

    if (!confirmRemove) return;

    const { error } = await supabase
      .from("cooking_queue")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchQueue();
  };

  const cookNextRecipe = async () => {
    const confirmCook = window.confirm(
      "Cook the next recipe in the queue?"
    );

    if (!confirmCook) return;

    if (queue.length === 0) {
      alert("Queue is empty.");
      return;
    }

    const firstRecipe = queue[0];

    const { error } = await supabase
      .from("cooking_queue")
      .delete()
      .eq("id", firstRecipe.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert(`Cooked: ${firstRecipe.recipe_name}`);

    fetchQueue();
  };

  return (
  <Layout>

      <button
        className="btn-secondary"
        onClick={() => navigate("/dashboard")}
      >
        Dashboard
      </button>

      <h1>Cooking Queue</h1>

      <button
        className="btn-primary"
        onClick={cookNextRecipe}
      >
        Cook Next Recipe
      </button>

      <hr />

      {queue.length === 0 ? (
        <p>No recipes in queue.</p>
      ) : (
        <div className="recipe-grid">
          {queue.map((recipe, index) => (
            <div key={recipe.id} className="card">

              <h3>No.{index + 1}</h3>

              <h2 className="recipe-title">
                {recipe.recipe_name}
              </h2>

              <p>Waiting in cooking queue</p>

              <button
                className="btn-danger"
                onClick={() => removeRecipe(recipe.id)}
              >
                Remove
              </button>

            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default Queue;