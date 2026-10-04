import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

function Header() {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setFullName(data.full_name);
    setRole(data.role);
  };

  return (
    <header className="header">
      <div>
        <h2>Digital Recipe Management System</h2>
      </div>

      <div className="user-profile">
        <div className="user-avatar">
          {fullName?.charAt(0).toUpperCase()}
        </div>

        <div className="user-info">
          <div className="user-name">{fullName}</div>
          <div className="user-role">
            {role === "admin" ? "Administrator" : "User"}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;