
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import Layout from "../components/Layout";

function Queue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setQueue([]);
        return;
      }

      const { data, error } = await supabase
        .from("cooking_queue")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setQueue(data || []);
    } catch (error) {
      console.error("Error loading cooking queue:", error);
      alert("Could not load cooking queue: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeRecipe = async (id) => {
    if (!window.confirm("Remove this recipe from your cooking queue?")) {
      return;
    }

    setBusy(true);

    try {
      const { error } = await supabase
        .from("cooking_queue")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setQueue((previous) => previous.filter((item) => item.id !== id));
    } catch (error) {
      alert("Could not remove recipe: " + error.message);
    } finally {
      setBusy(false);
    }
  };

  const cookNextRecipe = async () => {
    if (queue.length === 0) {
      alert("Your cooking queue is empty.");
      return;
    }

    const firstRecipe = queue[0];

    if (
      !window.confirm(
        `Mark "${firstRecipe.recipe_name || "Untitled Recipe"}" as cooked and remove it from the queue?`
      )
    ) {
      return;
    }

    setBusy(true);

    try {
      const { error } = await supabase
        .from("cooking_queue")
        .delete()
        .eq("id", firstRecipe.id);

      if (error) throw error;

      setQueue((previous) =>
        previous.filter((item) => item.id !== firstRecipe.id)
      );

      alert(`Cooked: ${firstRecipe.recipe_name || "Untitled Recipe"}`);
    } catch (error) {
      alert("Could not update cooking queue: " + error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <div className="page-heading">
        <div>
          <h1>Cooking Queue</h1>
          <p>Keep track of what you plan to cook next.</p>
        </div>

        <button
          type="button"
          className="page-primary-button"
          onClick={cookNextRecipe}
          disabled={loading || busy || queue.length === 0}
        >
          {busy ? "Please wait..." : "Cook Next Recipe"}
        </button>
      </div>

      <div className="queue-summary">
        <span>Recipes waiting to be cooked</span>
        <strong>{queue.length}</strong>
      </div>

      {loading ? (
        <div className="page-empty-state">Loading cooking queue...</div>
      ) : queue.length === 0 ? (
        <div className="page-empty-state">
          <h3>Your queue is empty</h3>
          <p>Add recipes from the Recipes page to plan your next meal.</p>
          <Link to="/recipes" className="page-primary-link">
            Browse Recipes
          </Link>
        </div>
      ) : (
        <div className="queue-list">
          {queue.map((recipe, index) => (
            <article className="queue-item" key={recipe.id}>
              <div className="queue-number">{index + 1}</div>

              <div className="queue-item-info">
                <span className="queue-status">WAITING TO COOK</span>
                <h3>{recipe.recipe_name || "Untitled Recipe"}</h3>
                <p>
                  {index === 0
                    ? "Up next"
                    : `Position ${index + 1} in your queue`}
                </p>
              </div>

              <div className="queue-item-actions">
                {recipe.recipe_id && (
                  <Link
                    to={`/recipe/${recipe.recipe_id}`}
                    className="recipe-action-button"
                  >
                    View
                  </Link>
                )}

                <button
                  type="button"
                  className="recipe-action-button recipe-delete-button"
                  onClick={() => removeRecipe(recipe.id)}
                  disabled={busy}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default Queue;
