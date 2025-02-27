import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { StudentsProvider } from "./context/StudentContext.jsx";
import { SubjectsProvider } from "./context/SubjectsContext.jsx";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <StudentsProvider>
      <SubjectsProvider>
        <StrictMode>
          <App />
        </StrictMode>
      </SubjectsProvider>
    </StudentsProvider>
  </AuthProvider>
);
