import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import BasicExample from './basic';
import ButtonsExample from './buttons';
import SettingsExample from './settings';
import SelectionExample from './selection';
import basicCode from './basic.tsx?raw';
import buttonsCode from './buttons.tsx?raw';
import settingsCode from './settings.tsx?raw';
import selectionCode from './selection.tsx?raw';
import './page.css';

const install='npx shadcn@latest add https://glass.zs.uy/r/liquid-glass.json';
const examples=[
  {id:'basic',name:'玻璃容器',label:'LiquidGlass',file:'basic.tsx',description:'包裹自己的内容，就有透明、折射与边缘高光。文字仍是普通 HTML。',tip:'外层 style 控制尺寸，contentStyle 控制内容内边距。',Component:BasicExample,code:basicCode},
  {id:'buttons',name:'按钮与收藏',label:'GlassButton',file:'buttons.tsx',description:'保留原生按钮的点击、禁用和可访问性接口，材质由组件处理。',tip:'图标按钮需要 aria-label，切换按钮使用 aria-pressed。',Component:ButtonsExample,code:buttonsCode},
  {id:'settings',name:'开关与滑块',label:'GlassSwitch / Slider',file:'settings.tsx',description:'用 React 状态控制开关和数值。试着拖动滑块，或使用键盘调整。',tip:'checked / value 表示当前状态，回调负责更新状态。',Component:SettingsExample,code:settingsCode},
  {id:'selection',name:'选择与工具栏',label:'Segmented / Chip / Toolbar',file:'selection.tsx',description:'单选、多选和工具切换。分段选择与工具栏支持方向键导航。',tip:'不同控件平行摆放，使用同一背景呈现玻璃质感。',Component:SelectionExample,code:selectionCode},
];
function currentExample(){const id=location.hash.slice(1);return examples.some(item=>item.id===id)?id:'basic';}
function CopyButton({text,label='复制代码'}:{text:string;label?:string}){
  const [status,setStatus]=useState('');const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
  useEffect(()=>{setStatus('');if(timer.current)clearTimeout(timer.current);},[text]);
  async function copy(){
    try{await navigator.clipboard.writeText(text);setStatus('已复制');}
    catch{setStatus('请手动选择代码复制');}
    if(timer.current)clearTimeout(timer.current);
    timer.current=setTimeout(()=>setStatus(''),3500);
  }
  return <span className="copy-action"><button type="button" onClick={copy}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3"/></svg>{status==='已复制'?status:label}</button><span className="copy-status" role="status">{status==='已复制'?'已复制到剪贴板':status}</span></span>;
}
function App(){
  const [selected,setSelected]=useState(currentExample);
  const [background,setBackground]=useState('bands');
  useEffect(()=>{const update=()=>setSelected(currentExample());window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update);},[]);
  const active=examples.find(item=>item.id===selected)!;const Preview=active.Component;
  return <div className="examples-shell">
    <header className="examples-header"><a className="brand" href="../"><span className="brand-mark" aria-hidden="true"/>GLASS / MATERIALS</a><nav aria-label="站点导航"><a href="../">材质工作台 ↗</a><a href="../INSTALL.md">完整文档 ↗</a></nav></header>
    <section className="intro"><div><p className="eyebrow">REACT COMPONENTS / EXAMPLES</p><h1>把玻璃，放进你的界面。</h1><p className="intro-description">选一个示例，试试交互，再复制完整代码。</p></div><span className="intro-number" aria-hidden="true">04<span>种用法</span></span></section>
    <section className="install-bar" aria-label="安装组件"><span className="step-label">01 / 安装</span><code>{install}</code><CopyButton text={install} label="复制命令"/></section>
    <p className="install-note">在已初始化 shadcn 的 React + TypeScript 项目中运行。组件与样式自动安装；代码里的导入别名按你的项目调整。</p>
    <main className="examples-layout">
      <aside className="examples-sidebar"><p className="step-label">02 / 选择示例</p><nav aria-label="组件示例">{examples.map((item,i)=><a key={item.id} href={`#${item.id}`} aria-current={selected===item.id?'location':undefined}><span className="nav-number">0{i+1}</span><span>{item.name}<small>{item.label}</small></span><span className="nav-arrow" aria-hidden="true">↗</span></a>)}</nav><p className="sidebar-note">鼠标悬停观察高光。<br/>按钮、开关与滑块都可以操作。</p></aside>
      <section className="example-detail" aria-label={active.name}>
        <div className="detail-heading"><div><p className="eyebrow">{active.label}</p><h2>{active.name}</h2></div><span className="live-label"><i/>实际组件</span></div>
        <p className="detail-description">{active.description}</p>
        <div className="preview-frame"><div className="preview-toolbar"><span>效果预览</span><div role="group" aria-label="预览背景">{[['bands','色带'],['grid','网格']].map(([id,label])=><button key={id} type="button" aria-pressed={background===id} onClick={()=>setBackground(id)}>{label}</button>)}</div></div><div className="preview-scene" data-scene={background}><div className="scene-decoration" aria-hidden="true"><span className="scene-word">Clarity.</span><span className="scene-band"/><span className="scene-band second"/></div><div className="preview-component"><Preview key={selected}/></div><span className="scene-caption" aria-hidden="true">LIVE BACKGROUND / REAL CONTENT</span></div><p className="preview-tip">{active.tip}</p></div>
        <section className="code-panel" aria-label="完整示例代码"><div className="code-toolbar"><span><b aria-hidden="true">TSX</b> examples/{active.file}</span><CopyButton text={active.code}/></div><pre tabIndex={0} aria-label={`${active.file} 源码`}><code>{active.code}</code></pre></section>
        <p className="code-note">这份源码就是上方运行的示例。背景色带由预览区提供，不需要随组件复制。</p>
      </section>
    </main>
    <footer className="examples-footer"><p>增强折射在符合条件的桌面 Chromium 启用；其他浏览器默认呈现 CSS 毛玻璃。纯色背景下，折射纹理不明显。</p><a href="../">返回工作台 ↑</a></footer>
  </div>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
