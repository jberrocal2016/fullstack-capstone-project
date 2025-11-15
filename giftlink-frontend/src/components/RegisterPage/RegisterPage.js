import React, { useState } from "react";
import { urlConfig } from "../../config";
import { useAuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
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

  // Correctly destructure from actions
  const { actions } = useAuthContext();
  const { setIsLoggedIn, setUserName } = actions;

  // Handle registration form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setShowerr("");

    // Basic client-side validation
    if (!firstName || !lastName || !email || !password) {
      setShowerr("All fields are required.");
      return;
    }
    if (!email.includes("@")) {
      setShowerr("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setShowerr("Password must be at least 6 characters.");
      return;
    }

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
        setUserName(firstName);

        // Redirect to app
        navigate("/app");
      } else if (json.error) {
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

            {/* Registration form */}
            <form onSubmit={handleRegister}>
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
                  required
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
                  required
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
                  required
                />
                {showerr && <div className="text-danger">{showerr}</div>}
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
                  required
                />
              </div>

              {/* Register button */}
              <button type="submit" className="btn btn-primary w-100 mb-3">
                Register
              </button>
            </form>

            {/* Link to login page */}
            <p className="mt-4 text-center">
              Already a member?{" "}
              <Link to="/app/login" className="text-primary">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  ); //end of return
}

export default RegisterPage;
