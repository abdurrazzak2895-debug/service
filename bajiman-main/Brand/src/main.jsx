import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import "./index.css";

import { routes } from "./router/router";
import { LanguageProvider } from "./Context/LanguageProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LanguageProvider>
      <RouterProvider router={routes} />
    </LanguageProvider>
  </StrictMode>,
);
