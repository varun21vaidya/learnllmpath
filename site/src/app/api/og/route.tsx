import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fdc800",
          padding: 56,
          border: "12px solid #1c293c",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              background: "#1c293c",
              color: "#fdc800",
              fontSize: 36,
              fontWeight: 900,
              padding: "10px 26px",
            }}
          >
            Learn LLM Path
          </div>
          <div style={{ fontSize: 30, color: "#1c293c" }}>learnllmpath.com</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 88, fontWeight: 900, color: "#1c293c", lineHeight: 1.05 }}>
            <span>Master LLMs &amp; Agentic AI,</span>
            <span>one checked box at a time.</span>
          </div>
          <div style={{ display: "flex", fontSize: 40, color: "#1c293c", fontWeight: 700 }}>
            Free, step-by-step roadmap: fundamentals → RAG → agents → MCP → evals → security
          </div>
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          {["RAG", "Agents", "MCP", "Evals", "OWASP Security"].map((label, i) => (
            <div
              key={label}
              style={{
                display: "flex",
                background: ["#a6faff", "#ff6b9d", "#c5a3ff", "#a6faff", "#ff6b9d"][i],
                color: "#1c293c",
                fontSize: 30,
                fontWeight: 900,
                border: "6px solid #1c293c",
                boxShadow: "10px 10px 0 #1c293c",
                padding: "14px 28px",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=31536000, immutable" } }
  );
}
