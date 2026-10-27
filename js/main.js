// Como en Casa · B&B — interacción de la demo (vanilla, sin dependencias) + kit-demos (estadías).
import { initKit } from '../kit/kit.js?v=4';
import { popup } from '../kit/core/ui.js';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const html = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finoMQ = matchMedia('(hover: hover) and (pointer: fine)');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
html.classList.add('listo');

/* ---------------- intro ---------------- */
const intro = $('#intro');
const barra = $('#barra');
const hero = $('.hero');
async function inlineCartel() {
  // el cartel va inline para poder tallar las letras (máscara) y hacer aparecer el ॐ
  const img = $('.intro__svg'); if (!img) return;
  try {
    const txt = await (await fetch(img.src)).text();
    const box = document.createElement('div'); box.innerHTML = txt.trim();
    const svg = box.querySelector('svg'); if (!svg) return;
    svg.classList.add('intro__svg'); svg.setAttribute('aria-hidden', 'true');
    const defs = svg.querySelector('defs');
    defs.insertAdjacentHTML('beforeend', '<mask id="tallar-m" maskUnits="userSpaceOnUse" x="0" y="0" width="800" height="270"><rect class="tallar" x="0" y="0" width="800" height="270" fill="#fff"/></mask>');
    svg.querySelector('.letras').setAttribute('mask', 'url(#tallar-m)');
    img.replaceWith(svg);
  } catch (_) { /* sin cartel inline: se ve la imagen */ }
}
function entrarHero() {
  barra.classList.add('entra');
  hero.classList.add('entra');
  $$('.hero [data-in]').forEach((el, i) => { el.style.setProperty('--d', i + 3); el.classList.add('visto'); });
  $$('.hero .linea > span').forEach((el, i) => el.style.setProperty('--d', i));
  setTimeout(() => contar($$('.hero [data-cuenta]')), 700);
}
async function correrIntro() {
  if (!html.classList.contains('con-intro')) { entrarHero(); return; }
  const celu = innerWidth < 768;
  await inlineCartel();
  const heroImg = $('.hero__marco img:not([loading])') || $('.hero__marco img');
  const listos = Promise.all([document.fonts?.ready, heroImg?.decode?.().catch(() => {})]);
  const espera = (ms) => new Promise(r => setTimeout(r, ms));
  await Promise.all([espera(celu ? 1350 : 2000), Promise.race([listos, espera(celu ? 1500 : 2300)])]);
  // el cartel sube y se achica hasta el lugar del logo
  const cartel = $('#intro-cartel'); const logo = $('.barra__logo img');
  const a = cartel.getBoundingClientRect(); const b = logo.getBoundingClientRect();
  const alto = barra.getBoundingClientRect().height;
  const k = b.width / a.width;
  cartel.style.animation = 'none';
  intro.classList.add('intro-sube');
  requestAnimationFrame(() => {
    cartel.style.transform = `translate(${b.left - a.left - (a.width - a.width * k) / 2}px, ${b.top + alto * 1.1 - a.top - (a.height - a.height * k) / 2}px) scale(${k})`;
    cartel.style.opacity = '0';
  });
  await espera(celu ? 250 : 330);
  html.classList.add('intro-fin');
  entrarHero();
  await espera(650);
  html.classList.remove('con-intro');
  intro.remove();
}
correrIntro();

