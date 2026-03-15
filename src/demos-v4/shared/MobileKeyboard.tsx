import { motion } from "motion/react";

const ROW1 = "qwertyuiop".split("");
const ROW2 = "asdfghjkl".split("");
const ROW3 = "zxcvbnm".split("");

interface MobileKeyboardProps {
  activeKey?: string;
}

export function MobileKeyboard({ activeKey }: MobileKeyboardProps) {
  const lowerActive = activeKey?.toLowerCase();

  return (
    <motion.div
      initial={{ y: 220 }}
      animate={{ y: 0 }}
      exit={{ y: 220 }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
      style={{
        background: "#263238",
        padding: "6px 2px 4px",
        flexShrink: 0,
        margin: "0 -20px",
      }}
    >
      {/* Suggestion bar */}
      <div style={{ display: "flex", gap: 0, padding: "0 4px 5px", justifyContent: "space-around" }}>
        {["the", "I", "and"].map((w, i) => (
          <div
            key={w}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "4px 0",
              fontSize: 12,
              color: "#B0BEC5",
              borderRight: i < 2 ? "1px solid #37474F" : "none",
            }}
          >
            {w}
          </div>
        ))}
      </div>

      {[ROW1, ROW2, ROW3].map((row, ri) => (
        <div
          key={ri}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 3,
            marginBottom: 3,
            padding: ri === 1 ? "0 12px" : ri === 2 ? "0 2px" : "0 2px",
          }}
        >
          {ri === 2 && (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 4,
                background: "#37474F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: "#B0BEC5",
              }}
            >
              ⇧
            </div>
          )}
          {row.map((key) => {
            const isActive = lowerActive === key;
            return (
              <motion.div
                key={key}
                animate={{
                  background: isActive ? "#546E7A" : "#37474F",
                  scale: isActive ? 1.15 : 1,
                  y: isActive ? -4 : 0,
                }}
                transition={{ duration: 0.06 }}
                style={{
                  width: ri === 0 ? 30 : ri === 1 ? 33 : 33,
                  height: 36,
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  color: isActive ? "#fff" : "#ECEFF1",
                  fontFamily: "Roboto, system-ui, sans-serif",
                  fontWeight: 400,
                  position: "relative",
                  zIndex: isActive ? 10 : 1,
                }}
              >
                {key}
              </motion.div>
            );
          })}
          {ri === 2 && (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 4,
                background: "#37474F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                color: "#B0BEC5",
              }}
            >
              ⌫
            </div>
          )}
        </div>
      ))}

      {/* Bottom row */}
      <div style={{ display: "flex", gap: 3, padding: "0 2px" }}>
        <div
          style={{
            width: 50,
            height: 36,
            borderRadius: 4,
            background: "#37474F",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: "#B0BEC5",
          }}
        >
          ?123
        </div>
        <div
          style={{
            width: 32,
            height: 36,
            borderRadius: 4,
            background: "#37474F",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            color: "#B0BEC5",
          }}
        >
          ,
        </div>
        <div
          style={{
            flex: 1,
            height: 36,
            borderRadius: 4,
            background: "#546E7A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: "#90A4AE",
          }}
        >
          English
        </div>
        <div
          style={{
            width: 32,
            height: 36,
            borderRadius: 4,
            background: "#37474F",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            color: "#B0BEC5",
          }}
        >
          .
        </div>
        <div
          style={{
            width: 50,
            height: 36,
            borderRadius: 4,
            background: "#37474F",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            color: "#B0BEC5",
          }}
        >
          ⏎
        </div>
      </div>
    </motion.div>
  );
}
