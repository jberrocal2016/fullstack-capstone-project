import React, { useState } from "react";
import { urlConfig } from "../../config";
import { useAuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";

function RegisterPage() {
  // State for form inputs
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State for error messages
  const [showerr, setShowerr] = useState("");

  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuthContext();

  // Handle registration form submission
  const handleRegister = async () => {
    try {
      const response = await fetch(
        `${urlConfig.backendUrl}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
          }),
        }
      );

      const json = await response.json();
      console.log("Register response", json);

      if (json.authtoken) {
        // Save auth details in session storage
        sessionStorage.setItem("auth-token", json.authtoken);
        sessionStorage.setItem("name", firstName);
        sessionStorage.setItem("email", json.email);

        // Update app context and redirect
        setIsLoggedIn(true);
        navigate("/app");
      }

      if (json.error) {
        setShowerr(json.error);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setShowerr("Registration failed. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="register-card p-4 border rounded">
            <h2 className="text-center mb-4 font-weight-bold">Register</h2>

            {/* First name input */}
            <div className="mb-3">
              <label htmlFor="firstName" className="form-label">
                {" "}
                FirstName
              </label>
              <br />
              <input
                id="firstName"
                type="text"
                className="form-control"
                placeholder="Enter your firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            {/* Last name input */}

            <div className="mb-3">
              <label htmlFor="lastName" className="form-label">
                LastName
              </label>
              <input
                id="lastName"
                type="text"
                className="form-control"
                placeholder="Enter your lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            {/* Email input  */}
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
              <div className="text-danger">{showerr}</div>
            </div>

            {/* Password input*/}
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
            </div>

            {/* Register button */}
            <button
              className="btn btn-primary w-100 mb-3"
              onClick={handleRegister}
            >
              Register
            </button>

            {/* Link to login page */}
            <p className="mt-4 text-center">
              Already a member?{" "}
              <a href="/app/login" className="text-primary">
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  ); //end of return
}

export default RegisterPage;
