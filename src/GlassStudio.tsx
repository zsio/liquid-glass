'use client';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  LiquidGlass, GlassButton, GlassIconButton, GlassSwitch, GlassSlider,
  GlassSegmented, GlassChip, GlassToolbar, GlassToolbarSeparator,
} from './components/LiquidGlass';
import { Icon, IconDefinitions } from './Icons';
import { useDraggableGlass } from './hooks/useDraggableGlass';
import { useStudioMedia } from './hooks/useStudioMedia';
import type { Backdrop } from './hooks/useStudioMedia';
import './demo.css';

type Shape = 'card' | 'pill' | 'circle';
type Parameters = { refraction: number; bevel: number; blur: number; dispersion: number };
const INITIAL: Parameters = { refraction: 56, bevel: 22, blur: .35, dispersion: 1.2 };
const BACKDROPS: [Backdrop, string][] = [['wallpaper', '壁纸'], ['video', '视频'], ['spectrum', '色带'], ['text', '文字'], ['grid', '网格']];
const SHAPES: [Shape, string][] = [['card', '卡片'], ['pill', '胶囊'], ['circle', '圆形']];
const TOOLS = [['cursor', '选择'], ['pen', '绘制'], ['crop', '裁剪']];
const SEGMENTS = [{ value: 'recent', label: '最近' }, { value: 'saved', label: '收藏' }, { value: 'all', label: '全部' }];
const CONTROLS: { key: keyof Parameters; label: string; min: number; max: number; step: number; format: (n: number) => string }[] = [
  { key: 'refraction', label: '折射强度', min: 0, max: 90, step: 1, format: String },
  { key: 'bevel', label: '曲面边缘', min: 5, max: 40, step: 1, format: n => `${n} px` },
  { key: 'blur', label: '模糊程度', min: 0, max: 12, step: .05, format: n => `${n.toFixed(2)} px` },
  { key: 'dispersion', label: '色散', min: 0, max: 4, step: .1, format: n => n.toFixed(2) },
];
function backgroundStyle(src: string): CSSProperties {
  // CSS URL resolution must not accidentally be relative to the hashed CSS file.
  const resolved = typeof document === 'undefined' ? src : new URL(src, document.baseURI).href;
  return { backgroundImage: `url("${resolved}")` };
}

