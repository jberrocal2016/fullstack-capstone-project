import React, { useState, useEffect } from "react";
import { urlConfig } from "../../config";
import { useAuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
  // State for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State for error message when login fails
  const [showerr, setShowerr] = useState("");

  // Hooks for navigation and auth context
  const navigate = useNavigate();

  // Correctly destructure from actions
  const { actions } = useAuthContext();
  const { setIsLoggedIn, setUserName } = actions;

  // Optional bearer token if already stored
  const bearerToken = sessionStorage.getItem("bearer-token");

  useEffect(() => {
    if (sessionStorage.getItem("auth-token")) {
      navigate("/app");
    }
  }, [navigate]);

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setShowerr("");

    // Basic validation
    if (!email || !password) {
      setShowerr("Email and password are required.");
      return;
    }

    try {
      const res = await fetch(`${urlConfig.backendUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: bearerToken ? `Bearer ${bearerToken}` : "",
        },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      console.log("Login response:", json);

      if (json.authtoken) {
        // Save auth details in session storage
        sessionStorage.setItem("auth-token", json.authtoken);
        sessionStorage.setItem("name", json.userName);
        sessionStorage.setItem("email", json.userEmail);

        // Update app context and redirect
        setIsLoggedIn(true);
        setUserName(json.userName);

        // Redirect
        navigate("/app");
      } else {
        // Reset inputs and show error message
        setEmail("");
        setPassword("");
        setShowerr("Wrong password. Try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setShowerr("Login failed. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="login-card p-4 border rounded">
            <h2 className="text-center mb-4 font-weight-bold">Login</h2>

            {/* Login form */}
            <form onSubmit={handleLogin}>
              {/* Email input */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  id="email"
                  type="text"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password input */}
              <div className="mb-4">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {showerr && (
                  <span
                    style={{
                      color: "red",
                      display: "block",
                      fontStyle: "italic",
                      fontSize: "12px",
                    }}
                  >
                    {showerr}
                  </span>
                )}
              </div>

              {/* Login button */}
              <button type="submit" className="btn btn-primary w-100 mb-3">
                Login
              </button>
            </form>

            {/* Link to registration */}
            <p className="mt-4 text-center">
              New here?{" "}
              <Link to="/app/register" className="text-primary">
                Register Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
