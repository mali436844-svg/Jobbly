"use client"

import * as React from "react"

interface AdSenseBannerProps {
  slot?: string
  format?: "auto" | "fluid" | "rectangle" | "horizontal"
  responsive?: boolean
  className?: string
}

export function AdSenseBanner({
  slot,
  format = "auto",
  responsive = true,
  className = "",
}: AdSenseBannerProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-XXXXXXXXXXXXXXXX"
  const isDemo = clientId === "ca-pub-XXXXXXXXXXXXXXXX"

  React.useEffect(() => {
    try {
      if (typeof window !== "undefined" && !isDemo) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
      }
    } catch (err) {
      console.error("AdSense display error:", err)
    }
  }, [isDemo])

  if (isDemo) {
    return (
      <div className={`p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 text-center text-xs text-amber-900 my-4 shadow-sm ${className}`}>
        <div className="flex items-center justify-center gap-1.5 font-bold text-amber-800">
          <span>📢</span> Google AdSense Placement Ready
        </div>
        <p className="text-[11px] text-amber-700 mt-1 max-w-md mx-auto">
          Monetization active: Add your Publisher ID in <code className="bg-amber-100 font-mono px-1 py-0.5 rounded text-amber-900 font-semibold">NEXT_PUBLIC_ADSENSE_CLIENT_ID</code> on Vercel to serve live ads.
        </p>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden my-4 text-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot || "1234567890"}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  )
}
