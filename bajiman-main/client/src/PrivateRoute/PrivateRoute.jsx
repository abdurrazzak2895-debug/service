import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { selectIsAuth } from "../features/auth/authSelectors";

const PrivateRoute = ({ children }) => {
  const isAuth = useSelector(selectIsAuth);
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children || <Outlet />;
};

export default PrivateRoute;
