/** DOM backdrop optics. Canvas encodes material parameters, never a screenshot. */
export type GlassMode = 'auto' | 'svg' | 'css';
export interface GlassOptions {
  radius?: number;
  refraction?: number;
  bevel?: number;
  blur?: number;
  dispersion?: number;
  tint?: string;
  mode?: GlassMode;
}
export interface GlassController {
  update(options: GlassOptions): void;
  refresh(): void;
  destroy(): void;
  readonly renderer: 'svg' | 'css' | 'solid';
}
const NS = 'http://www.w3.org/2000/svg';
export const GLASS_DEFAULTS: Required<GlassOptions> = {
  radius: 40, refraction: 56, bevel: 22, blur: .35,
  dispersion: 1.2, tint: 'rgba(255,255,255,.018)', mode: 'auto',
};
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(n, b));
function number(v: number | undefined, fallback: number, a: number, b: number) {
  return typeof v === 'number' && Number.isFinite(v) ? clamp(v, a, b) : fallback;
}
function normalize(v: GlassOptions): Required<GlassOptions> {
  const d = GLASS_DEFAULTS;
  return {
    radius: number(v.radius,d.radius,0,10000), refraction: number(v.refraction,d.refraction,0,100),
    bevel: number(v.bevel,d.bevel,2,100), blur: number(v.blur,d.blur,0,24),
    dispersion: number(v.dispersion,d.dispersion,0,5), tint: v.tint ?? d.tint,
    mode: v.mode === 'svg' || v.mode === 'css' ? v.mode : 'auto',
  };
}
/** Conservative routing, not a pixel-level browser capability test. */
export function useSVGBackdrop(): boolean {
  if (typeof navigator === 'undefined' || typeof CSS === 'undefined') return false;
  const ua=navigator.userAgent;
  const ios=/iPad|iPhone|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1);
  return !ios && /Chrome\/|Chromium\/|Edg\//.test(ua) && CSS.supports('backdrop-filter','url("#probe")');
}
function element<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string,string> = {}): SVGElementTagNameMap[K] {
  const el=document.createElementNS(NS,tag);
  Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));
  return el;
}
interface Textures { displacement: string; lighting: string; rim: string }
const cache = new Map<string, Textures>();
/**
 * A rounded lip with an almost planar interior. Refraction is an art-directed
 * Snell-law approximation, NOT a physically complete ray tracer or Apple's shader.
 * The lookup table avoids evaluating inverse trigonometry for every texture pixel.
 */
