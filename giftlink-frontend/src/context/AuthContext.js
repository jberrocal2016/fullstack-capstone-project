import React, { createContext, useState, useContext } from "react";

// Create the AuthContext object
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  // Group state + actions for clarity
  const value = {
    auth: { isLoggedIn, userName },
    actions: { setIsLoggedIn, setUserName },
  };

  // Provide the value to all children components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook for consuming the AuthContext
function useAuthContext() {
  return useContext(AuthContext);
}

export { AuthProvider, useAuthContext };
