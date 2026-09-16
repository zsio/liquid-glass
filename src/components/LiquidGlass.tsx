'use client';

import {
  forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef,
} from 'react';
import type {
  ButtonHTMLAttributes, CSSProperties, HTMLAttributes, InputHTMLAttributes, KeyboardEvent, ReactNode,
} from 'react';
import { mountLiquidGlass } from '../glass';
import type { GlassController, GlassOptions } from '../glass';
import '../glass.css';

const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
function useMaterial<T extends HTMLElement>(options: GlassOptions) {
  const ref=useRef<T>(null), controller=useRef<GlassController | null>(null);
  const latest=useRef(options);latest.current=options;
  const {radius,refraction,bevel,blur,dispersion,tint,mode}=options;
  useClientLayoutEffect(()=>{
    if(!ref.current) return;
    const instance=mountLiquidGlass(ref.current,latest.current);controller.current=instance;
    return ()=>{instance.destroy();controller.current=null;};
  },[]);
  useClientLayoutEffect(()=>{
    controller.current?.update({radius,refraction,bevel,blur,dispersion,tint,mode});
  },[radius,refraction,bevel,blur,dispersion,tint,mode]);
  return ref;
}
function Surface() {
  return <><span className="lg-surface" aria-hidden="true"/><span className="lg-light" aria-hidden="true"/><span className="lg-sheen" aria-hidden="true"/></>;
}
export interface LiquidGlassProps extends HTMLAttributes<HTMLDivElement>, GlassOptions {
  /** 'none' removes only the wrapper ring; native child controls keep focus. */
  focusRing?: 'auto' | 'none';
  contentClassName?: string;
  contentStyle?: CSSProperties;
}
/** Material wrapper. Children remain regular DOM, outside the SVG filter. */
export const LiquidGlass=forwardRef<HTMLDivElement,LiquidGlassProps>(function LiquidGlass({
  radius=40,refraction=56,bevel=22,blur=.35,dispersion=1.2,tint='rgba(255,255,255,.018)',mode='auto',
  className='',children,style,contentStyle,contentClassName='',focusRing='auto',...rest
},forwardedRef){
  const ref=useMaterial<HTMLDivElement>({radius,refraction,bevel,blur,dispersion,tint,mode});
  useImperativeHandle(forwardedRef,()=>ref.current!,[]);
  return <div {...rest} ref={ref} className={`lg ${className}`} data-focus-ring={focusRing} style={style}>
    <Surface/>
    <div className={`lg-content ${contentClassName}`} style={contentStyle}>{children}</div>
  </div>;
});

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  material?: GlassOptions;
  wrapperClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'icon';
  variant?: 'default' | 'accent';
}
export const GlassButton=forwardRef<HTMLButtonElement,GlassButtonProps>(function GlassButton({
  children,material,wrapperClassName='',size='md',variant='default',type='button',...rest
},ref){
  return <LiquidGlass radius={size==='icon'?99:12} bevel={7} refraction={15} blur={.35} dispersion={.25} tint="rgba(255,255,255,.21)" {...material} className={`lg-button ${wrapperClassName}`} data-size={size} data-variant={variant}>
    <button {...rest} ref={ref} type={type}>{children}</button>
  </LiquidGlass>;
});

export interface GlassSwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>,'onChange'|'aria-checked'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  material?: GlassOptions;
}
export const GlassSwitch=forwardRef<HTMLButtonElement,GlassSwitchProps>(function GlassSwitch({
  checked,onCheckedChange,material,className='',onClick,...rest
},ref){
  const thumb=useMaterial<HTMLSpanElement>({radius:99,bevel:5,refraction:8,blur:.2,dispersion:.15,tint:'rgba(255,255,255,.82)',...material});
  return <button {...rest} ref={ref} type="button" role="switch" aria-checked={checked} className={`lg-switch ${className}`}
    onClick={e=>{onClick?.(e);if(!e.defaultPrevented)onCheckedChange(!checked);}}>
    <span className="lg-switch-track" aria-hidden="true"/>
    <span ref={thumb} className="lg lg-switch-thumb" aria-hidden="true"><Surface/></span>
  </button>;
});

export interface GlassSliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>,'type'|'value'|'defaultValue'|'min'|'max'|'step'|'onChange'> {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange: (value: number) => void;
  material?: GlassOptions;
  wrapperClassName?: string;
}
export const GlassSlider=forwardRef<HTMLInputElement,GlassSliderProps>(function GlassSlider({
  value,min=0,max=100,step=1,onValueChange,material,wrapperClassName='',...rest
},ref){
  if(!Number.isFinite(min)||!Number.isFinite(max)||max<=min) throw new Error('GlassSlider needs finite min < max.');
  if(!Number.isFinite(step)||step<=0) throw new Error('GlassSlider step must be positive.');
  const safe=Number.isFinite(value)?Math.max(min,Math.min(max,value)):min;
  const progress=(safe-min)/(max-min);
  return <div className={`lg-range ${wrapperClassName}`} style={{'--p':progress} as CSSProperties}>
    <div className="lg-range-track" aria-hidden="true"><div className="lg-range-fill"/></div>
    <LiquidGlass radius={99} bevel={5} refraction={9} blur={.25} dispersion={.18} tint="rgba(255,255,255,.44)" {...material} className="lg-range-thumb" aria-hidden="true"/>
    <input {...rest} ref={ref} type="range" min={min} max={max} step={step} value={safe}
      onChange={e=>onValueChange(e.currentTarget.valueAsNumber)}/>
  </div>;
});


