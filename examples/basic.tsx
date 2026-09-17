"use client"

import { LiquidGlass } from "@/components/ui/liquid-glass"

export default function BasicExample() {
  return (
    <LiquidGlass
      style={{ width: 320, maxWidth: "100%", color: "#243b43" }}
      contentStyle={{ padding: 28 }}
    >
      <span style={{ fontSize: 11, letterSpacing: ".16em" }}>LIQUID / 01</span>
      <h2 style={{ fontSize: 28, margin: "32px 0 12px" }}>留一点空间给光。</h2>
      <p style={{ fontSize: 13, lineHeight: 1.8, margin: 0 }}>
        这是可以选择的文字。玻璃折射背后的内容，前景保持清晰。
      </p>
    </LiquidGlass>
  )
}
