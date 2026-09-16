import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { SYMBOL_SVG, WORDMARK_SVG } from './logo-paths.js';
import { ringHullTextures, dotHullTextures, haloTexture } from './hull-texture.js';
import { Drums } from './drum.js';
import { buildGallery, updateGalleries } from './galleries.js';

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
  $('#phone08').innerHTML = `<div class="screen"><img src="${esc(C.assets08.phoneScreen)}" alt="AI 모델 브랜드 에셋" loading="lazy"></div>
    <img class="frame" src="${esc(C.assets08.phone)}" alt="">`;
  $('#gallery08').innerHTML = C.assets08.gallery.map((s) => `<img src="${esc(s)}" alt="" loading="lazy">`).join('');
}
// 09
if (C.feeds09) $('#feeds09').innerHTML = C.feeds09.map((s) => `<img src="${esc(s)}" alt="페르소나 인스타그램 피드" loading="lazy">`).join('');

// 연락처
if (C.contact && (C.contact.email || C.contact.phone)) {
  const c = C.contact;
  $('#contactInfo').classList.remove('dim');
  $('#contactInfo').innerHTML = [c.email && `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`, esc(c.phone), esc(c.address)].filter(Boolean).join('&nbsp;&nbsp;·&nbsp;&nbsp;');
}

// 17·18 인덱스
const preview = $('#hoverPreview');
function renderIndex(list, key) {
  const ol = $(`[data-works="${key}"]`);
  if (!ol) return;
  ol.innerHTML = (C.works[key] || []).map((w, i) => {
    const n = String(i + 1).padStart(3, '0');
    const inner = `<span class="n">[ ${n} ]</span><span class="yr">C. ${esc(w.year)}</span>
      <span class="name">${esc(w.name)}</span>
      <span class="tags">${(w.tags || []).map((t) => `<i>${esc(t)}</i>`).join('')}</span>
      <span class="status ${w.sample ? 'sample' : ''}">${w.sample ? 'SAMPLE' : esc(w.status)}</span>
      <span class="go" aria-hidden="true">${w.link ? '↗' : '→'}</span>`;
    return w.link
      ? `<li data-i="${i}"><a href="${esc(w.link)}" target="_blank" rel="noopener">${inner}</a></li>`
      : `<li data-i="${i}"><div role="button" tabindex="0">${inner}</div></li>`;
  }).join('');

  $$('li', ol).forEach((li) => {
    const w = C.works[key][+li.dataset.i];
    const row = li.firstElementChild;
    if (FINE && w.cover) {
      row.addEventListener('pointerenter', () => { preview.src = w.cover; preview.hidden = false; });
      row.addEventListener('pointerleave', () => { preview.hidden = true; });
    }
    if (key === 'youtube') {
      const pick = () => renderFeature(+li.dataset.i);
      row.addEventListener('click', pick);
      row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    }
  });
}
function renderFeature(i = 0) {
  const w = (C.works.youtube || [])[i];
  const box = $('#feature17');
  if (!w || !box) return;
  box.innerHTML = `<figure class="slot"></figure>
    <div class="feature-bar mono"><span>${esc(w.period)}</span><span>${esc(w.outputs)}</span><span>${esc(w.crew)}</span></div>
    <div class="feature-cards">${(w.results || []).map((r) => `<div><b>${esc(r.title)}</b><p>${esc(r.body)}</p></div>`).join('')}</div>`;
  fillSlot($('.slot', box), { tag: '이미지', spec: '결과물 대표 비주얼', ratio: '21 / 9', mode: 'reveal', images: w.images || [] });
  $$('[data-works="youtube"] li').forEach((li) => li.classList.toggle('on', +li.dataset.i === i));
}
renderIndex(C.works.youtube, 'youtube');
renderIndex(C.works.image, 'image');
renderFeature(0);

addEventListener('pointermove', (e) => {
  if (!preview.hidden) preview.style.transform = `translate(${e.clientX + 150}px, ${e.clientY}px) translate(-50%, -50%)`;
}, { passive: true });

/* ════════════════════ 2. 타이포 인터랙션 ════════════════════ */

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789✺';
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
const morph = $('#morph');
if (morph) {
  const words = ['OPOINT', 'VISUAL STUDIO'];
  let k = 0;
  if (REDUCE) morph.textContent = 'OPOINT → VISUAL STUDIO';
  else setInterval(() => { k = (k + 1) % words.length; scramble(morph, words[k], 900); }, 2600);
}

/* ════════════════════ 3. 스크롤 (Lenis) ════════════════════ */