/** Default app: the complete workbench, not the removed minimal ReactExample. */
export default function GlassStudio() {
  const stage = useRef<HTMLDivElement>(null), lens = useRef<HTMLDivElement>(null);
  const [parameters, setParameters] = useState(INITIAL);
  const [shape, setShape] = useState<Shape>('card');
  const [mode, setMode] = useState<'auto' | 'css'>('auto');
  const [showContent, setShowContent] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [renderer, setRenderer] = useState('');
  const media = useStudioMedia();
  const drag = useDraggableGlass(stage, lens, shape, resetKey);
  const [clicks, setClicks] = useState(0), [clickStatus, setClickStatus] = useState('READY');
  const [saved, setSaved] = useState(false), [notify, setNotify] = useState(true), [focus, setFocus] = useState(false);
  const [brightness, setBrightness] = useState(48), [segment, setSegment] = useState('recent');
  const [tags, setTags] = useState(['设计']), [tool, setTool] = useState('cursor');
  const [sampleDark, setSampleDark] = useState(false);
  useEffect(() => {
    const element = lens.current; if (!element) return;
    const update = () => setRenderer(element.dataset.glassRenderer || '');
    const observer = new MutationObserver(update);
    observer.observe(element, { attributes: true, attributeFilter: ['data-glass-renderer'] });
    update(); return () => observer.disconnect();
  }, []);
  function reset() {
    setParameters(INITIAL); setShape('card'); setMode('auto'); setShowContent(true);
    setResetKey(n => n + 1); media.reset();
    setClicks(0); setClickStatus('READY'); setSaved(false); setNotify(true); setFocus(false);
    setBrightness(48); setSegment('recent'); setTags(['设计']); setTool('cursor'); setSampleDark(false);
  }
  const time = Number.isFinite(media.time) ? Math.floor(media.time) : 0;
  const sampleStyle = { '--sample-wallpaper': backgroundStyle(media.samplePoster).backgroundImage } as CSSProperties;
  return <>
    <IconDefinitions />
    <div className="shell" data-application="full-workbench" data-version="3.4.0">
      <header className="topline"><div className="wordmark"><span className="mark" aria-hidden="true" />GLASS / MATERIALS</div><span className="version">WEB COMPONENT STUDY · 06</span></header>
      <div className="heading"><div><h1>Liquid Glass</h1><p className="subtitle">浅色壁纸、柔和动态影像。素材随站点部署，玻璃随背景变化。</p></div><div className="engine"><span className="engine-dot" style={{ background: renderer === 'svg' ? '#37a06f' : '#9d895d' }} /><span id="renderer-status" role="status">{renderer === 'svg' ? 'SVG 背景折射 · 已启用' : renderer === 'solid' ? '减少透明 / 高对比 · 实色模式' : renderer === 'css' ? 'CSS 毛玻璃 · 无背景折射' : '正在初始化'}</span></div></div>
      <main>
        <div className="workspace">
          <section className="viewport" aria-label="液态玻璃预览">
            <div className="viewport-toolbar"><span className="eyebrow">LIVE BACKDROP</span><div className="segments" aria-label="背景类型">{BACKDROPS.map(([id, label]) => <button key={id} type="button" data-backdrop-choice={id} aria-pressed={media.backdrop === id} onClick={() => media.setBackdrop(id)}>{label}</button>)}</div></div>
            <div ref={stage} className="stage" id="stage" data-backdrop={media.backdrop} data-tone={media.tone} style={{ '--spectrum': media.palette } as CSSProperties}>
              <div className="backdrop-content" aria-hidden="true">
                <img id="media-image" className="media-image" src={media.isMedia ? media.poster : undefined} alt="" draggable={false} hidden={!media.isMedia || !media.poster} onError={media.imageError} />
                <video id="media-video" ref={media.video} className="media-video" src={media.backdrop === 'video' ? media.active?.src : undefined} poster={media.backdrop === 'video' ? media.poster : undefined} muted loop playsInline preload="metadata" hidden={media.backdrop !== 'video' || media.failure} {...media.videoEvents} />
                <div className="stage-line" /><div className="back-title">Clarity.</div><div className="band band-lead" /><div className="band" /><div className="band band-tail" /><div className="band-thin" /><div className="back-caption">LIGHT / SURFACE / REFRACTION</div>
                <div className="text-sheet"><strong>See through.</strong><p>这不是玻璃里面的一张图片。<br />文字与色带，都是背后的真实网页内容。</p><p className="text-small">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />0123456789 · + = / &amp; *<br />Move the lens. Watch the edges.</p></div>
              </div>
              <LiquidGlass ref={lens} id="main-glass" className={`main-glass${drag.dragging ? ' dragging' : ''}${showContent ? '' : ' hide-content'}`} focusRing="none" data-shape={shape} radius={shape === 'card' ? 40 : 999} {...parameters} mode={mode} tabIndex={0} role="group" aria-roledescription="可移动镜片" aria-label="玻璃镜片：拖动或使用方向键移动，Home 键复位" {...drag.events}>
                <div className="lens-top"><span className="lens-tag">LIQUID / 01</span><Icon name="drag" /></div><div className="lens-word">Transparent.</div><div className="lens-bottom"><span>拖动镜片，看边缘</span><Icon name="arrow" /></div>
              </LiquidGlass>
              <div className="scene-caption" aria-hidden="true"><b id="scene-name">{media.active?.code || 'LOCAL / MEDIA'}</b><span id="scene-description">{media.active?.label}{media.backdrop === 'video' ? ' · 浅色动态影像' : ' · 浅色壁纸'}</span></div>
              <div className="media-filmstrip" id="media-filmstrip" role="group" aria-label="选择背景素材">{media.candidates.map(item => <button key={item.id} type="button" className="media-thumb" data-media-id={item.id} aria-label={item.label} title={`${item.label} · ${item.type === 'video' ? '视频' : '壁纸'}`} aria-pressed={media.active?.id === item.id} style={item.thumb || item.poster ? backgroundStyle(item.thumb || item.poster!) : undefined} onClick={() => media.select(item)}>{item.type === 'video' && <Icon name="play" />}</button>)}</div>
              <div className="media-controls"><span id="media-time" className="media-time" hidden={media.backdrop !== 'video'}>{String(Math.floor(time / 60)).padStart(2, '0')}:{String(time % 60).padStart(2, '0')}</span><button id="media-play" className="media-play" type="button" aria-label={media.playing ? '暂停背景视频' : '播放背景视频'} hidden={media.backdrop !== 'video'} onClick={media.togglePlay}><Icon name={media.playing ? 'pause' : 'play'} /></button></div>
            </div>
            <div className="viewport-bottom"><span id="media-status" role="status">{media.status}</span><div className="bottom-actions"><button type="button" className="plain-button" id="tone-toggle" aria-label="切换卡片文字明暗" title="切换卡片文字明暗" onClick={media.toggleTone}><Icon name="half" /></button><button type="button" className="plain-button" id="change-color" hidden={media.isMedia} onClick={media.nextPalette}><Icon name="swap" />换一组颜色</button><button type="button" className="plain-button" id="import-media" onClick={() => media.file.current?.click()}><Icon name="upload" /><span id="upload-label">导入图片 / 视频</span></button><input ref={media.file} id="media-file" className="file-input" tabIndex={-1} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime" aria-label="选择本地背景文件" onChange={media.importFile} /></div></div>
          </section>
          <aside className="inspector" aria-label="材质参数">
            <div className="inspector-heading"><h2>材质参数</h2><button type="button" className="plain-button" id="reset" onClick={reset}><Icon name="reset" />重置</button></div>
            <div className="segments" aria-label="渲染模式"><button type="button" data-mode="auto" aria-pressed={mode === 'auto'} onClick={() => setMode('auto')}>折射玻璃</button><button type="button" data-mode="css" aria-pressed={mode === 'css'} onClick={() => setMode('css')}>仅毛玻璃</button></div>
            <div className="control-group shape-group"><div className="control-label">组件形状</div><div className="segments" aria-label="组件形状">{SHAPES.map(([id, label]) => <button key={id} type="button" data-shape-choice={id} aria-pressed={shape === id} onClick={() => setShape(id)}>{label}</button>)}</div></div>
            {CONTROLS.map(({ key, label, min, max, step, format }) => <div key={key} className="control-group"><label className="control-label" htmlFor={key}>{label}<output id={`${key}-output`}>{format(parameters[key])}</output></label><input className="tune" id={key} type="range" min={min} max={max} step={step} value={parameters[key]} style={{ '--percent': (parameters[key] - min) / (max - min) * 100 } as CSSProperties} onChange={e => { const value = e.currentTarget.valueAsNumber; setParameters(p => ({ ...p, [key]: value })); }} /></div>)}
            <label className="checkline"><input id="show-content" type="checkbox" checked={showContent} onChange={e => setShowContent(e.currentTarget.checked)} />显示前景文字</label><p className="inspector-note">壁纸与视频都在玻璃后方真实渲染。导入文件仅在本地预览，不会上传。</p>
          </aside>
        </div>
        <section className="samples" id="samples" data-tone={sampleDark ? 'dark' : 'light'} style={sampleStyle} aria-labelledby="samples-title">
          <div className="samples-heading"><h2 id="samples-title">实际控件</h2><div className="control-library-note"><span>更轻、更小 · 背景跟随壁纸</span><button type="button" id="sample-tone" className="sample-tone-toggle" aria-pressed={sampleDark} onClick={() => setSampleDark(d => !d)}><Icon name="half" /><span>{sampleDark ? '浅色底图' : '深色底图'}</span></button></div></div>
          <div className="samples-grid">
            <div className="sample sample-button"><div className="sample-header"><span>01 / 按钮</span><output id="click-output" aria-live="polite">{clickStatus}</output></div><div className="sample-body"><GlassButton id="demo-button" material={{ mode }} onClick={() => { setClicks(clicks + 1); setClickStatus(`DONE · ${clicks + 1}`); }}>继续<Icon name="arrow-small" /></GlassButton><button type="button" className="sample-muted-button" id="cancel-button" onClick={() => { setClicks(0); setClickStatus('READY'); }}>取消</button><GlassIconButton id="favorite-button" material={{ mode }} aria-label={saved ? '取消收藏' : '收藏'} aria-pressed={saved} onClick={() => { setSaved(!saved); setClickStatus(saved ? 'UNSAVED' : 'SAVED'); }}><Icon name="heart" className="heart-icon" /></GlassIconButton></div></div>
            <div className="sample sample-switch"><div className="sample-header"><span>02 / 开关</span><output id="switch-output" aria-live="polite">{notify ? 'ON' : 'OFF'} / {focus ? 'ON' : 'OFF'}</output></div><div className="sample-body"><div className="switch-line"><span>接收通知</span><GlassSwitch id="demo-switch" aria-label="接收通知" checked={notify} onCheckedChange={setNotify} material={{ mode }} /></div><div className="switch-line"><span>专注模式</span><GlassSwitch id="focus-switch" aria-label="专注模式" checked={focus} onCheckedChange={setFocus} material={{ mode }} /></div></div></div>
            <div className="sample sample-slider"><div className="sample-header"><span>03 / 滑块</span><output id="slider-output" aria-live="polite">{brightness}%</output></div><div className="sample-body"><Icon name="sun-small" /><GlassSlider id="demo-slider" aria-label="亮度" value={brightness} onValueChange={setBrightness} material={{ mode }} /><Icon name="sun" /></div></div>
            <div className="sample sample-segmented"><div className="sample-header"><span>04 / 分段选择</span><output id="segment-output" aria-live="polite">{SEGMENTS.find(s => s.value === segment)?.label}</output></div><div className="sample-body"><GlassSegmented aria-label="内容筛选" options={SEGMENTS} value={segment} onValueChange={setSegment} material={{ mode }} /></div></div>
            <div className="sample sample-chip"><div className="sample-header"><span>05 / 选择标签</span><output id="chip-output" aria-live="polite">{tags.length} SELECTED</output></div><div className="sample-body">{['设计', '开发', '灵感'].map(tag => <GlassChip key={tag} data-chip={tag} selected={tags.includes(tag)} onSelectedChange={selected => setTags(t => selected ? [...t, tag] : t.filter(x => x !== tag))} material={{ mode }}>{tag}</GlassChip>)}</div></div>
            <div className="sample sample-toolbar"><div className="sample-header"><span>06 / 悬浮工具栏</span><output id="tool-output" aria-live="polite">{TOOLS.find(t => t[0] === tool)?.[1]}</output></div><div className="sample-body"><GlassToolbar aria-label="编辑工具" material={{ mode }}>{TOOLS.map(([id, label], i) => <button key={id} type="button" data-tool={id} aria-label={label} aria-pressed={tool === id} tabIndex={i === 0 ? 0 : -1} onClick={() => setTool(id)}><Icon name={id} /></button>)}<GlassToolbarSeparator /><button type="button" id="undo-tool" aria-label="重置工具" tabIndex={-1} onClick={() => setTool('cursor')}><Icon name="undo" /></button></GlassToolbar></div></div>
          </div>
        </section>
      </main>
      <footer className="footer"><span>Web 视觉近似，非 Apple 原生材质。增强折射在 Chromium 中验证；其他浏览器默认使用 CSS 降级。</span><code>LOCAL MEDIA · RELATIVE PATHS · LIGHT</code></footer>
    </div>
    <div className="media-toast" id="media-toast" role="status" hidden={!media.toast}>{media.toast}</div>
  </>;
}