/* ---------------- barra y menú ---------------- */
const menuBtn = $('.barra__menu'); const menu = $('#menu');
function cerrarMenu() { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); html.classList.remove('menu-abierto'); menuBtn.setAttribute('aria-label', 'Abrir menú'); }
menuBtn.addEventListener('click', () => {
  const abrir = menu.hidden;
  if (!abrir) return cerrarMenu();
  menu.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.setAttribute('aria-label', 'Cerrar menú'); html.classList.add('menu-abierto');
  $$('a', menu).forEach((a, i) => a.style.setProperty('--i', i));
});
menu.addEventListener('click', (e) => { if (e.target.closest('a')) cerrarMenu(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) cerrarMenu(); });
const waFlota = $('.wa-flota');
let ticking = false;
addEventListener('scroll', () => {
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => {
    const y = scrollY;
    barra.classList.toggle('con-sombra', y > 10);
    waFlota.classList.toggle('on', y > innerHeight * .7);
    html.classList.toggle('paso-hero', y > innerHeight * .6);
    ticking = false;
  });
}, { passive: true });
// link activo
const navLinks = $$('.barra__nav a');
const secObs = new IntersectionObserver((ents) => ents.forEach(en => {
  if (!en.isIntersecting) return;
  navLinks.forEach(a => a.classList.toggle('activo', a.getAttribute('href') === '#' + en.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
['casa', 'habitaciones', 'desayuno', 'villa', 'visitas'].forEach(id => { const s = document.getElementById(id); if (s) secObs.observe(s); });

// en el celu, mientras se completa la reserva no hay botones flotantes encima
new IntersectionObserver((ents) => ents.forEach(en => html.classList.toggle('en-reservar', en.isIntersecting)), { rootMargin: '-10% 0px -10% 0px' }).observe($('#reservar'));

/* ---------------- entradas al hacer scroll ---------------- */
const io = new IntersectionObserver((ents) => ents.forEach(en => {
  if (!en.isIntersecting) return;
  en.target.classList.add('visto'); io.unobserve(en.target);
  if (en.target.matches('.puntajes, .libro__pie')) contar($$('[data-cuenta]', en.target));
}), { threshold: .18, rootMargin: '0px 0px -6% 0px' });
$$('[data-in]').forEach(el => {
  if (el.closest('.hero')) return;
  const hermanos = $$(':scope > [data-in]', el.parentElement);
  el.style.setProperty('--d', Math.min(hermanos.indexOf(el), 6));
  io.observe(el);
});
$$('.polas, .libro, .libro__pie').forEach(el => io.observe(el));
$$('.pola').forEach((p, i) => p.style.setProperty('--i', i));
$$('.punto').forEach((p, i) => p.style.setProperty('--i', i));

function contar(els) {
  els.forEach(el => {
    if (el.dataset.contado) return; el.dataset.contado = '1';
    const fin = Number(el.dataset.cuenta), dec = Number(el.dataset.dec || 0);
    const fmt = (v) => v.toFixed(dec).replace('.', ',');
    if (reduce) { el.textContent = fmt(fin); return; }
    const t0 = performance.now(), dur = 1100;
    const paso = (t) => { const p = Math.min(1, (t - t0) / dur); el.textContent = fmt(fin * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(paso); };
    requestAnimationFrame(paso);
  });
}

/* ---------------- WOW: verano / invierno ---------------- */
const tempBtns = $$('[data-temp]');
function ponerTemporada(t, guardar = true) {
  html.dataset.temporada = t;
  tempBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.temp === t)));
  if (guardar) { const u = new URL(location.href); u.searchParams.set('temporada', t); history.replaceState(null, '', u); }
  nieve.toggle(t === 'invierno');
}
tempBtns.forEach(b => b.addEventListener('click', () => ponerTemporada(b.dataset.temp)));

const nieve = (() => {
  const cv = $('#nieve'); const ctx = cv.getContext('2d');
  let copos = [], on = false, raf = 0, w = 0, h = 0, dpr = 1;
  const medir = () => { dpr = Math.min(2, devicePixelRatio || 1); w = innerWidth; h = innerHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  const crear = () => { const n = innerWidth < 768 ? 32 : 70; copos = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, r: .8 + Math.random() * 2.4, v: .3 + Math.random() * .8, f: Math.random() * 6 })); };
  function cuadro(t) {
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = 'rgba(255,255,255,.85)';
    for (const c of copos) {
      c.y += c.v; c.x += Math.sin(t / 1400 + c.f) * .35;
      if (c.y > h + 4) { c.y = -4; c.x = Math.random() * w; }
      ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, 6.283); ctx.fill();
    }
    raf = on && !document.hidden ? requestAnimationFrame(cuadro) : 0;
  }
  addEventListener('resize', () => { if (on) { medir(); } }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (on && !document.hidden && !raf) raf = requestAnimationFrame(cuadro); });
  return { toggle(v) { if (reduce) return; on = v; if (on) { medir(); crear(); if (!raf) raf = requestAnimationFrame(cuadro); } else { cancelAnimationFrame(raf); raf = 0; ctx.clearRect(0, 0, w, h); } } };
})();
ponerTemporada(html.dataset.temporada, false);

