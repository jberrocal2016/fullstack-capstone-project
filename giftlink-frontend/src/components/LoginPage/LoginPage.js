import React, { useState, useEffect } from "react";
import { urlConfig } from "../../config";
import { useAppContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
  // State for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State for error message when login fails
  const [incorrect, setIncorrect] = useState("");

  // Hooks for navigation and auth context
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAppContext();

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
        navigate("/app");
      } else {
        // Reset inputs and show error message
        setEmail("");
        setPassword("");
        setIncorrect("Wrong password. Try again.");
        setTimeout(() => setIncorrect(""), 2000);
      }
    } catch (err) {
      console.error("Login error:", err);
      setIncorrect("Login failed. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="login-card p-4 border rounded">
            <h2 className="text-center mb-4 font-weight-bold">Login</h2>

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
              {/* Error message */}
              <span
                style={{
                  color: "red",
                  height: ".5cm",
                  display: "block",
                  fontStyle: "italic",
                  fontSize: "12px",
                }}
              >
                {incorrect}
              </span>
            </div>

            {/* Login button */}
            <button
              className="btn btn-primary w-100 mb-3"
              onClick={handleLogin}
            >
              Login
            </button>

            {/* Link to registration */}
            <p className="mt-4 text-center">
              New here?{" "}
              <a href="/app/register" className="text-primary">
                Register Here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
