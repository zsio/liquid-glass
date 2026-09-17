"use client"

import { useState } from "react"
import { GlassSwitch, GlassSlider } from "@/components/ui/liquid-glass"

export default function SettingsExample() {
  const [enabled, setEnabled] = useState(true)
  const [volume, setVolume] = useState(60)

  return (
    <div style={{ width: 280, maxWidth: "100%", color: "#243b43" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span id="notification-label">接收通知</span>
        <GlassSwitch
          aria-labelledby="notification-label"
          checked={enabled}
          onCheckedChange={setEnabled}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <label htmlFor="example-volume">音量</label>
        <output htmlFor="example-volume">{volume}%</output>
      </div>
      <GlassSlider
        id="example-volume"
        value={volume}
        min={0}
        max={100}
        onValueChange={setVolume}
      />
      <p role="status" style={{ fontSize: 12, margin: "18px 0 0" }}>
        通知已{enabled ? "开启" : "关闭"} · 音量 {volume}%
      </p>
    </div>
  )
}