/* ---------------- arrastre con el mouse (carruseles y tira) ---------------- */
function arrastrable(pista, { snap = null, onEnd = null } = {}) {
  let x0 = 0, s0 = 0, abajo = false, movio = false, vel = 0, ultX = 0, ultT = 0, raf = 0;
  pista.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    cancelAnimationFrame(raf); abajo = true; movio = false; x0 = ultX = e.clientX; ultT = performance.now(); s0 = pista.scrollLeft; vel = 0;
    pista.setPointerCapture(e.pointerId);
  });
  pista.addEventListener('pointermove', (e) => {
    if (!abajo) return;
    const dx = e.clientX - x0;
    if (!movio && Math.abs(dx) > 4) { movio = true; pista.classList.add('arrastrando'); }
    if (!movio) return;
    const now = performance.now(); vel = .8 * vel + .2 * ((e.clientX - ultX) / Math.max(1, now - ultT)); ultX = e.clientX; ultT = now;
    pista.scrollLeft = s0 - dx;
  });
  const soltar = (e) => {
    if (!abajo) return; abajo = false;
    try { pista.releasePointerCapture(e.pointerId); } catch (_) { /* nada */ }
    if (!movio) { pista.classList.remove('arrastrando'); return; }
    // inercia y después acomoda en la foto más cercana
    let v = -vel * 16;
    const inercia = () => {
      v *= .92; pista.scrollLeft += v;
      if (Math.abs(v) > .6) raf = requestAnimationFrame(inercia);
      else {
        if (snap) { const destino = snap(pista); pista.scrollTo({ left: destino, behavior: 'smooth' }); setTimeout(() => pista.classList.remove('arrastrando'), 420); }
        else pista.classList.remove('arrastrando');
        onEnd && onEnd();
      }
    };
    raf = requestAnimationFrame(inercia);
  };
  pista.addEventListener('pointerup', soltar); pista.addEventListener('pointercancel', soltar);
  pista.addEventListener('click', (e) => { if (movio) { e.preventDefault(); e.stopPropagation(); } }, true);
  pista.addEventListener('dragstart', (e) => e.preventDefault());
}
$$('[data-carru]').forEach(c => {
  const pista = $('.carru__pista', c); const fotos = $$('img', pista); const dots = $('.carru__dots', c);
  dots.innerHTML = fotos.map(() => '<i></i>').join('');
  const prev = $('[data-prev]', c), next = $('[data-next]', c);
  const actual = () => Math.round(pista.scrollLeft / pista.clientWidth);
  const pintar = () => { const i = actual(); $$('i', dots).forEach((d, k) => d.classList.toggle('on', k === i)); prev.disabled = i <= 0; next.disabled = i >= fotos.length - 1; };
  const ir = (i) => pista.scrollTo({ left: Math.max(0, Math.min(fotos.length - 1, i)) * pista.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  prev.addEventListener('click', () => ir(actual() - 1)); next.addEventListener('click', () => ir(actual() + 1));
  c.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); ir(actual() + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); ir(actual() - 1); } });
  pista.addEventListener('scroll', () => requestAnimationFrame(pintar), { passive: true });
  arrastrable(pista, { snap: (p) => Math.round(p.scrollLeft / p.clientWidth) * p.clientWidth });
  pintar();
});
$$('[data-carru-libre]').forEach(t => arrastrable(t, { snap: (p) => { const figs = $$('figure', p); const x = p.scrollLeft; let best = 0, d = Infinity; figs.forEach(f => { const dd = Math.abs(f.offsetLeft - p.offsetLeft - x - parseFloat(getComputedStyle(p).paddingLeft)); if (dd < d) { d = dd; best = f.offsetLeft - p.offsetLeft - parseFloat(getComputedStyle(p).paddingLeft); } }); return best; } }));

/* ---------------- WOW: la mesa del desayuno ---------------- */
const puntos = $$('.punto'); const tips = $$('.tip');
function mostrarTip(i) { puntos.forEach((p, k) => { p.classList.toggle('on', k === i); p.setAttribute('aria-expanded', String(k === i)); }); tips.forEach((t, k) => t.classList.toggle('on', k === i)); }
puntos.forEach((p, i) => {
  p.addEventListener('click', () => mostrarTip(p.classList.contains('on') ? -1 : i));
  p.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') mostrarTip(i); });
  p.addEventListener('focus', () => mostrarTip(i));
});
$('.mesa')?.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') mostrarTip(-1); });
// pista: la primera vez que se ve, muestra un dato solo
new IntersectionObserver((ents, o) => ents.forEach(en => { if (en.isIntersecting) { setTimeout(() => { if (!puntos.some(p => p.classList.contains('on'))) mostrarTip(0); }, 900); o.disconnect(); } }), { threshold: .5 }).observe($('.mesa'));

