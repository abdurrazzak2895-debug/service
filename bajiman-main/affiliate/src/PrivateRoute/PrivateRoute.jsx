import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectIsAffiliateUser,
} from "../features/auth/authSelectors";

const PrivateRoute = ({ children }) => {
  const location = useLocation();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAffiliateUser = useSelector(selectIsAffiliateUser);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAffiliateUser) {
    return <Navigate to="/login" replace />;
  }

  return children || <Outlet />;
};

export default PrivateRoute;
