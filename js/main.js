import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { SYMBOL_SVG, WORDMARK_SVG } from './logo-paths.js?v=20260922s07';
import { ringHullTextures, dotHullTextures, haloTexture } from './hull-texture.js?v=20260922s07';
import { Drums } from './drum.js?v=20260922s07';
import { buildGallery, updateGalleries } from './galleries.js?v=20260922s07';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789✺';
const C = window.OPOINT || { slots: {}, works: { youtube: [], image: [] } };
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(pointer: fine)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ════════════════════ 1. 콘텐츠 렌더 ════════════════════ */

$$('[data-logo="symbol"]').forEach((el) => (el.innerHTML = SYMBOL_SVG));
$$('[data-logo="wordmark"]').forEach((el) => (el.innerHTML = WORDMARK_SVG));

// 빈 이미지·영상 자리 = 원통 갤러리(렌더러가 준비되면 붙는다)
const drumQueue = [];
let drums = null;
function mountDrum(stage, items, ratio) {
  if (drums) drums.mount(stage, items, ratio);
  else drumQueue.push([stage, items, ratio]);
}
function fillSlot(fig, cfg = {}) {
  buildGallery(fig, cfg, { mountDrum });
}
$$('[data-slot]').forEach((fig) => fillSlot(fig, C.slots[fig.dataset.slot]));

// 08
if (C.assets08) {
  $('#gallery08').innerHTML = C.assets08.gallery.map((s) => `<img src="${esc(s)}" alt="" loading="lazy">`).join('');
  const ps = C.assets08.personas || [];
  if (ps.length) {
    $('#personas08').innerHTML = `<div class="ps-head mono"><span>AI MODEL × ${String(ps.length).padStart(2, '0')}</span><span class="dim">LIFESTYLE CUTS</span></div>
      <div class="ps-rows">${ps.map((p, i) => `<div class="ps-row" style="--dir:${i % 2 ? -1 : 1}">
        <p class="ps-name mono"><b>${String(i + 1).padStart(2, '0')}</b>${esc(p.name)}</p>
        <div class="ps-view"><div class="ps-track">${p.images.concat(p.images).map((s) => `<img src="${esc(s)}" alt="" loading="lazy">`).join('')}</div></div>
      </div>`).join('')}</div>`;
  }
}
// 09
if (C.feeds09) {
  $('#feeds09').innerHTML = C.feeds09.map((s, i) => `<figure style="--i:${i}"><img src="${esc(s)}" alt="페르소나 인스타그램 피드" loading="lazy">${C.feedNames09 && C.feedNames09[i] ? `<figcaption class="mono dim">${String(i + 1).padStart(2, '0')} — ${esc(C.feedNames09[i])}</figcaption>` : ''}</figure>`).join('');
}

// 07 브랜드 필름 · 14 트레일러 — 전체 재생(소리 포함)
const filmBox = $('#filmBox');
const filmVideo = $('#filmVideo');
const fmt = (d) => `${String((d / 60) | 0).padStart(2, '0')}:${String(Math.round(d) % 60).padStart(2, '0')}`;
$$('[data-film]').forEach((btn) => {
  const f = C[btn.dataset.film];
  if (!f || !filmBox) { btn.hidden = true; return; }
  btn.addEventListener('click', () => {
    $('#filmTitle').textContent = f.title || '';
    if (filmVideo.dataset.src !== f.src) { filmVideo.src = f.src; filmVideo.poster = f.poster || ''; filmVideo.dataset.src = f.src; }
    filmBox.showModal ? filmBox.showModal() : filmBox.setAttribute('open', '');
    lenisRef()?.stop();
    filmVideo.play().catch(() => {});
  });
  const probe = document.createElement('video');
  probe.preload = 'metadata';
  probe.src = f.src;
  probe.addEventListener('loadedmetadata', () => { const l = $('[data-len]', btn); if (l) l.textContent = fmt(probe.duration); });
});
if (filmBox) {
  filmBox.addEventListener('close', () => { filmVideo.pause(); lenisRef()?.start(); });
  $('#filmClose').addEventListener('click', () => filmBox.close());
  filmBox.addEventListener('click', (e) => { if (e.target === filmBox) filmBox.close(); });
}
function lenisRef() { return window.__opointScroll; }

// 연락처
if (C.contact && (C.contact.email || C.contact.phone)) {
  const c = C.contact;
  $('#contactInfo').classList.remove('dim');
  $('#contactInfo').innerHTML = [c.email && `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`, esc(c.phone), esc(c.address)].filter(Boolean).join('&nbsp;&nbsp;·&nbsp;&nbsp;');
}