/* ---------------- La Villa: pines ↔ lista ---------------- */
const pins = $$('.pin'); const lugares = $$('[data-lugar]');
function marcar(i) { pins.forEach(p => p.classList.toggle('on', Number(p.dataset.pin) === i)); lugares.forEach(l => l.classList.toggle('on', Number(l.dataset.lugar) === i)); }
pins.forEach(p => {
  const i = Number(p.dataset.pin);
  p.addEventListener('click', () => { marcar(i); const l = lugares[i]; if (l && innerWidth < 900) l.parentElement.scrollTo({ left: l.offsetLeft - l.parentElement.offsetLeft - 20, behavior: 'smooth' }); });
  p.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') marcar(i); });
});
lugares.forEach(l => { l.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') marcar(Number(l.dataset.lugar)); }); l.addEventListener('click', () => marcar(Number(l.dataset.lugar))); });

/* ---------------- WOW: libro de visitas ---------------- */
const libro = $('[data-libro]');
const cartas = $$('.carta', libro);
cartas.forEach((c, i) => c.style.setProperty('--i', i));
let modo = null, zTop = 10, orden = cartas.slice();
let btnOtra = null;
function modoLibro() {
  const nuevo = innerWidth >= 900 ? 'tablero' : 'mazo';
  if (nuevo === modo) return; modo = nuevo;
  libro.dataset.modo = modo; html.classList.toggle('libro-tablero', modo === 'tablero'); html.classList.toggle('libro-mazo', modo === 'mazo');
  cartas.forEach(c => { c.style.left = ''; c.style.top = ''; c.style.transform = ''; c.style.zIndex = ''; c.classList.remove('vuela'); });
  if (modo === 'mazo') {
    pintarMazo();
    if (!btnOtra) { btnOtra = document.createElement('button'); btnOtra.type = 'button'; btnOtra.className = 'btn btn--linea'; btnOtra.textContent = 'Otra cartita →'; btnOtra.addEventListener('click', () => pasar(1)); }
    $('.libro__pie').prepend(btnOtra);
  } else btnOtra?.remove();
}
function pintarMazo() {
  orden.forEach((c, k) => {
    c.style.zIndex = String(100 - k);
    c.style.setProperty('--rm', k === 0 ? '0deg' : `${(k % 2 ? 1 : -1) * (2 + k)}deg`);
    c.style.setProperty('--ym', `${Math.min(k, 3) * 8}px`);
    c.setAttribute('aria-hidden', String(k !== 0));
  });
}
function pasar(dir) {
  const c = orden[0]; c.classList.add('vuela');
  c.style.transform = `translateX(${dir * 120}%) rotate(${dir * 18}deg)`;
  setTimeout(() => { c.classList.remove('vuela'); c.style.transform = ''; orden.push(orden.shift()); pintarMazo(); }, 380);
}
(() => {
  let act = null, x0 = 0, y0 = 0, l0 = 0, t0 = 0, dx = 0;
  libro.addEventListener('pointerdown', (e) => {
    const c = e.target.closest('.carta'); if (!c) return;
    if (modo === 'mazo' && c !== orden[0]) return;
    act = c; x0 = e.clientX; y0 = e.clientY; dx = 0;
    c.setPointerCapture(e.pointerId);
    if (modo === 'tablero') {
      const r = c.getBoundingClientRect(), b = libro.getBoundingClientRect();
      l0 = r.left - b.left; t0 = r.top - b.top;
      c.style.left = `${l0}px`; c.style.top = `${t0}px`; c.style.zIndex = String(++zTop); c.classList.add('arrastra');
      c.style.transform = 'rotate(0deg) scale(1.03)';
    } else c.style.transition = 'none';
  });
  libro.addEventListener('pointermove', (e) => {
    if (!act) return;
    dx = e.clientX - x0; const dy = e.clientY - y0;
    if (modo === 'tablero') {
      const b = libro.getBoundingClientRect();
      const x = Math.max(-20, Math.min(b.width - act.offsetWidth + 20, l0 + dx)); const y = Math.max(-20, Math.min(b.height - act.offsetHeight + 20, t0 + dy));
      act.style.left = `${x}px`; act.style.top = `${y}px`;
    } else act.style.transform = `translateX(${dx}px) rotate(${dx / 14}deg)`;
  });
  const soltar = () => {
    if (!act) return; const c = act; act = null;
    if (modo === 'tablero') { c.classList.remove('arrastra'); c.style.transform = `rotate(${(Math.random() * 8 - 4).toFixed(1)}deg)`; }
    else { c.style.transition = ''; if (Math.abs(dx) > 70) pasar(dx > 0 ? 1 : -1); else c.style.transform = ''; }
  };
  libro.addEventListener('pointerup', soltar); libro.addEventListener('pointercancel', soltar);
})();
modoLibro();
addEventListener('resize', () => modoLibro(), { passive: true });

/* ---------------- WOW: el gato de la baranda ---------------- */
const gato = $('#gato'); const globo = $('#gato-globo');
const pupilas = $$('.gato__pupila', gato);
const FRASES = ['Miau. Acá se duerme rico.', '¿Me rascás la cabeza?', 'El desayuno es a las 9… o cuando quieras.', 'Prrr… el hogar ya está prendido.', 'Yo cuido la baranda.', 'Reservá, que te espero.'];
let dormirT = 0, hablaT = 0, fraseI = 0;
function despertar() { gato.classList.remove('duerme'); clearTimeout(dormirT); dormirT = setTimeout(() => gato.classList.add('duerme'), 9000); }
function mirar(x, y) {
  const r = gato.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height * .38;
  const a = Math.atan2(y - cy, x - cx); const d = Math.min(1, Math.hypot(x - cx, y - cy) / 300);
  const tx = Math.cos(a) * 2.6 * d, ty = Math.sin(a) * 2 * d;
  pupilas.forEach(p => { p.style.transform = `translate(${tx}px, ${ty}px)`; });
}
function hablar(txt, ms = 2600) { globo.textContent = txt; gato.classList.add('habla'); clearTimeout(hablaT); hablaT = setTimeout(() => gato.classList.remove('habla'), ms); }
let pend = null;
addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; if (!pend) requestAnimationFrame(() => { mirar(pend.x, pend.y); pend = null; }); pend = { x: e.clientX, y: e.clientY }; despertar(); }, { passive: true });
let scrollT = 0;
addEventListener('scroll', () => { despertar(); if (!finoMQ.matches) { pupilas.forEach(p => { p.style.transform = 'translate(0, 2px)'; }); clearTimeout(scrollT); scrollT = setTimeout(() => pupilas.forEach(p => { p.style.transform = ''; }), 400); } }, { passive: true });
gato.addEventListener('click', () => { despertar(); gato.classList.remove('salta'); void gato.offsetWidth; gato.classList.add('salta'); hablar(FRASES[fraseI++ % FRASES.length]); });
despertar();

