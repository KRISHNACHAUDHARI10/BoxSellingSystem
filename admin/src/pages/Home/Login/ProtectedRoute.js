// src/components/ProtectedRoute.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Mycontext } from "../../../App";

const ProtectedRoute = ({ children }) => {
  const context = useContext(Mycontext);

  // Check if user is logged in (context or localStorage)
  const isLogin = context.isLogin || localStorage.getItem("token");

  if (!isLogin) {
    return <Navigate to="/Login" replace />; // redirect to Login if not logged in
  }

  return children; // allow access if logged in
};

export default ProtectedRoute;
