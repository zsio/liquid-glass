"use client"

import { useState } from "react"
import { GlassButton, GlassIconButton } from "@/components/ui/liquid-glass"

export default function ButtonsExample() {
  const [saved, setSaved] = useState(false)
  const [liked, setLiked] = useState(false)

  return (
    <div style={{ display: "grid", justifyItems: "center", gap: 20, color: "#243b43" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <GlassButton size="lg" onClick={() => setSaved(!saved)}>
          {saved ? "已保存 ✓" : "保存收藏"}
        </GlassButton>
        <GlassIconButton
          aria-label={liked ? "取消喜欢" : "喜欢"}
          aria-pressed={liked}
          onClick={() => setLiked(!liked)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
        </GlassIconButton>
      </div>
      <span role="status" style={{ fontSize: 12 }}>
        {saved ? "已加入你的收藏" : "点击按钮试试"}{liked ? " · 喜欢 +1" : ""}
      </span>
    </div>
  )
}