const PROFILE_STEPS=1024;
const profile=Float32Array.from({length:PROFILE_STEPS+1},(_,i)=>{
  const t=i/PROFILE_STEPS;
  const sinIncident=Math.pow(1-t,1.28)*.985;
  const incident=Math.asin(sinIncident), transmitted=Math.asin(sinIncident/1.46);
  const thickness=.72+.28*Math.sqrt(Math.max(0,1-(1-t)*(1-t)));
  const edge=Math.tan(Math.asin(.985)-Math.asin(.985/1.46))*.72;
  return .92*Math.tan(incident-transmitted)*thickness/edge;
});
function optics(width: number, height: number, radius: number, bevel: number): Textures {
  // At least 2x for a smooth thin rim; cap allocation for very large panels.
  const density=Math.min(Math.max(2,Math.min(globalThis.devicePixelRatio || 1,2.5)),1536/Math.max(width,height));
  const w=Math.max(2,Math.ceil(width*density)),h=Math.max(2,Math.ceil(height*density));
  const key=[width,height,radius,bevel,w,h].join('/');
  const cached=cache.get(key);
  if(cached){cache.delete(key);cache.set(key,cached);return cached;}
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('Canvas 2D is unavailable.');
  const map=ctx.createImageData(w,h),light=ctx.createImageData(w,h),rim=ctx.createImageData(w,h);
  const r=Math.min(radius,width/2,height/2),b=Math.min(bevel,width/2,height/2);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const px=(x+.5)/w*width-width/2,py=(y+.5)/h*height-height/2;
    const qx=Math.abs(px)-(width/2-r),qy=Math.abs(py)-(height/2-r);
    const ox=Math.max(qx,0),oy=Math.max(qy,0),len=Math.hypot(ox,oy);
    const d=len+Math.min(Math.max(qx,qy),0)-r;
    let nx=0,ny=0;
    if(len>.0001){nx=ox/len*Math.sign(px);ny=oy/len*Math.sign(py);}
    else if(qx>qy)nx=Math.sign(px);else ny=Math.sign(py);
    const s=Math.max(0,-d),t=clamp(s/b,0,1);
    const ti=t*PROFILE_STEPS,j=Math.min(PROFILE_STEPS-1,Math.floor(ti));
    // Extend the normal field outside rounded corners for filter sampling.
    const bend=profile[j]+(profile[j+1]-profile[j])*(ti-j);
    const i=(y*w+x)*4;
    // The shader smooths the displacement field, not the final background image.
    map.data[i]=Math.round(127.5-nx*bend*127.5);
    map.data[i+1]=Math.round(127.5-ny*bend*127.5);
    map.data[i+3]=255;
    if(d>0)continue;
    const coverage=clamp(.5-d*density,0,1);
    const top=Math.max(0,-nx*.40-ny*.9165);
    const bottom=Math.max(0,nx*.22+ny*.9755);
    const side=Math.max(0,nx*.95-ny*.31);
    const edge=Math.exp(-Math.pow((s-.72)/.60,2));
    const inner=Math.exp(-Math.pow((s-2.5)/1.32,2));
    const shoulder=Math.exp(-Math.pow((s-b*.31)/(b*.29),2));
    // Narrow specular edge, a secondary polished lip, then a broad soft shoulder.
    // The right-side extinction is deliberately faint, not a grey plastic outline.
    const white=edge*(.08+.78*Math.pow(top,2)+.64*Math.pow(bottom,5))
      +inner*.16*Math.pow(top,4)+shoulder*(.033*top+.054*Math.pow(bottom,3));
    const shade=Math.exp(-Math.pow((s-1.8)/.86,2))*.21*side
      +shoulder*.032*side;
    const v=white-shade;
    light.data[i]=v>=0?255:37;light.data[i+1]=v>=0?255:46;light.data[i+2]=v>=0?255:62;
    light.data[i+3]=Math.round(clamp(Math.abs(v),0,.96)*255*coverage);
    // Blue channel is a tiny, edge-only internal-reflection weight.
    // Its colour will come from a second live backdrop sample, never a rainbow fill.
    const glancing=Math.exp(-Math.pow((s-1.25)/1.15,2));
    map.data[i+2]=Math.round(255*.20*glancing*coverage);
    rim.data[i]=rim.data[i+1]=rim.data[i+2]=255;
    rim.data[i+3]=Math.round(255*coverage*(edge*.85+inner*.20));
  }
  ctx.putImageData(map,0,0);const displacement=canvas.toDataURL();
  ctx.putImageData(light,0,0);const lighting=canvas.toDataURL();
  ctx.putImageData(rim,0,0);const rimURL=canvas.toDataURL();
  const data={displacement,lighting,rim:rimURL};
  if(cache.size>=24)cache.delete(cache.keys().next().value!);
  cache.set(key,data);return data;
}
/**
 * The host needs direct .lg-surface/.lg-light children and a nonzero size.
 * Ancestor filter/opacity/mask/backdrop roots can limit the visible backdrop.
 * Every instance owns its filter IDs, observers, event handlers and animation frames.
 */
