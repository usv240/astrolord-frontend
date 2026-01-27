import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize global analytics tracking
import { initErrorTracking, initRageClickDetection } from "./lib/analytics";
initErrorTracking();
initRageClickDetection();

createRoot(document.getElementById("root")!).render(<App />);
