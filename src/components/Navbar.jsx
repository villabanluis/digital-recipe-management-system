import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link> |{" "}
      <Link to="/recipes">Recipes</Link> |{" "}
      <Link to="/queue">Queue</Link> |{" "}
      <Link to="/recently-viewed">Recently Viewed</Link> |{" "}
      <Link to="/">Logout</Link>
    </nav>
  );
}

const handleLogout = async () => {
  await supabase.auth.signOut();
  navigate("/");
};

<button onClick={handleLogout}>
  Logout
</button>

export default Navbar;