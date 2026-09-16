import { useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent, RefObject } from 'react';

type Point = { x: number; y: number };
/** Moves only the host element. React still owns its content and material props. */
export function useDraggableGlass(
  stage: RefObject<HTMLDivElement | null>,
  lens: RefObject<HTMLDivElement | null>,
  shape: string,
  resetKey: number,
) {
  const point = useRef<Point>({ x: 0, y: 0 });
  const moved = useRef(false);
  const drag = useRef<{ id: number; start: Point; origin: Point } | null>(null);
  const [dragging, setDragging] = useState(false);

  function position(x: number, y: number) {
    const s = stage.current, l = lens.current;
    if (!s || !l) return;
    const maxX = Math.max(12, s.clientWidth - l.offsetWidth - 12);
    const maxY = Math.max(12, s.clientHeight - l.offsetHeight - 12);
    point.current = { x: Math.max(12, Math.min(x, maxX)), y: Math.max(12, Math.min(y, maxY)) };
    l.style.left = `${point.current.x}px`;
    l.style.top = `${point.current.y}px`;
  }
  function center() {
    const s = stage.current, l = lens.current;
    if (s && l) position((s.clientWidth - l.offsetWidth) * .57, (s.clientHeight - l.offsetHeight) * .57);
  }
  useLayoutEffect(() => {
    moved.current = false;
    drag.current = null;
    setDragging(false);
    center();
  }, [resetKey]);
  useLayoutEffect(() => {
    const resize = () => moved.current ? position(point.current.x, point.current.y) : center();
    resize();
    const observer = new ResizeObserver(resize);
    if (stage.current) observer.observe(stage.current);
    if (lens.current) observer.observe(lens.current);
    return () => observer.disconnect();
  }, [shape]);
  function stop(e: PointerEvent<HTMLDivElement>) {
    if (!drag.current || drag.current.id !== e.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  }
  return {
    dragging,
    events: {
      onPointerDown(e: PointerEvent<HTMLDivElement>) {
        if (e.button !== 0 || !e.isPrimary) return;
        // Avoid stealing a gesture if a caller adds an interactive child later.
        if ((e.target as HTMLElement).closest('button,input,a,textarea,select')) return;
        e.preventDefault();
        moved.current = true;
        drag.current = { id: e.pointerId, start: { x: e.clientX, y: e.clientY }, origin: { ...point.current } };
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.focus({ preventScroll: true });
        setDragging(true);
      },
      onPointerMove(e: PointerEvent<HTMLDivElement>) {
        const d = drag.current;
        if (d && d.id === e.pointerId) position(d.origin.x + e.clientX - d.start.x, d.origin.y + e.clientY - d.start.y);
      },
      onPointerUp: stop,
      onPointerCancel: stop,
      onLostPointerCapture: stop,
      onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
        if (e.target !== e.currentTarget) return;
        const step = e.shiftKey ? 30 : 10;
        const offsets: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
        const offset = offsets[e.key];
        if (offset) { e.preventDefault(); moved.current = true; position(point.current.x + offset[0], point.current.y + offset[1]); }
        if (e.key === 'Home') { e.preventDefault(); moved.current = false; center(); }
      },
    },
  };
}
