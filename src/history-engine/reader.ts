import { escapeHTML as esc } from './face';

/** A fixed reading surface. Content is laid out into complete pages, never
 * scrolled or shortened to fit. Form elements are moved, not cloned, so their
 * values and event handlers survive pagination and viewport changes. */
export function createReader(html: string): HTMLDialogElement {
  const source = document.createElement('div');
  source.innerHTML = html;
  const title = source.querySelector('h2');
  const titleText = title?.textContent ?? 'At the table';
  title?.remove();
  source.querySelector(':scope > .h-eyebrow')?.remove();
  const art = source.querySelector<HTMLElement>('.h-inspection > .h-card-face');
  art?.remove();
  const dialog = document.createElement('dialog');
  dialog.className = `h-dialog${art ? ' h-reader-has-art' : ''}`;
  dialog.setAttribute('aria-label', titleText);
  dialog.innerHTML = `<header class="h-reader-header"><h2>${esc(titleText)}</h2><button type="button" data-ui="close" class="h-close">Close ×</button></header><div class="h-reader-body">${art ? '<aside class="h-reader-art" aria-label="Printed card"></aside>' : ''}<div class="h-reader-pages"></div></div><nav class="h-reader-nav" aria-label="Reading pages"><button type="button" data-reader="previous">Previous</button><label class="h-reader-position"><span class="sr-only">Reading page</span><select aria-label="Reading page"></select></label><button type="button" data-reader="next">Next</button></nav>`;
  if (art) dialog.querySelector('.h-reader-art')!.append(art);
  const host = dialog.querySelector<HTMLElement>('.h-reader-pages')!;
  host.setAttribute('role', 'region');
  host.setAttribute('aria-label', 'Current reading page');
  host.setAttribute('aria-live', 'polite');
  const previous = dialog.querySelector<HTMLButtonElement>('[data-reader="previous"]')!;
  const next = dialog.querySelector<HTMLButtonElement>('[data-reader="next"]')!;
  const position = dialog.querySelector<HTMLSelectElement>('.h-reader-position select')!;
  const atoms: HTMLElement[] = [];
  function flatten(parent: Element) {
    for (const node of [...parent.children]) {
      if (!(node instanceof HTMLElement)) continue;
      if (node.matches('details')) {
        const summary = node.querySelector(':scope > summary');
        if (summary) { const heading = document.createElement('h3'); heading.textContent = summary.textContent; atoms.push(heading); summary.remove(); }
        flatten(node);
      } else if (node.matches('dl')) {
        for (const term of [...node.querySelectorAll('dt')]) {
          const heading = document.createElement('h3'); heading.textContent = term.textContent; atoms.push(heading);
          const definition = document.createElement('p'); definition.textContent = term.nextElementSibling?.textContent ?? ''; atoms.push(definition);
        }
      } else if (node.matches('ol, ul')) {
        [...node.children].forEach((item, i) => { const paragraph = document.createElement('p'); paragraph.innerHTML = `${node.tagName === 'OL' ? `${i + 1}.` : '•'} ${item.innerHTML}`; atoms.push(paragraph); });
      } else if (node.matches('fieldset')) {
        const legend = node.querySelector('legend');
        if (legend) { const heading = document.createElement('h3'); heading.textContent = legend.textContent; atoms.push(heading); legend.remove(); }
        flatten(node);
      } else if (node.matches('div, section') && !node.matches('.h-card-face')) flatten(node);
      else atoms.push(node);
    }
  }
  flatten(source);
  // Every textual source atom remains available to the regression audit.
  dialog.dataset.readerSource = atoms.map(node => node.textContent).join(' ').replace(/\s+/g, ' ').trim();
  let current = 0;
  let pages: HTMLElement[] = [];
  let scheduled = false;
  let lastSize = '';
  let disconnected = false;
  function show(index: number) {
    current = Math.max(0, Math.min(index, pages.length - 1));
    pages.forEach((page, i) => page.hidden = i !== current);
    position.value = String(current);
    previous.disabled = current === 0;
    next.disabled = current >= pages.length - 1;
  }
  function paginate() {
    if (!dialog.isConnected || !dialog.open) return;
    const rect = host.getBoundingClientRect();
    const size = `${rect.width.toFixed(1)}:${rect.height.toFixed(1)}`;
    if (rect.height < 1 || rect.width < 1 || size === lastSize) return;
    lastSize = size;
    const active = document.activeElement;
    const anchor = pages[current]?.firstElementChild?.getAttribute('data-reader-atom');
    host.replaceChildren(); pages = [];
    let page: HTMLElement;
    let section = '';
    function newPage() {
      page = document.createElement('section'); page.className = 'h-reader-page'; page.dataset.section = section;
      host.append(page); pages.push(page);
    }
    newPage();
    function fits() {
      // scrollHeight rounds subpixels and includes the page's own fixed height.
      // Measure the actual blocks and reserve ink clearance for font descenders.
      return [...page.children].every(child => child.getBoundingClientRect().bottom <= rect.bottom - 4);
    }
    atoms.forEach((atom, index) => {
      atom.dataset.readerAtom = String(index);
      if (atom.matches('h2,h3')) section = atom.textContent ?? '';
      page.append(atom);
      if (fits()) { if (!page.dataset.section) page.dataset.section = section; return; }
      atom.remove();
      // Keep a section heading beside its opening paragraph where possible.
      const orphan = page.lastElementChild?.matches('h2,h3') ? page.lastElementChild : null;
      orphan?.remove();
      if (page.childElementCount) { page.hidden = true; newPage(); }
      if (orphan) page.append(orphan);
      page.append(atom);
      if (fits()) return;
      // Long prose breaks at word boundaries. Interactive elements stay intact.
      if (atom.matches('p') && !atom.querySelector('button,input,select,a')) {
        const words = (atom.textContent ?? '').trim().split(/\s+/);
        atom.remove();
        let fragment = atom.cloneNode(false) as HTMLElement;
        page.append(fragment);
        for (const word of words) {
          const before = fragment.textContent ?? '';
          fragment.textContent = `${before}${before ? ' ' : ''}${word}`;
          if (!fits() && before) {
            fragment.textContent = before;
            page.hidden = true; newPage();
            fragment = atom.cloneNode(false) as HTMLElement;
            fragment.textContent = word; page.append(fragment);
          }
        }
      }
    });
    position.innerHTML = pages.map((page, i) => `<option value="${i}">${i + 1} / ${pages.length}${page.dataset.section ? ` · ${esc(page.dataset.section)}` : ''}</option>`).join('');
    const focusedPage = active instanceof HTMLElement ? pages.findIndex(page => page.contains(active)) : -1;
    const anchoredPage = anchor ? pages.findIndex(page => page.querySelector(`[data-reader-atom="${anchor}"]`)) : -1;
    show(focusedPage >= 0 ? focusedPage : anchoredPage >= 0 ? anchoredPage : current);
    if (active instanceof HTMLElement && dialog.contains(active)) active.focus({ preventScroll: true });
  }
  function schedule() { if (scheduled || disconnected) return; scheduled = true; requestAnimationFrame(() => { scheduled = false; paginate(); }); }
  previous.onclick = () => show(current - 1);
  next.onclick = () => show(current + 1);
  position.onchange = () => show(Number(position.value));
  dialog.addEventListener('keydown', event => {
    if ((event.target as HTMLElement).matches('input,select,textarea')) return;
    if (event.key === 'ArrowRight') { show(current + 1); event.preventDefault(); }
    if (event.key === 'ArrowLeft') { show(current - 1); event.preventDefault(); }
  });
  // Attach all original nodes before binding the existing action handlers.
  atoms.forEach(atom => host.append(atom));
  const observer = new ResizeObserver(schedule);
  observer.observe(host);
  const fontsChanged = () => { lastSize = ''; schedule(); };
  document.fonts.addEventListener('loadingdone', fontsChanged);
  void document.fonts.ready.then(fontsChanged);
  const notices = new MutationObserver(() => { lastSize = ''; schedule(); });
  atoms.filter(atom => atom.matches('[role="alert"]')).forEach(atom => notices.observe(atom, { childList: true, characterData: true, subtree: true }));
  const cleanup = () => { disconnected = true; observer.disconnect(); notices.disconnect(); document.fonts.removeEventListener('loadingdone', fontsChanged); };
  dialog.addEventListener('close', cleanup);
  dialog.addEventListener('reader-dispose', cleanup);
  schedule();
  return dialog;
}
