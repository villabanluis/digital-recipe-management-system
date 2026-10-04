import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Recipes from "./pages/Recipes";
import AddRecipe from "./pages/AddRecipe";
import EditRecipe from "./pages/EditRecipe";
import Queue from "./pages/Queue";
import ViewRecipe from "./pages/ViewRecipe";
import RecentlyViewed from "./pages/RecentlyViewed";
import ManageUsers from "./pages/ManageUsers";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/edit-recipe/:id" element={<EditRecipe />} />
        <Route path="/add-recipe" element={<AddRecipe />} />
        <Route path="/queue" element={<Queue />} />
        <Route path="/recipe/:id" element={<ViewRecipe />} />
        <Route path="/recently-viewed" element={<RecentlyViewed />} />
        <Route path="/manage-users" element={<ManageUsers />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;