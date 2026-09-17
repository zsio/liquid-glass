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
/** Queue a mounted, absolutely positioned glass host's translation.
 * Movement and pointer lighting share one frame; this owns left/top/transform.
 */
export declare function setLiquidGlassPosition(host: HTMLElement, x: number, y: number): void;
export declare const GLASS_DEFAULTS: Required<GlassOptions>;
export declare function useSVGBackdrop(): boolean;
/**
 * The host needs direct .lg-surface/.lg-light children and a nonzero size.
 * Ancestor filter/opacity/mask/backdrop roots can limit the visible backdrop.
 * Every instance owns its filter IDs, observers, event handlers and animation
 * frames; texture synthesis is delegated to one shared, refcounted worker.
 */
export declare function mountLiquidGlass(host: HTMLElement, initial?: GlassOptions): GlassController;
