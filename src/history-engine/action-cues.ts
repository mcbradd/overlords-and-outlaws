import type { Action, GameView } from './types';

/** Public anchors only: a rival's concealed hand card is never an anchor. */
export function showActionCues(view: GameView, action: Action | null) {
  document.querySelectorAll('.h-cue-source,.h-cue-target').forEach(el => el.classList.remove('h-cue-source', 'h-cue-target'));
  document.querySelector('.h-action-arrow')?.remove();
  if (!action) return;
  const find = (id?: string) => id ? document.querySelector<HTMLElement>(`[data-card-id="${id}"], [data-select="${id}"], [data-fragment="${id}"], [data-inspect="${id}"].h-event`) : null;
  const source = find(action.card) ?? document.querySelector<HTMLElement>(`[data-seat-anchor="${action.seat}"]`);
  const target = find(action.target ?? action.event) ?? (action.type === 'counterclaim' ? find(view.claim?.target) : null);
  source?.classList.add('h-cue-source');
  target?.classList.add('h-cue-target');
  if (!source || !target || source === target) return;
  const a = source.getBoundingClientRect(), b = target.getBoundingClientRect();
  const x1 = a.x + a.width / 2, y1 = a.y + a.height / 2;
  const x2 = b.x + b.width / 2, y2 = b.y + b.height / 2;
  if ([x1, x2].some(x => x < 0 || x > innerWidth) || [y1, y2].some(y => y < 0 || y > innerHeight)) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'h-action-arrow');
  svg.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `<defs><marker id="h-arrow-head" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#f0ba68"/></marker></defs><path d="M${x1},${y1} Q${(x1+x2)/2+55},${Math.min(y1,y2)-45} ${x2},${y2}" fill="none" stroke="#f0ba68" stroke-width="4" marker-end="url(#h-arrow-head)"/>`;
  document.body.append(svg);
}

/** Reading time scales with the announcement; hover/focus pauses the actual clock. */
export function startReadingClock(panel: HTMLElement, seconds: number, done: () => void) {
  let remaining = seconds * 1000;
  let last = performance.now();
  let hovering = false;
  let frame = 0;
  const enter = () => { hovering = true; };
  const leave = () => { hovering = false; last = performance.now(); };
  panel.addEventListener('pointerenter', enter);
  panel.addEventListener('pointerleave', leave);
  const tick = (now: number) => {
    if (!panel.isConnected) return;
    const paused = hovering || panel.contains(document.activeElement) || document.hidden;
    if (!paused) remaining -= now - last;
    last = now;
    panel.dataset.readingPaused = String(paused);
    const bar = panel.querySelector<HTMLElement>('.h-countdown-fill');
    if (bar) bar.style.transform = `scaleX(${Math.max(0, remaining / (seconds * 1000))})`;
    const label = panel.querySelector<HTMLElement>('.h-countdown-label');
    if (label) label.textContent = paused ? 'Paused while you read' : `Continues in ${Math.ceil(remaining / 1000)}s · hover to pause`;
    if (remaining <= 0) { done(); return; }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => { cancelAnimationFrame(frame); panel.removeEventListener('pointerenter', enter); panel.removeEventListener('pointerleave', leave); };
}