// 17·18 포트폴리오 — Trionn 식 작업 그리드 + 상세 창
const ytId = (u = '') => (u.match(/(?:youtu\.be\/|v=|shorts\/)([\w-]{11})/) || [])[1] || '';
function uniqLinks(list = []) {
  const seen = new Set();
  return list.filter((u) => { const k = ytId(u) || u.split('?')[0]; if (seen.has(k)) return false; seen.add(k); return true; });
}
const linkLabel = (u) => (/playlist/.test(u) ? 'PLAYLIST' : /instagram/.test(u) ? 'INSTAGRAM' : /shorts/.test(u) ? 'SHORTS' : 'YOUTUBE');
const pad2 = (n, k = 2) => String(n).padStart(k, '0');
const WORKS = (C.works && C.works) || { youtube: [], image: [] };
const YTW = WORKS.youtube || [];
const VIDW = (WORKS.image || []).filter((w) => w.kind === 'video');
const IMGW = (WORKS.image || []).filter((w) => w.kind === 'image');

// 17 상단: 숫자로 보는 포트폴리오(자료에서 센 값) · 클라이언트 흐름
const cutCount = IMGW.reduce((n, w) => n + (w.clips || []).length, 0);
// const stats = [[YTW.length, 'YOUTUBE SERIES · CHANNEL'], [VIDW.length, 'VIDEO CAMPAIGNS'], [IMGW.length, 'IMAGE BRANDS'], [cutCount, 'KEY VISUAL CUTS']];
// 0917 v4: 숫자 요약 삭제(상은님 요청)
const clients = [...new Set([...YTW, ...VIDW, ...IMGW].map((w) => (w.client || '').replace(/\(.*?\)/g, '').trim()).filter(Boolean)
  .map((c) => c.replace(/^ibk/i, 'IBK')))];
$('#clients17').innerHTML = `<div class="cl-track">${clients.concat(clients).map((c) => `<span>${esc(c)}</span>`).join('<i>✺</i>')}</div>`;

function cardHTML(w, i, group, ratio) {
  const imgs = (w.clips || []).slice(0, 4);
  const meta = [w.format, w.year && `C. ${w.year}`, w.kind === 'image' && `${pad2((w.clips || []).length)} CUTS`].filter(Boolean);
  return `<article class="work" data-group="${group}" data-i="${i}" tabindex="0" role="button" aria-label="${esc(w.client)} ${esc(w.name)} 자세히 보기">
    <div class="work-media" style="aspect-ratio:${ratio}">${imgs.map((c, k) => `<img src="${esc(c.src)}" alt="" loading="lazy" class="${k ? '' : 'on'}">`).join('')}
      <span class="work-no mono">(${pad2(i + 1)})</span><span class="work-open mono">VIEW +</span></div>
    <div class="work-cap">
      ${w.client && w.client !== w.name ? `<p class="mono dim">${esc(w.client)}</p>` : ''}
      <h3>${esc(w.name)}</h3>
      <p class="work-tags">${(w.tags || []).map((t) => `<i>${esc(t)}</i>`).join('')}</p>
      ${meta.length ? `<p class="mono dim work-meta">${meta.map(esc).join('&nbsp;&nbsp;·&nbsp;&nbsp;')}</p>` : ''}
    </div>
  </article>`;
}
function groupHTML(label, list, group, ratio, cols) {
  return `<div class="work-group" data-kind="${group}">
    <div class="group-head mono"><span>${label}</span><span class="dim">${pad2(list.length)}</span></div>
    <div class="works" style="--cols:${cols}">${list.map((w, i) => cardHTML(w, i, group, ratio)).join('')}</div>
  </div>`;
}
$('#works17').outerHTML = `<div class="works-wrap" id="works17">${groupHTML('YOUTUBE ORIGINAL SERIES · CHANNEL', YTW, 'yt', '16 / 9', 3)}</div>`;
$('#works18').innerHTML = groupHTML('VIDEO', VIDW, 'video', '16 / 9', 2) + groupHTML('IMAGE', IMGW, 'image', '4 / 5', 3);
const LISTS = { yt: YTW, video: VIDW, image: IMGW };

// 카드 위에 머물면 대표 컷이 차례로 바뀐다
$$('.work').forEach((card) => {
  const ims = $$('.work-media img', card);
  if (ims.length < 2 || REDUCE) return;
  let k = 0, t = null;
  const step = () => { ims[k].classList.remove('on'); k = (k + 1) % ims.length; ims[k].classList.add('on'); };
  card.addEventListener('pointerenter', () => { step(); t = setInterval(step, 900); });
  card.addEventListener('pointerleave', () => { clearInterval(t); });
});