const lenis = !REDUCE && window.Lenis ? new window.Lenis({ lerp: 0.09, wheelMultiplier: 0.9 }) : null;
window.__opointScroll = lenis;          // 점검용 핸들
$$('[data-nav]').forEach((a) => a.addEventListener('click', (e) => {
  const target = $(a.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  if (lenis) lenis.scrollTo(target, { duration: 1.6 });
  else target.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' });
}));

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
  const chapter = +cur.dataset.slide >= 16 ? '#s16' : +cur.dataset.slide >= 12 ? '#s12' : +cur.dataset.slide >= 7 ? '#s07' : +cur.dataset.slide >= 3 ? '#s03' : '';
  navLinks.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === chapter));
}

/* ════════════════════ 3-b. 6장 강조 · 10장 세 원 ════════════════════ */

const DESK = matchMedia('(min-width: 901px)');
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const ease = (t) => t * t * (3 - 2 * t);
function progressOf(el) {
  const r = el.getBoundingClientRect();
  const span = el.offsetHeight - innerHeight;
  if (DESK.matches && !REDUCE && span > 40) return clamp01(-r.top / span);   // 고정 구간 진행도
  return clamp01((innerHeight * 0.8 - r.top) / (r.height * 0.9));           // 모바일: 지나가는 정도
}
const s06 = $('#s06');
const s10 = $('#s10');
const map10 = $('.media-map', s10);
const VC = { x: 220, y: 215 };
const DIRS = { A: [0, -1], B: [-0.866, 0.5], C: [0.866, 0.5] };
let lastP06 = -1, lastP10 = -1;
function scrollFx() {
  updateGalleries();
  const p6 = progressOf(s06);
  if (Math.abs(p6 - lastP06) > 0.001) {
    lastP06 = p6;
    s06.classList.toggle('is-focus', p6 > 0.3);
  }
  const p10 = progressOf(s10);
  if (Math.abs(p10 - lastP10) > 0.001) {
    lastP10 = p10;
    const e = ease(clamp01(p10 / 0.7));
    const d = 165 + (62 - 165) * e;
    const r = 46 + (116 - 46) * e;
    for (const k of ['A', 'B', 'C']) {
      const [dx, dy] = DIRS[k];
      const cx = VC.x + dx * d, cy = VC.y + dy * d;
      $$(`.c${k}`, s10).forEach((c) => { c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', r); });
      const t = $(`.t${k}`, s10);
      t.setAttribute('x', VC.x + dx * (d + r * 0.42 * e));
      t.setAttribute('y', VC.y + dy * (d + r * 0.42 * e) + 4);
    }
    map10.style.setProperty('--q', ease(clamp01((p10 - 0.45) / 0.4)).toFixed(3));
    map10.style.setProperty('--o', ease(clamp01((p10 - 0.25) / 0.35)).toFixed(3));
  }
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
      [at('s02'), { x: 0.58, y: 0.02, s: 0.9, ry: 1.2, rx: 0.2, lines: 0 }],
      [at('s03'), { x: 0.46, y: -0.02, s: 1.0, ry: -0.35, rx: 0.12, fall: 0 }],
      [at('s03', 0.62), { x: 0.46, s: 1.02, ry: -0.12, rx: 0.06, fall: 1 }],
      [at('s03', 1), { x: 0.46, s: 1.02, ry: 0, rx: 0, fall: 1 }],
      [at('s04') + vh * 0.12, { x: 0.8, y: 0.5, s: 0 }],
      [at('s12') - vh * 0.5, { x: 0.35, y: 0, s: 0, metal: 1 }],
      [at('s12'), { x: 0.35, s: 0.72, ry: 0.95, rx: 0.25, metal: 1 }],
      [at('s12', 0.38), { x: 0.35, s: 1.08, ry: 0, rx: 0, metal: 1 }],
      [at('s12', 0.62), { x: 0, s: 3.9, away: 0.6, metal: 1 }],   // 링이 화면을 감싸는 '시선의 틀' 순간
      [at('s12', 0.9), { x: 0, s: 17, away: 1, metal: 1 }],
      [at('s12', 1), { x: 0, s: 30, away: 1, metal: 1 }],
      [at('s13') + vh * 0.05, { x: 0, s: 0, away: 0, metal: 0 }],
      [at('s16') - vh * 0.5, { x: 0.42, s: 0 }],
      [at('s16'), { x: 0.42, s: 0.82, ry: -0.6, rx: 0.1 }],
      [at('s16', 0.42), { x: 0.42, s: 1.02, ry: 0, glow: 1 }],
      [at('s16', 0.95), { x: 0.42, s: 1.02, glow: 1.8, burst: 1 }],
      [at('s17') - vh * 0.55, { x: 0.42, s: 0, glow: 0, burst: 1 }],   // 포폴 갤러리 전에 완전히 빠진다
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
