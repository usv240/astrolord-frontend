import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Hide initial loader when React mounts
const initialLoader = document.getElementById('initial-loader');
if (initialLoader) {
  initialLoader.style.display = 'none';
}

// Defer analytics and performance tracking initialization to after first paint
requestIdleCallback(() => {
  // Initialize error tracking and rage click detection
  import("./lib/analytics").then(({ initErrorTracking, initRageClickDetection }) => {
    initErrorTracking();
    initRageClickDetection();
  });
  
  // Initialize Web Vitals performance tracking
  import("./utils/webVitals").then(({ initWebVitals }) => {
    initWebVitals();
  });
}, { timeout: 2000 });

createRoot(document.getElementById("root")!).render(<App />);
