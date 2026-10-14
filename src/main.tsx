import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { CloudAuthProvider } from "./CloudAuth";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CloudAuthProvider><App /></CloudAuthProvider>
  </StrictMode>
);
