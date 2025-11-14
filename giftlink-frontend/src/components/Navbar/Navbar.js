import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { urlConfig } from "../../config";
import { useAppContext } from "../../context/AuthContext";

export default function Navbar() {
  // Pull auth state and setters from context
  const { isLoggedIn, setIsLoggedIn, userName, setUserName } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    // Chech session storage for auth token and user name
    const authTokenFromSession = sessionStorage.getItem("auth-token");
    const nameFromSession = sessionStorage.getItem("name");

    if (authTokenFromSession) {
      // If logged in and name exists, set userName in context
      if (isLoggedIn && nameFromSession) {
        setUserName(nameFromSession);
      } else {
        // Otherwise clear session and reset login state
        sessionStorage.removeItem("auth-token");
        sessionStorage.removeItem("name");
        sessionStorage.removeItem("email");
        setIsLoggedIn(false);
      }
    }
  }, [isLoggedIn, setIsLoggedIn, setUserName]);

  // Handle logout: clear session and redirect to main page
  const handleLogout = () => {
    sessionStorage.removeItem("auth-token");
    sessionStorage.removeItem("name");
    sessionStorage.removeItem("email");
    setIsLoggedIn(false);
    navigate(`/app`);
  };

  // Navigate to profile page
  const profileSection = () => {
    navigate(`/app/profile`);
  };

  return (
    <>
      <nav
        className="navbar navbar-expand-lg navbar-light bg-light"
        id="navbar_container"
      >
        {/* Brand link */}
        <a className="navbar-brand" href={`${urlConfig.backendUrl}/app`}>
          GiftLink
        </a>

        {/* Mobile toggle button */}
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar links */}
        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarNav"
        >
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link" href="/home.html">
                Home
              </a>
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

            {/* Right-side auth section */}
            <ul className="navbar-nav ml-auto">
              {isLoggedIn ? (
                <>
                  <li className="nav-item">
                    {" "}
                    <span
                      className="nav-link"
                      style={{ color: "black", cursor: "pointer" }}
                      onClick={profileSection}
                    >
                      Welcome, {userName}
                    </span>{" "}
                  </li>
                  <li className="nav-item">
                    <button
                      className="nav-link login-btn"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link login-btn" to="/app/login">
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link register-btn" to="/app/register">
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </ul>
        </div>
      </nav>
    </>
  );
}
