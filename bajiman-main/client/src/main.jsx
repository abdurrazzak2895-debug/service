import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useDispatch } from "react-redux";
import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import "./index.css";

import { store } from "./app/store";
import { routes } from "./router/router";
import { LanguageProvider } from "./Context/LanguageProvider";
import { rehydrateAuth } from "./features/auth/authSlice";

const queryClient = new QueryClient();

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
            <RouterProvider router={routes} />

            {/* z-index above every modal (highest in use is z-[100020] on
                SuccessConfirmModal) — otherwise toasts render behind a
                modal's dark backdrop and never appear. top-center also
                keeps toasts visually tied to the centered modals instead
                of a top-right corner unrelated to what's open. */}
            <ToastContainer
              position="top-center"
              autoClose={2200}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnHover
              draggable
              theme="light"
              style={{ zIndex: 999999 }}
            />
          </BootstrapAuth>
        </LanguageProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);
