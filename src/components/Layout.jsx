
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaChevronDown } from "react-icons/fa";
import { supabase } from "../services/supabase";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate("/", { replace: true });
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      setProfile({
        fullName: data?.full_name || user.email || "User",
        email: user.email || "",
        role: !error && data?.role === "admin" ? "Administrator" : "User",
      });
    };

    getProfile();
  }, [navigate]);

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="content">
        <div className="top-profile-bar">
          <div className="profile-menu">
            <button
              type="button"
              className="profile-trigger"
              onClick={() => setProfileOpen((open) => !open)}
              aria-expanded={profileOpen}
            >
              <FaUserCircle className="profile-icon" />

              <span className="profile-trigger-info">
                <strong>{profile?.fullName || "Loading..."}</strong>
                <small>{profile?.role || "Account"}</small>
              </span>

              <FaChevronDown className="profile-chevron" />
            </button>

            {profileOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-heading">
                  <FaUserCircle className="profile-dropdown-icon" />
                  <div>
                    <strong>{profile?.fullName || "User"}</strong>
                    <p>{profile?.role || "User"}</p>
                  </div>
                </div>

                <div className="profile-detail">
                  <span>Email</span>
                  <strong>{profile?.email || "Not available"}</strong>
                </div>

                <div className="profile-detail">
                  <span>Account role</span>
                  <strong>{profile?.role || "User"}</strong>
                </div>

                <button
                  type="button"
                  className="profile-close-button"
                  onClick={() => setProfileOpen(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;
