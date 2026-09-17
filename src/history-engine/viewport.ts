// The browser's visible area owns the table height, including mobile keyboard changes.
let scheduled = false;
let handPage = 0;
let lastHand = '';
let historyPage = 0;
let observedHand: Element | null = null;
const resizeObserver = new ResizeObserver(schedule);

function schedule() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    fitHand();
    fitHistory();
  });
}

function fitHistory() {
  const rail = document.querySelector<HTMLElement>('.h-history-rail');
  if (!rail) return;
  const events = [...rail.querySelectorAll<HTMLElement>('.h-event')];
  const perPage = innerWidth < 900 ? 1 : 3;
  const pages = Math.ceil(events.length / perPage);
  historyPage = Math.min(historyPage, Math.max(0, pages - 1));
  events.forEach((event, i) => event.hidden = i < historyPage * perPage || i >= (historyPage + 1) * perPage);
  let nav = rail.querySelector<HTMLElement>('.h-history-pagination');
  if (pages > 1) {
    if (!nav) {
      nav = document.createElement('nav');
      nav.className = 'h-history-pagination';
      nav.setAttribute('aria-label', 'History cards');
      rail.append(nav);
    }
    const label = `${historyPage * perPage + 1}–${Math.min((historyPage + 1) * perPage, events.length)} / ${events.length}`;
    if (nav.dataset.label !== label) {
      nav.dataset.label = label;
      nav.innerHTML = `<button type="button" aria-label="Previous History cards" ${historyPage === 0 ? 'disabled' : ''}>‹</button><span>${label}</span><button type="button" aria-label="Next History cards" ${historyPage === pages - 1 ? 'disabled' : ''}>›</button>`;
      const buttons = nav.querySelectorAll('button');
      buttons[0].onclick = () => { historyPage--; fitHistory(); };
      buttons[1].onclick = () => { historyPage++; fitHistory(); };
    }
  } else nav?.remove();
}

function syncViewport() {
  const viewport = window.visualViewport;
  document.documentElement.style.setProperty('--viewport-height', `${viewport?.height ?? innerHeight}px`);
  schedule();
}

function fitHand() {
  const hand = document.querySelector<HTMLElement>('.h-hand');
  const row = hand?.querySelector<HTMLElement>('.h-card-row');
  if (!hand || !row) return;
  if (observedHand !== hand) {
    resizeObserver.disconnect();
    resizeObserver.observe(hand);
    observedHand = hand;
  }
  const perPage = row.clientWidth < 450 ? 3 : row.clientWidth < 900 ? 5 : 8;
  const cards = [...row.querySelectorAll<HTMLElement>('.h-hand-card')];
  const signature = cards.map(card => card.querySelector<HTMLElement>('[data-select]')?.dataset.select).join('|');
  if (signature !== lastHand) {
    // Newly arrived cards stay discoverable; page count always accounts for every held card.
    handPage = Math.min(handPage, Math.max(0, Math.ceil(cards.length / perPage) - 1));
    const guided = cards.findIndex(card => !!card.querySelector('.h-teaching-target'));
    if (guided >= 0) handPage = Math.floor(guided / perPage);
    lastHand = signature;
  }
  const pages = Math.ceil(cards.length / perPage);
  const start = handPage * perPage;
  cards.forEach((card, index) => card.hidden = index < start || index >= start + perPage);
  const visible = cards.filter(card => !card.hidden);
  const space = row.getBoundingClientRect();
  const inspectHeight = visible[0]?.querySelector('.h-inspect-small')?.getBoundingClientRect().height ?? 28;
  const heightWidth = Math.max(42, (space.height - inspectHeight - 12) * 63 / 88);
  const cardWidth = Math.min(heightWidth, 270, (space.width - 32) / Math.max(1, visible.length) * 1.35);
  const spread = cardWidth * visible.length;
  const overlap = visible.length > 1 ? Math.min(-cardWidth * .20, (space.width - 32 - spread) / (visible.length - 1)) : 0;
  const gap = 0;
  visible.forEach((card, index) => {
    const offset = index - (visible.length - 1) / 2;
    card.style.setProperty('--fan-angle', `${offset * 4}deg`);
    card.style.setProperty('--fan-rise', `${Math.abs(offset) * 5}px`);
    card.style.setProperty('--fan-layer', `${index + 1}`);
  });
  row.style.setProperty('--hand-card-width', `${cardWidth}px`);
  row.style.setProperty('--hand-overlap', `${overlap}px`);
  row.style.setProperty('--hand-gap', `${gap}px`);
  let pagination = row.querySelector<HTMLElement>('.h-hand-pagination');
  if (pages > 1) {
    if (!pagination) {
      pagination = document.createElement('nav');
      pagination.className = 'h-hand-pagination';
      pagination.setAttribute('aria-label', 'Cards in your hand');
      row.append(pagination);
    }
    const label = `${start + 1}–${Math.min(start + perPage, cards.length)} of ${cards.length}`;
    if (pagination.dataset.label !== label) {
      pagination.dataset.label = label;
      pagination.innerHTML = `<button type="button" aria-label="Previous hand cards" ${handPage === 0 ? 'disabled' : ''}>‹</button><span>${label}</span><button type="button" aria-label="Next hand cards" ${handPage === pages - 1 ? 'disabled' : ''}>›</button>`;
      const buttons = pagination.querySelectorAll('button');
      buttons[0].onclick = () => { handPage--; fitHand(); };
      buttons[1].onclick = () => { handPage++; fitHand(); };
    }
  } else pagination?.remove();
}

document.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  const target = event.target as HTMLElement;
  if (!target.matches('.h-hand [data-select]')) return;
  const choices = [...document.querySelectorAll<HTMLButtonElement>('.h-hand [data-select]')];
  const index = choices.indexOf(target as HTMLButtonElement);
  const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + choices.length) % choices.length;
  const perPage = document.querySelector<HTMLElement>('.h-hand .h-card-row')!.clientWidth < 450 ? 3 : document.querySelector<HTMLElement>('.h-hand .h-card-row')!.clientWidth < 900 ? 5 : 8;
  handPage = Math.floor(next / perPage);
  fitHand();
  choices[next].focus({ preventScroll: true });
  event.preventDefault();
});
new MutationObserver(schedule).observe(document.querySelector('#app')!, { childList: true, subtree: true });
window.addEventListener('resize', syncViewport);
window.visualViewport?.addEventListener('resize', syncViewport);
syncViewport();
export {};