export interface GlassIconButtonProps extends Omit<GlassButtonProps,'size'> {
  'aria-label': string;
}
/** A compact round button. Its accessible name is required. */
export const GlassIconButton=forwardRef<HTMLButtonElement,GlassIconButtonProps>(function GlassIconButton(props,ref){
  return <GlassButton {...props} ref={ref} size="icon"/>;
});

export interface GlassSegmentOption { value: string; label: ReactNode; disabled?: boolean }
export interface GlassSegmentedProps extends Omit<HTMLAttributes<HTMLDivElement>,'onChange'|'children'> {
  options: GlassSegmentOption[];
  value: string;
  onValueChange: (value: string) => void;
  material?: GlassOptions;
  'aria-label': string;
}
function nextKeyIndex(e:KeyboardEvent<HTMLElement>,index:number,length:number){
  if(!length)return null;
  const backwards=e.key==='ArrowLeft'||e.key==='ArrowUp';
  const forwards=e.key==='ArrowRight'||e.key==='ArrowDown';
  if(backwards)return (index-1+length)%length;
  if(forwards)return (index+1)%length;
  if(e.key==='Home')return 0;
  if(e.key==='End')return length-1;
  return null;
}
/** Mutually exclusive choices, with roving keyboard focus and no nested backdrop. */
export const GlassSegmented=forwardRef<HTMLDivElement,GlassSegmentedProps>(function GlassSegmented({
  options,value,onValueChange,material,className='',onKeyDown,...rest
},ref){
  const enabled=options.filter(o=>!o.disabled);
  const focusValue=enabled.some(o=>o.value===value)?value:enabled[0]?.value;
  return <LiquidGlass {...rest} ref={ref} radius={13} bevel={7} refraction={14} blur={.4} dispersion={.25} tint="rgba(255,255,255,.16)" {...material}
    role="radiogroup" className={`lg-segmented ${className}`} onKeyDown={e=>{
      onKeyDown?.(e);if(e.defaultPrevented)return;
      const buttons=Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="radio"]:not(:disabled)'));
      const i=buttons.indexOf(document.activeElement as HTMLButtonElement);
      if(i<0)return;const next=nextKeyIndex(e,i,buttons.length);if(next===null)return;
      e.preventDefault();buttons[next].focus();onValueChange(enabled[next].value);
    }}>
    {options.map(o=><button key={o.value} type="button" role="radio" aria-checked={value===o.value} disabled={o.disabled}
      tabIndex={o.value===focusValue?0:-1} onClick={()=>onValueChange(o.value)}>{o.label}</button>)}
  </LiquidGlass>;
});

export interface GlassChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>,'onChange'|'aria-pressed'> {
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
  material?: GlassOptions;
  wrapperClassName?: string;
}
export const GlassChip=forwardRef<HTMLButtonElement,GlassChipProps>(function GlassChip({
  selected,onSelectedChange,material,wrapperClassName='',children,onClick,...rest
},ref){
  return <LiquidGlass radius={99} bevel={6} refraction={11} blur={.3} dispersion={.2} tint="rgba(255,255,255,.17)" {...material} className={`lg-chip ${wrapperClassName}`}>
    <button {...rest} ref={ref} type="button" aria-pressed={selected} onClick={e=>{onClick?.(e);if(!e.defaultPrevented)onSelectedChange(!selected);}}>
      <svg className="chip-check" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>{children}
    </button>
  </LiquidGlass>;
});

export interface GlassToolbarProps extends HTMLAttributes<HTMLDivElement> {
  material?: GlassOptions;
  'aria-label': string;
}
/** Use ordinary buttons as children; this container manages arrow-key navigation. */
export const GlassToolbar=forwardRef<HTMLDivElement,GlassToolbarProps>(function GlassToolbar({
  material,className='',children,onKeyDown,onFocus,...rest
},ref){
  return <LiquidGlass {...rest} ref={ref} radius={14} bevel={8} refraction={16} blur={.4} dispersion={.3} tint="rgba(255,255,255,.16)" {...material}
    className={`lg-toolbar ${className}`} role="toolbar"
    onFocus={e=>{onFocus?.(e);const active=e.target as HTMLElement;if(active.tagName!=='BUTTON')return;
      e.currentTarget.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.tabIndex=b===active?0:-1);}}
    onKeyDown={e=>{
      onKeyDown?.(e);if(e.defaultPrevented)return;
      const buttons=Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
      const i=buttons.indexOf(document.activeElement as HTMLButtonElement);if(i<0)return;
      const next=nextKeyIndex(e,i,buttons.length);if(next===null)return;e.preventDefault();buttons[next].focus();
    }}>
    {children}
  </LiquidGlass>;
});
export function GlassToolbarSeparator(){return <span className="lg-toolbar-separator" role="separator" aria-orientation="vertical"/>;}
