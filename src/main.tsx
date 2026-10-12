import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./app/App";
import { createApi } from "./services/api";
import "./app/styles.css";
const root = createRoot(document.getElementById("root")!);
try {
  const api = createApi();
  root.render(
    <StrictMode>
      <BrowserRouter>
        <AppRoutes api={api} />
      </BrowserRouter>
    </StrictMode>,
  );
} catch (error) {
  root.render(
    <div className="configuration-error">
      <h1>Confira a configuração</h1>
      <p>
        {error instanceof Error ? error.message : "Não foi possível iniciar."}
      </p>
    </div>,
  );
}
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker
      .register("/sw.js", { type: "module" })
      .catch(() => {
        /* Installation remains optional; online use continues. */
      });
  });
}