export function mountLiquidGlass(host: HTMLElement, initial: GlassOptions = {}): GlassController {
  const surface=host.querySelector<HTMLElement>(':scope > .lg-surface');
  const lighting=host.querySelector<HTMLElement>(':scope > .lg-light');
  if(!surface||!lighting)throw new Error('Missing .lg-surface / .lg-light layer.');
  let options=normalize(initial),dead=false,failed=false,frame=0,lightFrame=0,geometry='';
  let renderer:'svg'|'css'|'solid'='css';
  const id='lens-'+(globalThis.crypto?.randomUUID?.()??Math.random().toString(36).slice(2)+Date.now());
  const root=element('svg',{width:'0',height:'0','aria-hidden':'true','data-lg-defs':'',focusable:'false'});
  root.style.cssText='position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  const defs=element('defs'),filter=element('filter',{
    id,filterUnits:'userSpaceOnUse',primitiveUnits:'userSpaceOnUse','color-interpolation-filters':'sRGB',
  });
  const blur=element('feGaussianBlur',{in:'SourceGraphic',stdDeviation:String(options.blur),result:'source'});
  const map=element('feImage',{x:'0',y:'0',preserveAspectRatio:'none',result:'raw-map'});
  const mapSmooth=element('feGaussianBlur',{in:'raw-map',stdDeviation:'.55',edgeMode:'duplicate',result:'map'});
  filter.append(blur,map,mapSmooth);
  const displacements:SVGFEDisplacementMapElement[]=[];
  for(let c=0;c<3;c++){
    const displacement=element('feDisplacementMap',{in:'source',in2:'map',scale:'0',xChannelSelector:'R',yChannelSelector:'G',result:'d'+c});
    const m=Array(20).fill(0);m[c*5+c]=1;m[18]=1;
    filter.append(displacement,element('feColorMatrix',{in:'d'+c,type:'matrix',values:m.join(' '),result:'c'+c}));
    displacements.push(displacement);
  }
  filter.append(element('feBlend',{in:'c0',in2:'c1',mode:'screen',result:'rg'}),element('feBlend',{in:'rg',in2:'c2',mode:'screen',result:'refracted'}));
  const reflected=element('feDisplacementMap',{in:'source',in2:'map',scale:'0',xChannelSelector:'R',yChannelSelector:'G',result:'edge-sample'});
  const weight=element('feColorMatrix',{in:'map',type:'matrix',values:'0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 1 0 0',result:'edge-weight'});
  filter.append(reflected,weight,
    element('feComposite',{in:'edge-sample',in2:'edge-weight',operator:'in',result:'reflection'}),
    element('feBlend',{in:'refracted',in2:'reflection',mode:'screen',result:'optics'}),
    element('feGaussianBlur',{in:'optics',stdDeviation:'.48'}));
  defs.append(filter);root.append(defs);document.body.append(root);
  const media=['(prefers-reduced-transparency: reduce)','(prefers-contrast: more)','(forced-colors: active)'].map(q=>matchMedia(q));
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const owned=['--lg-radius','--lg-tint','--lg-pointer-x','--lg-pointer-y'];
  const saved=owned.map(k=>[k,host.style.getPropertyValue(k)]);
  const savedRenderer=host.getAttribute('data-glass-renderer');
  const savedFilter=surface.style.backdropFilter,savedWebkit=surface.style.getPropertyValue('-webkit-backdrop-filter');
  const savedLight=lighting.style.backgroundImage,savedMask=lighting.style.getPropertyValue('--lg-rim-mask');
  function render(){
    if(dead)return;frame=0;
    const w=host.offsetWidth,h=host.offsetHeight,r=Math.min(options.radius,w/2,h/2);
    host.style.setProperty('--lg-radius',options.radius+'px');host.style.setProperty('--lg-tint',options.tint);
    const accessible=media.some(m=>m.matches);
    renderer=accessible?'solid':(!failed&&options.mode!=='css'&&(options.mode==='svg'||useSVGBackdrop())?'svg':'css');
    if(w>0&&h>0&&!failed&&!accessible){
      try{
        const key=[w,h,r,options.bevel,globalThis.devicePixelRatio||1].join('/');
        if(key!==geometry){
          const textures=optics(w,h,r,options.bevel);
          map.setAttribute('width',String(w));map.setAttribute('height',String(h));map.setAttribute('href',textures.displacement);
          lighting!.style.backgroundImage=`url("${textures.lighting}")`;
          lighting!.style.setProperty('--lg-rim-mask',`url("${textures.rim}")`);
          geometry=key;
        }
        // Leave room for blur and near-edge sampling. CSS clips the final surface
        // to its actual border-radius; padding is not a visible layout expansion.
        const pad=Math.ceil(options.refraction/2+options.blur*3+4);
        filter.setAttribute('x',String(-pad));filter.setAttribute('y',String(-pad));
        filter.setAttribute('width',String(w+pad*2));filter.setAttribute('height',String(h+pad*2));
        blur.setAttribute('stdDeviation',String(options.blur));
        const strength=Math.min(options.refraction,Math.min(w,h)*.46);
        const separation=options.refraction===0?0:Math.min(options.dispersion,strength*.10);
        displacements.forEach((node,c)=>node.setAttribute('scale',String(strength+(c-1)*separation)));
        reflected.setAttribute('scale',String(-strength*.22));
      }catch(e){failed=true;renderer='css';console.warn('[LiquidGlass] Using CSS fallback.',e);}
    }
    const value=renderer==='solid'?'none':renderer==='svg'?`url("#${id}")`:`blur(${Math.max(options.blur,5)}px) saturate(1.08)`;
    surface!.style.backdropFilter=value;surface!.style.setProperty('-webkit-backdrop-filter',value);
    host.dataset.glassRenderer=renderer;
  }
  function schedule(){if(!frame&&!dead)frame=requestAnimationFrame(render);}
  let targetX=28,targetY=12,currentX=28,currentY=12,lastTime=0,targetTime=0;
  function animateLight(time:number){
    lightFrame=0;if(dead)return;
    const mix=1-Math.exp(-Math.min(64,lastTime?time-lastTime:16)/62);lastTime=time;
    currentX+=(targetX-currentX)*mix;currentY+=(targetY-currentY)*mix;
    // Finish by time, even on throttled or software-rendered browsers.
    if(time-targetTime>450){currentX=targetX;currentY=targetY;}
    host.style.setProperty('--lg-pointer-x',currentX.toFixed(3)+'%');
    host.style.setProperty('--lg-pointer-y',currentY.toFixed(3)+'%');
    if(Math.abs(targetX-currentX)+Math.abs(targetY-currentY)>.04)lightFrame=requestAnimationFrame(animateLight);
    else lastTime=0;
  }
  function moveLight(x:number,y:number){
    targetX=x;targetY=y;targetTime=performance.now();
    if(!dead&&!lightFrame&&!motion.matches)lightFrame=requestAnimationFrame(animateLight);
  }
  function pointer(e:PointerEvent){
    if(motion.matches||renderer==='solid')return;
    const r=host.getBoundingClientRect();if(!r.width||!r.height)return;
    moveLight(clamp((e.clientX-r.left)/r.width*100,0,100),clamp((e.clientY-r.top)/r.height*100,0,100));
  }
  function leave(){moveLight(28,12);}
  function onMotion(){
    if(motion.matches){cancelAnimationFrame(lightFrame);lightFrame=0;currentX=targetX=28;currentY=targetY=12;lastTime=0;
      host.style.setProperty('--lg-pointer-x','28%');host.style.setProperty('--lg-pointer-y','12%');}
  }
  const observer=new ResizeObserver(schedule);observer.observe(host);
  media.forEach(m=>m.addEventListener('change',schedule));motion.addEventListener('change',onMotion);
  window.addEventListener('resize',schedule,{passive:true});
  host.addEventListener('pointermove',pointer,{passive:true});host.addEventListener('pointerleave',leave);
  render();
  return {
    get renderer(){return renderer;},update(v){options=normalize({...options,...v});schedule();},refresh:schedule,
    destroy(){
      if(dead)return;dead=true;cancelAnimationFrame(frame);cancelAnimationFrame(lightFrame);observer.disconnect();
      media.forEach(m=>m.removeEventListener('change',schedule));motion.removeEventListener('change',onMotion);
      window.removeEventListener('resize',schedule);host.removeEventListener('pointermove',pointer);host.removeEventListener('pointerleave',leave);root.remove();
      saved.forEach(([k,v])=>v?host.style.setProperty(k,v):host.style.removeProperty(k));
      if(savedRenderer===null)delete host.dataset.glassRenderer;else host.dataset.glassRenderer=savedRenderer;
      surface!.style.backdropFilter=savedFilter;surface!.style.setProperty('-webkit-backdrop-filter',savedWebkit);
      lighting!.style.backgroundImage=savedLight;
      if(savedMask)lighting!.style.setProperty('--lg-rim-mask',savedMask);else lighting!.style.removeProperty('--lg-rim-mask');
    },
  };
}
