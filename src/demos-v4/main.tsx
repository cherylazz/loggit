import { createRoot } from "react-dom/client";
import "../index.css";
import { DemoApp } from "./DemoApp";

createRoot(document.getElementById("demo-root")!).render(<DemoApp />);
