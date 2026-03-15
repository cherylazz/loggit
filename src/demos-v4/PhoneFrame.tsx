import { type ReactNode } from "react";
import { Wifi } from "lucide-react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-center" style={{ height: "100%" }}>
      <div
        style={{
          width: 390,
          height: 844,
          borderRadius: 40,
          background: "#1A1A1A",
          padding: "12px",
          position: "relative",
          boxShadow: "0 25px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset",
          transform: "scale(var(--phone-scale, 0.85))",
          transformOrigin: "center center",
        }}
      >
        {/* Punch-hole camera */}
        <div
          style={{
            position: "absolute",
            top: 26,
            left: "50%",
            transform: "translateX(-50%)",
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#000",
            zIndex: 20,
          }}
        />
        {/* Screen */}
        <div
          style={{
            width: 366,
            height: 780,
            borderRadius: 30,
            background: "#fff",
            overflow: "hidden",
            position: "relative",
          }}
          className="demo-screen"
        >
          {/* One UI 8.0 status bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 28,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 16px 0",
              zIndex: 15,
              background: "transparent",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: "#1A1A1A", fontFamily: "sans-serif", letterSpacing: -0.2 }}>10:54</span>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              {/* Samsung-style signal bars */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 1, marginRight: 1 }}>
                {[5, 7, 9, 11].map((h, i) => (
                  <div key={i} style={{ width: 2.5, height: h, borderRadius: 1, background: "#1A1A1A" }} />
                ))}
              </div>
              <span style={{ fontSize: 8.5, fontWeight: 700, color: "#1A1A1A", marginRight: 2 }}>5G</span>
              <Wifi size={11} color="#1A1A1A" strokeWidth={2.5} />
              {/* Samsung battery pill */}
              <div style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 2 }}>
                <div style={{
                  width: 20,
                  height: 10,
                  borderRadius: 2.5,
                  border: "1.5px solid #1A1A1A",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", left: 1.5, top: 1.5, bottom: 1.5, width: "70%", borderRadius: 1, background: "#1A1A1A" }} />
                </div>
                <div style={{ width: 1.5, height: 4, borderRadius: 1, background: "#1A1A1A" }} />
              </div>
            </div>
          </div>
          <div
            style={{
              width: "100%",
              height: "100%",
              overflowY: "auto",
              overflowX: "hidden",
            }}
            className="hide-scrollbar"
          >
            {children}
          </div>
        </div>
        {/* Android 3-button nav bar */}
        <div
          style={{
            position: "absolute",
            bottom: 6,
            left: 0,
            right: 0,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
          }}
        >
          {/* Back - triangle */}
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: "6px solid transparent",
              borderBottom: "6px solid transparent",
              borderRight: "10px solid #555",
            }}
          />
          {/* Home - circle */}
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: "2px solid #555",
            }}
          />
          {/* Recents - square */}
          <div
            style={{
              width: 12,
              height: 12,
              border: "2px solid #555",
              borderRadius: 2,
            }}
          />
        </div>
      </div>
    </div>
  );
}
