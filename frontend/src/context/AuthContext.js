import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [doctor, setDoctor] = useState(
    () => JSON.parse(localStorage.getItem("doctor")) || null
  );

  const login = (doctorData) => {
    setDoctor(doctorData);
    localStorage.setItem("doctor", JSON.stringify(doctorData));
  };

  const logout = () => {
    setDoctor(null);
    localStorage.removeItem("doctor");
  };

  return (
    <AuthContext.Provider value={{ doctor, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
