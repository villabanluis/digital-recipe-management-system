
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error("Required Supabase environment variables are missing.");
      return jsonResponse({ error: "Server configuration is incomplete." }, 500);
    }

    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return jsonResponse({ error: "Please log in first." }, 401);
    }

    // Verify the caller's real Supabase session.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user: caller },
      error: authError,
    } = await callerClient.auth.getUser();

    if (authError || !caller) {
      return jsonResponse({ error: "Your session is invalid." }, 401);
    }

    // This privileged client must only be used inside the Edge Function.
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Verify the caller's database role on the server.
    const { data: callerProfile, error: roleError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", caller.id)
      .maybeSingle();

    if (roleError || callerProfile?.role !== "admin") {
      return jsonResponse({ error: "Access denied. Admins only." }, 403);
    }

    const body = await req.json();
    const userId = body?.userId;

    if (typeof userId !== "string" || !userId.trim()) {
      return jsonResponse({ error: "A valid userId is required." }, 400);
    }

    if (userId === caller.id) {
      return jsonResponse(
        { error: "You cannot delete your own administrator account." },
        400,
      );
    }

    // Confirm that the target Auth account exists.
    const { data: targetResult, error: targetError } =
      await adminClient.auth.admin.getUserById(userId);

    if (targetError || !targetResult.user) {
      return jsonResponse({ error: "The target account was not found." }, 404);
    }

    // Find all recipes owned by the target account.
    const { data: ownedRecipes, error: recipesError } = await adminClient
      .from("recipes")
      .select("id")
      .eq("user_id", userId);

    if (recipesError) {
      console.error("Could not find owned recipes:", recipesError.message);
      return jsonResponse({ error: "Could not load the user's recipes." }, 500);
    }

    const recipeIds = (ownedRecipes || []).map((recipe) => recipe.id);

    // Remove this user's queue and viewing history.
    const { error: queueError } = await adminClient
      .from("cooking_queue")
      .delete()
      .eq("user_id", userId);

    if (queueError) {
      console.error("Queue deletion failed:", queueError.message);
      return jsonResponse({ error: "Could not delete the user's cooking queue." }, 500);
    }

    const { error: historyError } = await adminClient
      .from("recently_viewed")
      .delete()
      .eq("user_id", userId);

    if (historyError) {
      console.error("History deletion failed:", historyError.message);
      return jsonResponse({ error: "Could not delete the user's viewing history." }, 500);
    }

    // Remove other users' queue/history references to recipes being deleted.
    // This prevents stale links to recipes that no longer exist.
    if (recipeIds.length > 0) {
      const { error: otherQueueError } = await adminClient
        .from("cooking_queue")
        .delete()
        .in("recipe_id", recipeIds);

      if (otherQueueError) {
        console.error("Related queue cleanup failed:", otherQueueError.message);
        return jsonResponse({ error: "Could not clean up recipe queue references." }, 500);
      }

      const { error: otherHistoryError } = await adminClient
        .from("recently_viewed")
        .delete()
        .in("recipe_id", recipeIds);

      if (otherHistoryError) {
        console.error("Related history cleanup failed:", otherHistoryError.message);
        return jsonResponse({ error: "Could not clean up recipe history references." }, 500);
      }
    }

    // Delete recipes created by the target account.
    const { error: deleteRecipesError } = await adminClient
      .from("recipes")
      .delete()
      .eq("user_id", userId);

    if (deleteRecipesError) {
      console.error("Recipe deletion failed:", deleteRecipesError.message);
      return jsonResponse({ error: "Could not delete the user's recipes." }, 500);
    }

    // Delete the user's profile.
    const { error: deleteProfileError } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (deleteProfileError) {
      console.error("Profile deletion failed:", deleteProfileError.message);
      return jsonResponse({ error: "Could not delete the user's profile." }, 500);
    }

    // Delete the actual Supabase Auth account last.
    const { error: deleteAuthError } =
      await adminClient.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error("Auth deletion failed:", deleteAuthError.message);
      return jsonResponse({
        error:
          "Related records and profile were deleted, but the Auth account could not be deleted. Check the Edge Function logs before retrying.",
      }, 500);
    }

    return jsonResponse({
      success: true,
      message: "The account and its related records were deleted.",
    });
  } catch (error) {
    console.error("delete-user unexpected error:", error);
    return jsonResponse({ error: "An unexpected server error occurred." }, 500);
  }
});
