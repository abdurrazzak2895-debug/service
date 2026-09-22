import { createBrowserRouter } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import Home from "../pages/Home/Home";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Withdraw from "../pages/Withdraw/Withdraw";
import Deposit from "../pages/Deposit/Deposit";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import AffiliateLayout from "../AffiliateLayout/AffiliateLayout";
import Dashboard from "../components/Dashboard/Dashboard";
import MyUsers from "../pages/MyUsers/MyUsers";
import Profile from "../pages/Profile/Profile";
import WithdrawHistory from "../pages/WithdrawHistory/WithdrawHistory";
import WithdrawHistoryDetails from "../pages/WithdrawHistoryDetails/WithdrawHistoryDetails";
import CommissionStatus from "../pages/CommissionStatus/CommissionStatus";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute allowedRoles={["aff-user"]}>
        <AffiliateLayout />
      </PrivateRoute>
    ),
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "deposit",
        element: <Deposit />,
      },
      {
        path: "withdraw",
        element: <Withdraw />,
      },
      {
        path: "withdraw-history",
        element: <WithdrawHistory />,
      },
      {
        path: "withdraw-history-details/:id",
        element: <WithdrawHistoryDetails />,
      },
       {
        path: "commission-status",
        element: <CommissionStatus />,
      },
      {
        path: "my-users",
        element: <MyUsers />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
]);