// 상세 창
const workBox = $('#workBox');
function openWork(group, i) {
  const w = LISTS[group][i];
  if (!w) return;
  const links = uniqLinks(w.links);
  const [l1 = '', l2 = ''] = w.lines || [];
  $('#workMeta').textContent = [group === 'yt' ? '17 / 18' : '18 / 18', w.client, w.format].filter(Boolean).join('  ·  ');
  $('#workTitle').textContent = w.name;
  $('#workCopy').innerHTML = `
    ${l1 ? `<div><b class="mono">제작 내용</b><p>${esc(l1)}</p></div>` : ''}
    ${l2 ? `<div><b class="mono">제작 성과</b><p>${esc(l2)}</p></div>` : ''}
    ${[['기간', w.period], ['산출물 수', w.outputs], ['투입 인원', w.crew]].filter(([, v]) => v).map(([k, v]) => `<div><b class="mono">${k}</b><p>${esc(v)}</p></div>`).join('')}
    ${links.length ? `<div><b class="mono">영상 보기</b><p class="links mono">${links.map((u, k) => `<a href="${esc(u)}" target="_blank" rel="noopener">${linkLabel(u)} ${pad2(k + 1)} ↗</a>`).join('')}</p></div>` : ''}`;
  $('#workGallery').className = `work-gallery ${group === 'image' ? 'tall' : ''}`;
  $('#workGallery').innerHTML = (w.clips || []).map((c) => {
    const im = `<img src="${esc(c.src)}" alt="" loading="lazy" style="aspect-ratio:${c.w} / ${c.h}">`;
    return c.link ? `<a href="${esc(c.link)}" target="_blank" rel="noopener" class="is-link">${im}<span class="mono">▶ PLAY</span></a>` : `<span>${im}</span>`;
  }).join('');
  workBox.showModal ? workBox.showModal() : workBox.setAttribute('open', '');
  workBox.querySelector('.work-inner').scrollTop = 0;
  lenisRef()?.stop();
}
workBox.addEventListener('close', () => lenisRef()?.start());
$('#workClose').addEventListener('click', () => workBox.close());
workBox.addEventListener('click', (e) => { if (e.target === workBox) workBox.close(); });
document.addEventListener('click', (e) => {
  const card = e.target.closest('.work');
  if (card) openWork(card.dataset.group, +card.dataset.i);
});
document.addEventListener('keydown', (e) => {
  const card = e.target.closest && e.target.closest('.work');
  if (card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openWork(card.dataset.group, +card.dataset.i); }
});

// 18 — 영상/이미지 필터
$$('#filter18 button').forEach((b) => b.addEventListener('click', () => {
  $$('#filter18 button').forEach((x) => x.classList.toggle('on', x === b));
  const f = b.dataset.f;
  $$('#works18 .work-group').forEach((g) => { g.hidden = f !== 'all' && g.dataset.kind !== f; });
}));

/* ════════════════════ 1-b. 스토리 구조 — 챕터 레일 · NEW MEDIA 단계 · 등장 ════════════════════ */

// 소개서 챕터(메뉴와 같은 이름) — 장 번호 범위만 정의, 문구는 기존 영문 챕터명만 쓴다
const CHAPTERS = [
  { name: 'START POINT', from: 3, to: 6, href: '#s03' },
  { name: 'NEW MEDIA', from: 7, to: 11, href: '#s07' },
  { name: 'POINT OF VIEW', from: 12, to: 15, href: '#s12' },
  { name: 'POINT OF IGNITION', from: 16, to: 18, href: '#s16' },
];
const chapterOf = (n) => CHAPTERS.findIndex((c) => n >= c.from && n <= c.to);
// 헤더 챕터 메뉴에 장 눈금을 붙인다
$$('.hdr-nav a').forEach((a) => {
  const k = CHAPTERS.findIndex((c) => c.href === a.getAttribute('href'));
  if (k < 0) return;
  const c = CHAPTERS[k];
  a.dataset.ch = k;
  a.insertAdjacentHTML('beforeend', `<span class="st-ticks" aria-hidden="true">${Array.from({ length: c.to - c.from + 1 }, (_, j) => `<i data-t="${c.from + j}"></i>`).join('')}</span>`);
});

// 챕터 표지: 몇 번째 챕터인지와 담긴 장 범위
$$('.chapter').forEach((sec) => {
  const k = chapterOf(+sec.dataset.slide);
  if (k < 0) return;
  const c = CHAPTERS[k];
  const tag = document.createElement('p');
  tag.className = 'mono chapter-tag';
  tag.innerHTML = `CHAPTER ${String(k + 1).padStart(2, '0')} / ${String(CHAPTERS.length).padStart(2, '0')}<span class="dim">${String(c.from).padStart(2, '0')} — ${String(c.to).padStart(2, '0')}</span>`;
  $('.stamp', sec)?.after(tag);
});
// 섹션 머리 막대 — (장 번호) · 소속 챕터 · 진행 — 섹션마다 같은 자리에서 구분선 역할
$$('.sec:not(.foot) .stamp').forEach((st) => {
  const sec = st.closest('[data-slide]');
  const n = +sec.dataset.slide;
  const k = chapterOf(n);
  st.className = 'sec-meta mono';
  st.innerHTML = `<span>(${pad2(n)})</span><span>${k >= 0 ? CHAPTERS[k].name : 'O.POINT'}</span><span class="dim">${pad2(n)} / 18</span>`;
});

// 상단 고정 묶음(NEW MEDIA · OPOINT IP): 고정 머리 높이를 아래 고정 요소들이 비켜 가도록 넘긴다
const groups = $$('.stack-group');
function syncGroupH() {
  groups.forEach((g) => {
    const h = $('.group-sticky', g).offsetHeight;
    g.style.setProperty('--gs-h', `${h}px`);
  });
}
syncGroupH();
addEventListener('resize', syncGroupH);

