import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

function Navbar() {
  // Pull auth state and actions from context
  const { auth, actions } = useAuthContext();
  const { isLoggedIn, userName } = auth;
  const { setIsLoggedIn, setUserName } = actions;

  const navigate = useNavigate();

  // Sync context state with sessionsStorage on mount
  useEffect(() => {
    const authToken = sessionStorage.getItem("auth-token");
    const name = sessionStorage.getItem("name");

    if (authToken) {
      setIsLoggedIn(true);
      if (name) setUserName(name);
    } else {
      setIsLoggedIn(false);
      setUserName("");
    }
  }, [setIsLoggedIn, setUserName]);

  // Handle logout: clear session and redirect to main page
  const handleLogout = () => {
    sessionStorage.clear();
    setIsLoggedIn(false);
    setUserName("");
    navigate("/app");
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-light"
      id="navbar_container"
    >
      {/* Brand logo/title */}
      <Link className="navbar-brand" to="/app">
        GiftLink
      </Link>

      {/* Mobile toggle button */}
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      {/* Navigation links */}
      <div
        className="collapse navbar-collapse justify-content-end"
        id="navbarNav"
      >
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link className="nav-link" to="/app">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/app">
              Gifts
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/app/search">
              Search
            </Link>
          </li>

          {/* Conditional rendering based on login state */}
          {isLoggedIn ? (
            <>
              <li className="nav-item">
                <span
                  className="nav-link"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/app/profile")}
                >
                  Welcome, {userName}
                </span>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-link nav-link"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/app/login">
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/app/register">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
