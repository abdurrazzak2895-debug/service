import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useDispatch } from "react-redux";
import { RouterProvider } from "react-router";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { LanguageProvider } from "./Context/LanguageProvider";
import { routes } from "./router/router";
import { store } from "./app/store";
import { rehydrateAuth } from "./features/auth/authSlice";

const queryClient = new QueryClient();

/**
 * 🔁 Context useEffect equivalent
 */
const BootstrapAuth = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(rehydrateAuth());
  }, [dispatch]);

  return children;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <BootstrapAuth>
            <ToastContainer position="top-right" />
            <RouterProvider router={routes} />
          </BootstrapAuth>
        </LanguageProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