// 04 — OPOINT → VISUAL STUDIO 글자 변형(스크롤로 한 글자씩)
const morphWord = $('#morphWord');
const M_FROM = 'OPOINT', M_TO = 'VISUAL STUDIO';
let lastMorph = '';
function renderMorph(p) {
  const len = Math.max(M_FROM.length, M_TO.length);
  let html = '';
  for (let i = 0; i < len; i++) {
    const t0 = 0.12 + 0.5 * (i / len);
    const a = M_FROM[i] || '', b = M_TO[i] || '';
    let ch, cls = '';
    if (p >= t0 + 0.07) { ch = b; cls = 'to'; }
    else if (p >= t0) { ch = b === ' ' ? ' ' : GLYPHS[(i * 7 + Math.floor(p * 90)) % GLYPHS.length]; cls = 'mid'; }
    else ch = a;
    html += ch === ' ' ? '<i class="sp"> </i>' : ch ? `<i class="${cls}">${ch}</i>` : '';
  }
  if (html !== lastMorph) { morphWord.innerHTML = html; lastMorph = html; }
  morphWord.style.setProperty('--m', p.toFixed(3));
}

// 등장 — 제목·문장·블록이 화면에 들어올 때 차례로
const REV = '.sec-title, .lede, .statement-text, .nm-steps, .cats, .s04-grid, .pair, .s08-grid, .personas, .feeds, .filters, .film-play, .stats, .clients, .work-group';
const pendingRv = REDUCE ? [] : $$(REV);
pendingRv.forEach((el) => el.classList.add('rv'));
const feedFigs = [...document.querySelectorAll('#feeds09 figure')];
const feedsEl = document.getElementById('feeds09');
function syncFeeds() {       // v7: 09장 휴대폰이 스크롤에 맞춰 한 대씩
  if (!feedsEl) return;
  const p = progressOf(document.getElementById('s09'));     // 고정 구간 동안 0→1
  feedFigs.forEach((f, i) => f.classList.toggle('on', REDUCE || p > 0.04 + i * 0.15));
}
function syncReveal() {
  for (let i = pendingRv.length - 1; i >= 0; i--) {
    const el = pendingRv[i];
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.92 && r.bottom > -innerHeight * 0.5) { el.classList.add('in'); pendingRv.splice(i, 1); }
    else if (r.bottom <= -innerHeight * 0.5) { el.classList.add('in'); pendingRv.splice(i, 1); }   // 건너뛴 구간은 바로 표시
  }
}


/* ════════════════════ 2. 타이포 인터랙션 ════════════════════ */


function scramble(el, to, dur = 520) {
  if (REDUCE) { el.textContent = to; return; }
  const from = el.textContent;
  const len = Math.max(from.length, to.length);
  const t0 = performance.now();
  cancelAnimationFrame(el._raf);
  const step = (now) => {
    const p = Math.min(1, (now - t0) / dur);
    let out = '';
    for (let i = 0; i < len; i++) {
      const settle = i / len;
      if (p >= settle + 0.25 || to[i] === ' ') out += to[i] ?? '';
      else if (p > settle * 0.6) out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      else out += from[i] ?? '';
    }
    el.textContent = out;
    if (p < 1) el._raf = requestAnimationFrame(step); else el.textContent = to;
  };
  el._raf = requestAnimationFrame(step);
}
$$('[data-scramble]').forEach((a) => {
  const label = a.textContent;
  a.addEventListener('pointerenter', () => scramble(a, label, 420));
});

/* ════════════════════ 3. 스크롤 (Lenis) ════════════════════ */

const lenis = !REDUCE && window.Lenis ? new window.Lenis({ lerp: 0.09, wheelMultiplier: 0.9 }) : null;
window.__opointScroll = lenis;          // 점검용 핸들
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-nav]');
  if (!a) return;
  const target = $(a.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  // 고정 묶음 안의 섹션은 고정 머리 높이만큼 비켜서 멈춘다
  const grp = target.closest('.stack-group');
  const offset = grp && target !== grp.querySelector('.sec') ? -(grp.querySelector('.group-sticky').offsetHeight) + 1 : 0;
  if (lenis) lenis.scrollTo(target, { duration: 1.6, offset });
  else scrollTo({ top: target.getBoundingClientRect().top + scrollY + offset, behavior: REDUCE ? 'auto' : 'smooth' });
});

