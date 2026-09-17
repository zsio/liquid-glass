import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import bundledCatalog from '../../public/assets/media.json';

export type Backdrop = 'wallpaper' | 'video' | 'spectrum' | 'text' | 'grid';
export interface MediaItem {
  id: string; type: 'wallpaper' | 'video'; label: string; src: string;
  poster?: string; thumb?: string; code?: string; tone?: 'dark' | 'light'; local?: boolean;
}
const INITIAL_SELECTION = { wallpaper: 'yunxi', video: 'pearl-motion' };
const palettes = [
  'linear-gradient(90deg,#02b6d7,#266cd9 18%,#7054d4 34%,#d838aa 49%,#f64964 65%,#ffae36 80%,#dadf39 92%,#62c764)',
  'linear-gradient(90deg,#3750b9,#447cca 18%,#15b5c8 40%,#67cbb9 62%,#b2d980 82%,#e5df69)',
  'linear-gradient(90deg,#bc56a5,#ee767c 24%,#e89359 43%,#c79759 67%,#85a282 85%,#478a99)',
];
export function useStudioMedia() {
  const [catalog, setCatalog] = useState<MediaItem[]>(bundledCatalog as MediaItem[]);
  const [backdrop, setBackdrop] = useState<Backdrop>('spectrum');
  const [selection, setSelection] = useState(INITIAL_SELECTION);
  const [custom, setCustom] = useState<Partial<Record<'wallpaper' | 'video', MediaItem>>>({});
  const [tone, setTone] = useState<'light' | 'dark'>('dark');
  const [palette, setPalette] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [failure, setFailure] = useState(false), [status, setStatus] = useState('背景折射，前景文字保持清晰。');
  const [toast, setToast] = useState('');
  const [samplePoster, setSamplePoster] = useState('./assets/wallpapers/yunxi.webp');
  const video = useRef<HTMLVideoElement>(null), file = useRef<HTMLInputElement>(null);
  const owned = useRef(new Set<string>()), pending = useRef(0), alive = useRef(false);
  const customRef = useRef(custom); customRef.current = custom;
  const playTicket = useRef(0), explicitlyPlayed = useRef(false), wasPlaying = useRef(false);
  const latest = useRef({ backdrop, label: '', failure });
  const isMedia = backdrop === 'wallpaper' || backdrop === 'video';
  const candidates = isMedia ? [...catalog.filter(a => a.type === backdrop), ...(custom[backdrop] ? [custom[backdrop]!] : [])] : [];
  const active = isMedia ? candidates.find(a => a.id === selection[backdrop]) || candidates[0] : undefined;
  const poster = active?.poster || (backdrop === 'wallpaper' ? active?.src : undefined);
  latest.current = { backdrop, label: active?.label || '', failure };

  useEffect(() => {
    alive.current = true;
    const abort = new AbortController();
    // Keep the public catalog editable after deployment; bundle is a loading fallback.
    fetch('./assets/media.json', { signal: abort.signal }).then(r => { if (!r.ok) throw new Error('catalog'); return r.json(); }).then((data: unknown) => {
      if (alive.current && Array.isArray(data)) {
        const entries = data.filter((a): a is MediaItem => a && typeof a === 'object' && typeof a.id === 'string' && typeof a.src === 'string' && typeof a.label === 'string' && (a.type === 'video' || a.type === 'wallpaper'));
        if (entries.some(a => a.type === 'wallpaper') && entries.some(a => a.type === 'video')) setCatalog(entries);
      }
    }).catch(() => { /* Offline initial rendering uses the bundled identical catalog. */ });
    return () => {
      alive.current = false; pending.current++; playTicket.current++; abort.abort();
      for (const url of owned.current) URL.revokeObjectURL(url);
      owned.current.clear();
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function play(explicit = false) {
    const el = video.current;
    if (!el || latest.current.backdrop !== 'video' || latest.current.failure || document.hidden) return;
    if (explicit) explicitlyPlayed.current = true;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches && !explicitlyPlayed.current) {
      setStatus('减少动态效果已开启 · 点击播放'); return;
    }
    const ticket = ++playTicket.current;
    try {
      el.muted = true;
      await el.play();
      if (alive.current && ticket === playTicket.current) setStatus(`${latest.current.label} · 静音循环视频`);
    } catch (error) {
      if (alive.current && ticket === playTicket.current && (error as Error).name !== 'AbortError') setStatus('视频尚未播放 · 点击右下角播放');
    }
  }
  useEffect(() => {
    const el = video.current;
    playTicket.current++;
    explicitlyPlayed.current = false;
    wasPlaying.current = false;
    setFailure(false); setPlaying(false);
    setTone(active?.tone || 'dark');
    if (poster) setSamplePoster(poster);
    if (backdrop === 'video') {
      latest.current.failure = false;
      setStatus(`${active?.label || '视频'} · 加载视频`);
      if (el) { el.load(); void play(); }
    } else {
      el?.pause();
      setStatus(backdrop === 'wallpaper' ? `${active?.label || '壁纸'} · ${active?.local ? '仅本地预览' : '本地静态资源'}` : backdrop === 'grid' ? '移动镜片，观察网格在曲面处弯折。' : backdrop === 'text' ? '真实 DOM 文字，不是玻璃内置的图片。' : '背景折射，前景文字保持清晰。');
    }
    return () => { playTicket.current++; el?.pause(); };
  }, [backdrop, active?.src, poster]);

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const visibility = () => {
      const el = video.current; if (!el) return;
      if (document.hidden) { wasPlaying.current = !el.paused; el.pause(); }
      else if (wasPlaying.current) { wasPlaying.current = false; void play(); }
    };
    const motion = () => {
      if (!reduced.matches) return;
      explicitlyPlayed.current = false; video.current?.pause();
      if (latest.current.backdrop === 'video') setStatus('减少动态效果已开启 · 点击播放');
    };
    const pagehide = () => video.current?.pause();
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', pagehide);
    reduced.addEventListener('change', motion);
    return () => {
      video.current?.pause();
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pagehide', pagehide);
      reduced.removeEventListener('change', motion);
    };
  }, []);
  async function importFile(e: ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.currentTarget.files?.[0]; e.currentTarget.value = '';
    if (!selectedFile) return;
    const ticket = ++pending.current;
    const type = /^image\/(jpeg|png|webp|gif|avif)$/.test(selectedFile.type) ? 'wallpaper' : /^video\/(mp4|webm|quicktime)$/.test(selectedFile.type) ? 'video' : null;
    if (!type) { setToast('请选择 JPG、PNG、WebP、GIF、AVIF 图片，或 MP4 / WebM / MOV 视频。'); return; }
    if (selectedFile.size > (type === 'video' ? 200 : 30) * 1024 * 1024) { setToast(type === 'video' ? '视频请控制在 200 MB 以内。' : '图片请控制在 30 MB 以内。'); return; }
    const url = URL.createObjectURL(selectedFile); owned.current.add(url);
    setToast('正在读取本地文件，不会上传…');
    try {
      const decoded = await decodeLocal(url, type);
      if (!alive.current || ticket !== pending.current) { URL.revokeObjectURL(url); owned.current.delete(url); return; }
      const previous = customRef.current[type];
      const item: MediaItem = { id: `local-${type}`, type, src: url, label: selectedFile.name, local: true, code: 'LOCAL / PRIVATE', tone: 'dark', ...decoded };
      setCustom(current => ({ ...current, [type]: item }));
      setSelection(current => ({ ...current, [type]: item.id }));
      setBackdrop(type);
      if (previous) { URL.revokeObjectURL(previous.src); owned.current.delete(previous.src); }
      setToast('已载入本地文件。文字明暗可用预览区下方的半圆按钮切换。');
    } catch (error) {
      URL.revokeObjectURL(url); owned.current.delete(url);
      if (alive.current && ticket === pending.current) setToast(`${(error as Error).message || '读取失败'}，原背景已保留。`);
    }
  }
  function reset() {
    pending.current++; explicitlyPlayed.current = false; wasPlaying.current = false;
    setSelection(INITIAL_SELECTION); setBackdrop('spectrum'); setTone('dark'); setPalette(0); setFailure(false); setToast('');
  }
  return {
    backdrop, setBackdrop, isMedia, active, candidates, poster, selection,
    select(item: MediaItem) { setSelection(s => ({ ...s, [item.type]: item.id })); setBackdrop(item.type); },
    tone, toggleTone: () => setTone(t => t === 'dark' ? 'light' : 'dark'),
    palette: palettes[palette], nextPalette: () => setPalette(p => (p + 1) % palettes.length),
    video, file, playing, failure, status, toast, samplePoster, importFile, reset,
    togglePlay() { const el = video.current; if (!el) return; if (el.paused) void play(true); else { el.pause(); setStatus(`${latest.current.label} · 已暂停`); } },
    videoEvents: {
      onPlay: () => setPlaying(true), onPause: () => setPlaying(false),
      onError: () => { if (latest.current.backdrop === 'video') { setFailure(true); setStatus('此视频无法解码 · 已保留静态封面'); setToast('视频解码失败，试试导入其他 MP4 / WebM 视频。'); } },
    },
    imageError: () => { if (backdrop === 'wallpaper') setStatus('图片加载失败 · 请重新选择素材'); },
  };
}
async function decodeLocal(url: string, type: 'wallpaper' | 'video'): Promise<{ poster: string; thumb: string }> {
  const canvas = document.createElement('canvas'); canvas.width = 192; canvas.height = 120;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('无法生成预览');
  if (type === 'wallpaper') {
    const image = new Image(); image.src = url; await image.decode();
    if (!image.naturalWidth) throw new Error('无法读取图片');
    const ratio = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const w = image.naturalWidth * ratio, h = image.naturalHeight * ratio;
    ctx.drawImage(image, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    return { poster: url, thumb: canvas.toDataURL('image/jpeg', .84) };
  }
  const el = document.createElement('video'); el.muted = true; el.playsInline = true; el.preload = 'auto';
  try {
    await new Promise<void>((resolve, reject) => {
      const finish = (error?: string) => { window.clearTimeout(timer); el.onloadeddata = null; el.onerror = null; error ? reject(new Error(error)) : resolve(); };
      const timer = window.setTimeout(() => finish('视频读取超时'), 12000);
      el.onloadeddata = () => finish(); el.onerror = () => finish('浏览器无法解码这个视频');
      el.src = url; el.load();
    });
    if (!el.videoWidth) throw new Error('视频没有可用画面');
    canvas.width = 480; canvas.height = 300; ctx.drawImage(el, 0, 0, canvas.width, canvas.height);
    const poster = canvas.toDataURL('image/jpeg', .84); return { poster, thumb: poster };
  } finally { el.pause(); el.removeAttribute('src'); el.load(); }
}
