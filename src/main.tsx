import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Hide initial loader when React mounts
const initialLoader = document.getElementById('initial-loader');
if (initialLoader) {
  initialLoader.style.display = 'none';
}

// Polyfill requestIdleCallback for Safari/iOS
(window as any).requestIdleCallback = (window as any).requestIdleCallback || function (cb: any) {
  var start = Date.now();
  return setTimeout(function () {
    cb({
      didTimeout: false,
      timeRemaining: function () {
        return Math.max(0, 50 - (Date.now() - start));
      }
    });
  }, 1);
};

(window as any).cancelIdleCallback = (window as any).cancelIdleCallback || function (id: any) {
  clearTimeout(id);
};

// Defer analytics and performance tracking initialization to after first paint
(window as any).requestIdleCallback(() => {
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