const hdr = $('#hdr');
const counter = $('#counter');
const slides = $$('[data-slide]');
const navLinks = $$('.hdr-nav a');
let lastSlide = null;
function syncChrome() {
  const mid = innerHeight * 0.45;
  let cur = slides[0];
  for (const s of slides) if (s.getBoundingClientRect().top <= mid) cur = s;
  if (cur === lastSlide) return;
  lastSlide = cur;
  const n = String(cur.dataset.slide).padStart(2, '0');
  counter.textContent = cur.id === 'contact' ? '[ CONTACT ]' : `[ ${n} / 18 ]`;
  const dark = cur.dataset.tone === 'dark';
  document.body.classList.toggle('is-dark', dark);
  hdr.dataset.tone = dark ? 'dark' : 'light';
  const sn = cur.id === 'contact' ? 19 : +cur.dataset.slide;
  const ck = chapterOf(Math.min(sn, 18));
  navLinks.forEach((a) => {
    const k = +a.dataset.ch;
    a.classList.toggle('on', k === ck && sn <= 18);
    a.classList.toggle('done', k < ck || sn > 18);
  });
  $$('.group-steps li').forEach((li) => {
    const tn = +li.dataset.for.slice(1);
    li.className = tn === sn ? 'on' : tn < sn ? 'done' : '';
  });
  document.body.dataset.ch = cur.dataset.ch || '';
  $$('.hdr-nav i').forEach((t) => { const tn = +t.dataset.t; t.className = tn === sn ? 'on' : tn < sn ? 'done' : ''; });
}
const bar = $('#progressBar');
function syncProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
}

/* ════════════════════ 3-b. 6장 강조 · 10장 세 원 ════════════════════ */

const DESK = matchMedia('(min-width: 901px)');
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const ease = (t) => t * t * (3 - 2 * t);
function progressOf(el) {
  const r = el.getBoundingClientRect();
  const span = el.offsetHeight - innerHeight;
  const inner = el.querySelector(':scope > .pin-inner');
  const off = inner ? parseFloat(getComputedStyle(inner).top) || 0 : 0;
  if (DESK.matches && !REDUCE && span > 40) return clamp01((off - r.top) / (span + off) / (1 - (+el.dataset.hold || 0)));   // 고정 구간 진행도 · data-hold 만큼 끝에서 머문다
  return clamp01((innerHeight * 0.8 - r.top) / (r.height * 0.9));           // 모바일: 지나가는 정도
}
const s06 = $('#s06');
const s10 = $('#s10');
const map10 = $('.media-map', s10);
const s04 = $('#s04');
const s11 = $('#s11');
const steps11 = [...$$('.flow li', s11), $('.loop', s11)];
const VC = { x: 220, y: 215 };
const DIRS = { A: [0, -1], B: [-0.866, 0.5], C: [0.866, 0.5] };
let lastP06 = -1, lastP10 = -1;
function scrollFx() {
  updateGalleries();
  syncProgress();
  syncReveal();
  syncFeeds();
  const p6 = progressOf(s06);
  if (Math.abs(p6 - lastP06) > 0.001) {
    lastP06 = p6;
    s06.classList.toggle('is-focus', p6 > 0.3);
  }
  const p10 = progressOf(s10);
  if (Math.abs(p10 - lastP10) > 0.001) {
    lastP10 = p10;
    // ① 가운데 한 점에서 세 원이 퍼져 나온다 → ② 겹친 가운데가 커지며 Casted Media 가 그 안에 선다
    const e1 = REDUCE ? 1 : ease(clamp01(p10 / 0.24));      // v7: 확장 → 가운데 확대를 앞쪽에 끝내고
    const e2 = REDUCE ? 1 : ease(clamp01((p10 - 0.3) / 0.28));   // 0.58 이후는 Casted Media 가 머무는 구간
    const d = 70 * e1 + (26 - 70) * e2;
    const r = 34 + (112 - 34) * e1 + (168 - 112) * e2;
    for (const k of ['A', 'B', 'C']) {
      const [dx, dy] = DIRS[k];
      const cx = VC.x + dx * d, cy = VC.y + dy * d;
      $$(`.c${k}`, s10).forEach((c) => { c.setAttribute('cx', cx.toFixed(2)); c.setAttribute('cy', cy.toFixed(2)); c.setAttribute('r', r.toFixed(2)); });
      const t = $(`.t${k}`, s10);
      const L = d + r * (0.55 + 0.25 * e2);
      t.setAttribute('x', (VC.x + dx * L).toFixed(1));
      t.setAttribute('y', (VC.y + dy * L + 4).toFixed(1));
    }
    map10.style.setProperty('--e1', e1.toFixed(3));
    map10.style.setProperty('--e2', e2.toFixed(3));
  }
  // 04
  if (morphWord) renderMorph(REDUCE ? 1 : progressOf(s04));
  // 11 — 단계가 하나씩
  const p11 = progressOf(s11);
  steps11.forEach((el, i) => el.classList.toggle('show', REDUCE || p11 > 0.06 + i * 0.13));
}

/* ════════════════════ 4. 3D — O. 로고가 챕터를 연기한다 ════════════════════ */

const canvas = $('#gl');
let renderer = null;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (err) {
  renderer = null;
}

