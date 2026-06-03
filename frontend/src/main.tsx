import React from "react";
import ReactDOM from "react-dom/client";
import {RouterProvider} from "react-router-dom";
import {router} from "./router.tsx";
import "./styles.css";
import {AuthProvider} from "./auth/AuthProvider.tsx";
import {ThemeProvider} from "./components/ThemeProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router}/>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
