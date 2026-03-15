import { createRoot } from "react-dom/client";
import "../index.css";
import { PhoneFrame } from "./PhoneFrame";
import { Demo1_LoggingOverview } from "./demos/Demo1_LoggingOverview";
import { Demo2_OfflineCapability } from "./demos/Demo2_OfflineCapability";
import { Demo3_WeatherTimer } from "./demos/Demo3_WeatherTimer";
import { Demo4_ExportFunction } from "./demos/Demo4_ExportFunction";
import { Demo5_CrewSetup } from "./demos/Demo5_CrewSetup";
import { Demo6_VoiceTranscription } from "./demos/Demo6_VoiceTranscription";

const DEMOS: Record<string, React.FC> = {
  "1": Demo1_LoggingOverview,
  "2": Demo2_OfflineCapability,
  "3": Demo3_WeatherTimer,
  "4": Demo4_ExportFunction,
  "5": Demo5_CrewSetup,
  "6": Demo6_VoiceTranscription,
};

const params = new URLSearchParams(window.location.search);
const demoId = params.get("demo") || "1";
const DemoComponent = DEMOS[demoId] || Demo1_LoggingOverview;

createRoot(document.getElementById("demo-root")!).render(
  <div style={{
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    fontFamily: "Nunito, sans-serif",
  }}>
    <PhoneFrame>
      <DemoComponent />
    </PhoneFrame>
    <style>{`
      html, body, #demo-root { background: transparent !important; }
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `}</style>
  </div>
);
