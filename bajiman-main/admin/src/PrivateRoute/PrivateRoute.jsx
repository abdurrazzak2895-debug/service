import { Navigate, useLocation } from "react-router";
import { useSelector } from "react-redux";
import {
  selectAuth,
  selectIsAuthenticated,
} from "../features/auth/authSelectors";

const PrivateRoute = ({ children, motherOnly = false, permKey = null }) => {
  const location = useLocation();

  const auth = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const loading = auth?.loading;
  const role = auth?.admin?.role;
  const permissions = auth?.admin?.permissions || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#2f79c9]/20 to-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#63a8ee] border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-100 text-lg font-medium">Checking...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (motherOnly) {
    if (role !== "mother") {
      return <Navigate to="/" replace />;
    }

    return children;
  }

  if (role === "mother") {
    return children;
  }

  if (!permKey) {
    return <Navigate to="/" replace />;
  }

  if (!permissions.includes(permKey)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