if (!renderer) {
  document.documentElement.classList.add('no-gl');
  const loop = (t) => { lenis?.raf(t); syncChrome(); scrollFx(); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
} else {
  document.documentElement.classList.add('gl-on');
  startGL();
}

function startGL() {
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NeutralToneMapping;  // 흰색이 회색으로 죽지 않게
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.autoClear = false;                      // 원통 갤러리(가위 영역) → 로고 순으로 한 캔버스에 그린다
  drums = new Drums(renderer, '#0a0a0b');
  drumQueue.splice(0).forEach(([stage, items, ratio]) => drums.mount(stage, items, ratio));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  camera.position.set(0, 0, 9);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;

  // 흰 튜브가 평면 스티커로 보이지 않게 — 좌상단 키 + 약한 역광 림으로 원통 단면의 명암을 만든다
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(-4, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 1.2);
  rim.position.set(5, -2, -4);
  scene.add(rim);
  const glint = new THREE.PointLight(0xffffff, 10, 14, 1.6);
  glint.position.set(0, 0, 3.5);
  scene.add(glint);

  // ── 원본 벡터에서 치수를 재서 '원통(튜브)'으로 세운다 (2026-09-15 상은님: 각진 라인 X, 원통으로)
  //    링 = 원형 단면 토러스, 점 = 구. 정면 실루엣은 원본 로고와 1:1.
  const measured = new SVGLoader().parse(SYMBOL_SVG).paths.map((path) => {
    const pts = path.subPaths.flatMap((sp) => sp.getPoints(64));
    const xs = pts.map((v) => v.x), ys = pts.map((v) => v.y);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const ds = pts.map((v) => Math.hypot(v.x - cx, v.y - cy));
    return { cx, cy, rOut: Math.max(...ds), rIn: Math.min(...ds), w: Math.max(...xs) - Math.min(...xs) };
  }).sort((a, b) => b.w - a.w);
  const R = measured[0], D = measured[1];       // R: 링(외경 349 · 내경 267) · D: 점(반경 60)
  const U = 1 / R.rOut;
  // 2026-09-15 상은님: "더 크고 두껍게 — 타르시스 기지를 로고화한 것"
  //   외경·점 위치는 원본 그대로, 튜브 단면만 기지 비례(튜브:중심반경 ≈ 1:4)로 키운다
  const tubeR = 0.2;
  const majorR = 1 - tubeR;
  const dotR = D.rOut * U * 1.25;

  const HI = innerWidth >= 760;
  const ANISO = renderer.capabilities.getMaxAnisotropy();
  const ringTex = ringHullTextures(ANISO, HI);
  const dotTex = dotHullTextures(ANISO, HI);
  const GLOW = new THREE.Color('#ffffff');
  // 흰 패널 선체(리벳·이음선=범프 · 창·온실=발광 · 유리=낮은 거칠기)
  const makeMat = (tex) => new THREE.MeshPhysicalMaterial({
    ...tex, color: 0xffffff, metalness: 0, roughness: 1, bumpScale: 2.2,
    emissive: GLOW.clone(), emissiveIntensity: 1.1, clearcoat: 0.35, clearcoatRoughness: 0.35,
  });
  const ringMat = makeMat(ringTex);
  const dotMat = makeMat(dotTex);

  const logo = new THREE.Group();              // 화면 배치·스케일
  const inner = new THREE.Group();             // 로고 전체 무게중심 보정
  logo.add(inner);
  scene.add(logo);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(majorR, tubeR, 128, 400), ringMat);
  inner.add(ring);

  const dotHome = new THREE.Vector3((D.cx - R.cx) * U, -(D.cy - R.cy) * U, 0);
  const dotPivot = new THREE.Group();
  const dot = new THREE.Mesh(new THREE.SphereGeometry(dotR, 128, 80), dotMat);
  dot.rotation.y = 0.35;
  dotPivot.add(dot);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTexture(), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }));
  halo.scale.setScalar(dotR * 8);
  dotPivot.add(halo);
  inner.add(dotPivot);
  // 링 x[-1,1]·y[-1,1] + 점 → 묶음의 시각 중심을 원점으로
  inner.position.set(-(-1 + dotHome.x + dotR) / 2, -(1 + dotHome.y - dotR) / 2, 0);

  // ── 점화 입자 (가능성)
  const PCOUNT = innerWidth < 760 ? 520 : 1100;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(PCOUNT * 3);
  const pDir = new Float32Array(PCOUNT * 4);
  for (let i = 0; i < PCOUNT; i++) {
    const a = Math.random() * Math.PI * 2;
    const zt = (Math.random() * 2 - 1) * 0.55;
    const r = Math.sqrt(1 - zt * zt);
    pDir.set([Math.cos(a) * r, Math.sin(a) * r, zt, 0.25 + Math.pow(Math.random(), 1.7) * 5.5], i * 4);
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: GLOW, size: 0.04, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false });
  const sparks = new THREE.Points(pGeo, pMat);
  sparks.frustumCulled = false;
  dotPivot.add(sparks);

  // ── 흐르는 선 (Trionn 'touch the lines')
  const LN = 26, LP = 110;
  const lines = new THREE.Group();
  const lineMat = new THREE.LineBasicMaterial({ color: 0xededea, transparent: true, opacity: 0 });
  const lineData = [];
  for (let i = 0; i < LN; i++) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(LP * 3), 3));
    const l = new THREE.Line(g, lineMat);
    l.frustumCulled = false;                   // CPU로 매 프레임 갱신 — 경계구 계산 생략
    lines.add(l);
    lineData.push({ g, base: -3.4 + (6.8 * i) / (LN - 1), z: -1.6 - (i % 4) * 0.35, ph: Math.random() * 6.28, amp: 0.08 + Math.random() * 0.16 });
  }
  scene.add(lines);

  // ── 크기·배치
  let W = 1, H = 1, halfW = 1, halfH = 1, base = 1;
  function resize() {
    W = innerWidth; H = innerHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio, W < 760 ? 1.5 : 2));
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    halfH = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    halfW = halfH * camera.aspect;
    base = Math.min(halfH * 0.56, halfW * 0.62);   // 더 크게
    buildKeys();
  }

  // ── 스크롤 키프레임: 소개서 순서 그대로 (01 → 03 → 12 → 16 → CONTACT)
  const DEF = { x: 0, y: 0, z: 0, s: 0, rx: 0, ry: 0, fall: 1, away: 0, metal: 0, glow: 0, burst: 0, lines: 0 };
  let keys = [];
  function top(id) { const el = document.getElementById(id); return el ? el.getBoundingClientRect().top + scrollY : 0; }
  function span(id) { const el = document.getElementById(id); return el ? Math.max(1, el.offsetHeight - H) : 1; }
  const at = (id, f = 0) => top(id) + f * span(id);
  function buildKeys() {
    const vh = H;
    const raw = [
      [at('s01'), { x: 0, y: 0.27, s: 0.74, lines: 1 }],
      [at('s02'), { x: 0.66, y: -0.5, s: 0.5, ry: 1.2, rx: 0.2, lines: 0 }],
      [at('s03'), { x: 0, y: 0.12, s: 0.86, ry: -0.35, rx: 0.12, fall: 0 }],
      [at('s03', 0.62), { x: 0, y: 0.12, s: 0.9, ry: -0.12, rx: 0.06, fall: 1 }],
      [at('s03', 1), { x: 0, y: 0.12, s: 0.9, ry: 0, rx: 0, fall: 1 }],
      [at('s04') - vh * 0.2, { x: 0, y: 0.6, s: 0 }],
      [at('s12') - vh * 0.5, { x: 0, y: 0.12, s: 0, metal: 1 }],
      [at('s12'), { x: 0, y: 0.12, s: 0.72, ry: 0.95, rx: 0.25, metal: 1 }],
      [at('s12', 0.38), { x: 0, y: 0.12, s: 0.95, ry: 0, rx: 0, metal: 1 }],
      [at('s12', 0.62), { x: 0, y: 0, s: 3.9, away: 0.6, metal: 1 }],   // 링이 화면을 감싸는 '시선의 틀' 순간
      [at('s12', 0.9), { x: 0, s: 17, away: 1, metal: 1 }],
      [at('s12', 1), { x: 0, s: 30, away: 1, metal: 1 }],
      [at('s13') + vh * 0.05, { x: 0, s: 0, away: 0, metal: 0 }],
      [at('s16') - vh * 0.5, { x: 0, y: 0.12, s: 0 }],
      [at('s16'), { x: 0, y: 0.12, s: 0.8, ry: -0.6, rx: 0.1 }],
      [at('s16', 0.42), { x: 0, y: 0.12, s: 0.92, ry: 0, glow: 1 }],
      [at('s16', 0.95), { x: 0, y: 0.12, s: 0.92, glow: 1.8, burst: 1 }],
      [at('s17') - vh * 0.35, { x: 0, y: 0.12, s: 0, glow: 0, burst: 1 }],   // 포폴 갤러리 전에 완전히 빠진다
      [at('contact') - vh * 0.4, { x: 0, y: 0.3, s: 0, burst: 0, metal: 1 }],
      [at('contact') + vh * 0.25, { x: 0, y: 0.34, s: 0.46, metal: 1 }],
    ];
    const maxY = Math.max(0, document.documentElement.scrollHeight - H);
    let prev = { ...DEF };
    keys = raw.map(([y, v]) => {
      const merged = { ...DEF, ...prev, ...v };
      // 명시 안 한 순간값(fall·away·burst·glow·lines)은 앞 키에서 이어받는다
      prev = merged;
      return [Math.min(y, maxY), merged];
    });
    keys.sort((a, b) => a[0] - b[0]);
  }
  const smooth = (t) => t * t * (3 - 2 * t);
  const bounce = (t) => {
    const n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
    return n * (t -= 2.625 / d) * t + 0.984375;
  };
  const target = { ...DEF };
  function sample(y) {
    if (!keys.length) return;
    if (y <= keys[0][0]) return Object.assign(target, keys[0][1]);
    for (let i = 0; i < keys.length - 1; i++) {
      const [y0, a] = keys[i], [y1, b] = keys[i + 1];
      if (y >= y0 && y <= y1) {
        const t = y1 === y0 ? 1 : (y - y0) / (y1 - y0);
        const e = smooth(t);
        for (const k in DEF) target[k] = a[k] + (b[k] - a[k]) * (k === 'fall' || k === 'burst' ? t : e);
        return;
      }
    }
    Object.assign(target, keys[keys.length - 1][1]);
  }

  // ── 포인터
  const ptr = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener('pointermove', (e) => { ptr.x = (e.clientX / W) * 2 - 1; ptr.y = -(e.clientY / H) * 2 + 1; }, { passive: true });

  const cur = { ...DEF };
  const clock = new THREE.Clock();
  let running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) requestAnimationFrame(frame); });

  function frame(now) {
    if (!running) return;
    lenis?.raf(now);
    syncChrome();
    scrollFx();
    const t = clock.getElapsedTime();
    sample(scrollY);
    const k = REDUCE ? 1 : 0.14;
    for (const key in DEF) cur[key] += (target[key] - cur[key]) * (key === 's' ? Math.min(1, k * 1.3) : k);
    ptr.sx += (ptr.x - ptr.sx) * 0.06;
    ptr.sy += (ptr.y - ptr.sy) * 0.06;

    const narrow = camera.aspect < 0.9;
    const idle = REDUCE ? 0 : 1;
    logo.position.set(
      narrow ? 0 : cur.x * halfW,
      (cur.y + (narrow && cur.x !== 0 ? 0.22 : 0)) * halfH + Math.sin(t * 0.8) * 0.04 * idle,
      cur.z,
    );
    const sc = Math.max(0.0001, cur.s * base);
    logo.scale.setScalar(sc);
    logo.visible = cur.s > 0.003;
    logo.rotation.set(
      cur.rx - ptr.sy * 0.22 * idle + Math.sin(t * 0.5) * 0.03 * idle,
      cur.ry + ptr.sx * 0.32 * idle + Math.sin(t * 0.37) * 0.05 * idle,
      0,
    );

    // 출발점: 점이 떨어져 제자리에 앉는다
    const fall = REDUCE ? 1 : bounce(THREE.MathUtils.clamp(cur.fall, 0, 1));
    dotPivot.position.set(
      dotHome.x + cur.away * 1.6,
      dotHome.y + (1 - fall) * 2.8 - cur.away * 1.4,
      dotHome.z + cur.away * 2.2,
    );
    dotPivot.rotation.z = (1 - fall) * 1.6;

    // 재질: 무광 선체 → 코팅 광택(관점), 점은 현창·광륜으로 점화 — 로고는 끝까지 화이트
    const m = THREE.MathUtils.clamp(cur.metal, 0, 1);
    for (const mat of [ringMat, dotMat]) {
      mat.roughness = 1 - m * 0.3;
      mat.clearcoat = 0.35 + m * 0.5;
      mat.clearcoatRoughness = 0.35 - m * 0.23;
    }
    const g = Math.max(0, cur.glow);
    dotMat.emissiveIntensity = 1.1 + g * 1.6;       // 점화: 현창이 먼저 밝아지고
    halo.material.opacity = Math.min(1, g * 0.6);   // 광륜이 번진다

    // 점화 입자
    const b = REDUCE ? 0 : THREE.MathUtils.clamp(cur.burst, 0, 1);
    pMat.opacity = b > 0.01 ? Math.min(1, b * 3) * (1 - Math.pow(b, 6) * 0.35) : 0;
    if (pMat.opacity > 0) {
      const e = 1 - Math.pow(1 - b, 3);
      for (let i = 0; i < PCOUNT; i++) {
        const o = i * 4, d = pDir[o + 3] * e + Math.sin(t * 0.6 + i) * 0.03 * b;
        pPos[i * 3] = pDir[o] * d; pPos[i * 3 + 1] = pDir[o + 1] * d; pPos[i * 3 + 2] = pDir[o + 2] * d;
      }
      pGeo.attributes.position.needsUpdate = true;
    }

    // 흐르는 선 — 포인터 가까이서 갈라진다
    lineMat.opacity = cur.lines * 0.2;
    lines.visible = lineMat.opacity > 0.01;
    if (lines.visible) {
      const px = ptr.sx * halfW, py = ptr.sy * halfH;
      const span = halfW * 1.25;
      for (const L of lineData) {
        const arr = L.g.attributes.position.array;
        for (let j = 0; j < LP; j++) {
          const x = -span + (2 * span * j) / (LP - 1);
          let y = L.base * (halfH / 2.4) + Math.sin(x * 0.55 + L.ph + t * 0.35 * idle) * L.amp;
          const dx = x - px, dy = y - py;
          const f = Math.exp(-(dx * dx + dy * dy) / 0.8) * (FINE ? 0.85 : 0);
          y += Math.sign(dy || 1) * f;
          arr[j * 3] = x; arr[j * 3 + 1] = y; arr[j * 3 + 2] = L.z;
        }
        L.g.attributes.position.needsUpdate = true;
      }
    }

    glint.position.set(ptr.sx * halfW * 0.8, ptr.sy * halfH * 0.8, 3.5);
    renderer.clear();
    drums.render(W, H, REDUCE, t);
    renderer.clearDepth();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  addEventListener('resize', resize);
  addEventListener('load', buildKeys);
  new ResizeObserver(() => buildKeys()).observe(document.getElementById('deck'));
  resize();
  requestAnimationFrame(frame);
}