/* ---------------- kit: estadías con la identidad ---------------- */
document.addEventListener('kit:estadia-lista', (e) => {
  e.preventDefault();
  const { resumen: r, pago, el } = e.detail;
  const nombre = (r.nombre || '').split(' ')[0];
  const wa = `https://wa.me/5491144156483?text=${encodeURIComponent(`Hola Lili y Orlando! Soy ${r.nombre}. Pedí la ${r.habitacion} del ${r.llegada} al ${r.salida} (código ${r.codigo}).`)}`;
  const cont = `<div class="confirmacion">
    <h3>¡Te esperamos${nombre ? `, ${esc(nombre)}` : ''}!</h3>
    <p>${esc(r.habitacion)} · ${esc(r.llegada)} → ${esc(r.salida)} · ${r.noches} ${r.noches === 1 ? 'noche' : 'noches'}${r.hora ? ` · llegás tipo ${esc(r.hora)}` : ''}.</p>
    <p>${pago === 'mercadopago' ? `Recibimos tu seña de ${esc(r.sena)}. Ya la vemos en nuestro panel.` : 'Te escribimos por WhatsApp para confirmarte.'} Código <b>${esc(r.codigo)}</b>.</p>
    <a class="btn btn--rojo" href="${wa}" target="_blank" rel="noopener">Escribinos por WhatsApp</a>
    <p class="firma mano">Lili y Orlando</p></div>`;
  if (el) el.innerHTML = cont; else popup({ titulo: '¡Listo!', contenido: cont, clase: 'kit-pop--sm' });
  despertar(); gato.classList.add('salta'); hablar('¡Miau! Te esperamos.', 4200);
});
initKit({ config: 'cliente.json', imagenes: { lqip: 'img/lqip.json' }, badgeTexto: 'Probá el panel de Lili y Orlando' })
  .catch(err => { console.error(err); const c = $('[data-kit="estadias"]'); if (c) c.innerHTML = '<p class="cargando">No pudimos cargar el calendario. Escribinos por WhatsApp.</p>'; });
