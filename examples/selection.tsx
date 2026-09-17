"use client"

import { useState } from "react"
import { GlassSegmented, GlassChip, GlassToolbar, GlassToolbarSeparator } from "@/components/ui/liquid-glass"

export default function SelectionExample() {
  const [view, setView] = useState("recent")
  const [tags, setTags] = useState(["设计"])
  const [tool, setTool] = useState("选择")

  return (
    <div style={{ display: "grid", justifyItems: "center", gap: 24, color: "#243b43" }}>
      <GlassSegmented
        aria-label="内容范围"
        options={[{ value: "recent", label: "最近" }, { value: "saved", label: "收藏" }]}
        value={view}
        onValueChange={setView}
      />
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
        {["设计", "开发", "灵感"].map(tag => (
          <GlassChip
            key={tag}
            selected={tags.includes(tag)}
            onSelectedChange={selected => setTags(current =>
              selected ? [...current, tag] : current.filter(item => item !== tag)
            )}
          >{tag}</GlassChip>
        ))}
      </div>
      <GlassToolbar aria-label="编辑工具">
        {["选择", "绘制"].map((name, i) => (
          <button
            key={name}
            type="button"
            aria-label={name}
            aria-pressed={tool === name}
            tabIndex={i === 0 ? 0 : -1}
            onClick={() => setTool(name)}
          >{name === "选择" ? "↖" : "✎"}</button>
        ))}
        <GlassToolbarSeparator />
        <button type="button" aria-label="重置工具" tabIndex={-1} onClick={() => setTool("选择")}>↶</button>
      </GlassToolbar>
      <span role="status" style={{ fontSize: 12 }}>
        {view === "recent" ? "最近" : "收藏"} · 已选 {tags.length} 个标签 · {tool}
      </span>
    </div>
  )
}
