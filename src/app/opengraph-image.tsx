import { ImageResponse } from "next/og"

export const alt = "Jobbly — Job Management & Invoicing for Contractors"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#090D16",
          padding: "70px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Amber glow accent in top right */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-150px",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0) 70%)",
          }}
        />

        {/* Top Header / Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              backgroundColor: "#F59E0B",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              fontWeight: "bold",
              color: "#090D16",
              boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.4)",
            }}
          >
            ⚡
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: "36px",
                fontWeight: 900,
                color: "#FFFFFF",
                letterSpacing: "-0.03em",
              }}
            >
              Jobbly
            </span>
            <span style={{ fontSize: "16px", color: "#F59E0B", fontWeight: 600 }}>
              CONTRACTOR SAAS PLATFORM
            </span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "950px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "rgba(245, 158, 11, 0.12)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              padding: "6px 16px",
              borderRadius: "100px",
              color: "#FBBF24",
              fontSize: "16px",
              fontWeight: 600,
              width: "fit-content",
            }}
          >
            <span>★</span> Built for Plumbers, Electricians, HVAC & Painters
          </div>

          <h1
            style={{
              fontSize: "58px",
              fontWeight: 900,
              color: "#FFFFFF",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Manage Jobs, Send Quotes & Get Paid{" "}
            <span style={{ color: "#F59E0B" }}>Faster.</span>
          </h1>

          <p
            style={{
              fontSize: "22px",
              color: "#94A3B8",
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            All-in-one platform for fast quotes, automated invoices, PDF downloads, and payment tracking.
          </p>
        </div>

        {/* Footer features */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid #1E293B",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "32px", color: "#CBD5E1", fontSize: "17px", fontWeight: 600 }}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#10B981" }}>✓</span> Instant Invoicing
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#10B981" }}>✓</span> PDF Generation
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#10B981" }}>✓</span> Client CRM
            </span>
          </div>

          <div
            style={{
              backgroundColor: "#F59E0B",
              color: "#090D16",
              padding: "10px 22px",
              borderRadius: "10px",
              fontSize: "17px",
              fontWeight: 800,
            }}
          >
            Try Free Now →
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
