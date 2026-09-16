import * as THREE from 'three';

/* 타르시스 기지 선체 질감 — 코드로 그린다(생성 비용 0).
   레퍼: 상은님 첨부 기지 시트(흰 패널 선체 · 리벳 · 하늘색 창 · 온실 유리 구간).

   토러스 UV: u = 링 둘레(0→1, +x에서 반시계), v = 튜브 단면 각 φ/2π
   φ=0 바깥 적도 · φ=π/2 정면(카메라) · φ=π 안쪽 적도.  캔버스 y = (1 - v) * H  */

const rand = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}
const yOf = (phi, H) => (1 - phi / (Math.PI * 2)) * H;

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

/** 창 하나를 네 장(색·범프·거칠기·발광)에 동시에 찍는다 */
function stampWindow(L, cx, cy, w, h) {
  const r = Math.min(w, h) / 2;
  const { col, bump, rough, emi } = L;
  // 프레임
  col.fillStyle = '#b9bab8'; roundRect(col, cx - w / 2 - 5, cy - h / 2 - 5, w + 10, h + 10, r + 5); col.fill();
  bump.fillStyle = '#d8d8d8'; roundRect(bump, cx - w / 2 - 5, cy - h / 2 - 5, w + 10, h + 10, r + 5); bump.fill();
  // 유리
  const gr = col.createLinearGradient(cx, cy - h / 2, cx, cy + h / 2);
  gr.addColorStop(0, '#e6f4ff'); gr.addColorStop(0.55, '#a9d3f5'); gr.addColorStop(1, '#8cc0ec');
  col.fillStyle = gr; roundRect(col, cx - w / 2, cy - h / 2, w, h, r); col.fill();
  bump.fillStyle = '#6a6a6a'; roundRect(bump, cx - w / 2, cy - h / 2, w, h, r); bump.fill();
  rough.fillStyle = '#1e1e1e'; roundRect(rough, cx - w / 2, cy - h / 2, w, h, r); rough.fill();
  emi.fillStyle = '#7fb6e6'; roundRect(emi, cx - w / 2, cy - h / 2, w, h, r); emi.fill();
}

function hullBase(L, W, H) {
  const { col, bump, rough } = L;
  col.fillStyle = '#e7e7e3'; col.fillRect(0, 0, W, H);
  bump.fillStyle = '#808080'; bump.fillRect(0, 0, W, H);
  rough.fillStyle = '#8c8c8c'; rough.fillRect(0, 0, W, H);
  // 미세 얼룩·결
  for (let i = 0; i < W * H / 900; i++) {
    const x = rand() * W, y = rand() * H, s = 1 + rand() * 3;
    const a = rand() * 0.05;
    col.fillStyle = `rgba(90,90,85,${a})`; col.fillRect(x, y, s, s);
    bump.fillStyle = `rgba(${rand() < 0.5 ? 0 : 255},${rand() < 0.5 ? 0 : 255},${rand() < 0.5 ? 0 : 255},0.04)`;
    bump.fillRect(x, y, s, s);
  }
}

function seam(L, x0, y0, x1, y1, rivets = true) {
  const { col, bump } = L;
  col.strokeStyle = 'rgba(120,120,116,0.55)'; col.lineWidth = 2.2;
  col.beginPath(); col.moveTo(x0, y0); col.lineTo(x1, y1); col.stroke();
  bump.strokeStyle = '#3a3a3a'; bump.lineWidth = 3;
  bump.beginPath(); bump.moveTo(x0, y0); bump.lineTo(x1, y1); bump.stroke();
  if (!rivets) return;
  const len = Math.hypot(x1 - x0, y1 - y0), n = Math.floor(len / 17);
  const nx = -(y1 - y0) / len, ny = (x1 - x0) / len;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    for (const side of [-1, 1]) {
      const x = x0 + (x1 - x0) * t + nx * 7 * side, y = y0 + (y1 - y0) * t + ny * 7 * side;
      col.fillStyle = 'rgba(150,150,146,0.9)'; col.beginPath(); col.arc(x, y, 1.9, 0, 7); col.fill();
      bump.fillStyle = '#c8c8c8'; bump.beginPath(); bump.arc(x, y, 2.2, 0, 7); bump.fill();
    }
  }
}

function toTextures(L, canvases, anisotropy) {
  const mk = (c, srgb) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = anisotropy;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  return { map: mk(canvases.col, true), bumpMap: mk(canvases.bump), roughnessMap: mk(canvases.rough), emissiveMap: mk(canvases.emi, true) };
}

function layers(W, H) {
  const [cCol, col] = makeCanvas(W, H), [cBump, bump] = makeCanvas(W, H);
  const [cRough, rough] = makeCanvas(W, H), [cEmi, emi] = makeCanvas(W, H);
  emi.fillStyle = '#000'; emi.fillRect(0, 0, W, H);
  return [{ col, bump, rough, emi }, { col: cCol, bump: cBump, rough: cRough, emi: cEmi }];
}

/** 링(토러스) 선체 */
export function ringHullTextures(anisotropy = 8, hi = true) {
  const W = hi ? 4096 : 2048, H = W / 4, k = W / 4096;
  const [L, C] = layers(W, H);
  hullBase(L, W, H);

  const GH = [0.815, 0.965];                    // 온실 유리 구간(u) — 우하단, 점(.) 쪽
  const inGH = (u) => u > GH[0] - 0.006 && u < GH[1] + 0.006;

  // 둘레 이음선(φ 일정)
  for (const phi of [Math.PI * 0.2, Math.PI * 0.8, Math.PI * 1.25, Math.PI * 1.75]) {
    const y = yOf(phi, H);
    seam(L, 0, y, W * GH[0], y); seam(L, W * GH[1], y, W, y);
  }
  // 방사 이음선(u 일정) — 벽돌식 엇갈림
  const PANELS = 30;
  for (let i = 0; i < PANELS; i++) {
    const u = i / PANELS; if (inGH(u)) continue;
    const x = u * W;
    seam(L, x, yOf(Math.PI * 0.8, H), x, yOf(Math.PI * 0.2, H));   // 정면 밴드
    const xo = (u + 0.5 / PANELS) * W;
    if (!inGH(u + 0.5 / PANELS)) {
      seam(L, xo, yOf(Math.PI * 0.2, H), xo, H, false);             // 바깥 밴드
      seam(L, xo, yOf(Math.PI * 1.25, H), xo, yOf(Math.PI * 0.8, H), false); // 안쪽 밴드
    }
  }

  // 창 — 윗면 바깥쪽 줄(캡슐·원 교차), 안쪽 줄(작은 원), 바깥 옆면 줄
  const rowA = yOf(Math.PI * 0.33, H), rowB = yOf(Math.PI * 0.66, H), rowC = yOf(Math.PI * 0.06, H);
  for (let i = 0; i < 26; i++) {
    const u = (i + 0.5) / 26; if (inGH(u)) continue;
    if (i % 2 === 0) stampWindow(L, u * W, rowA, 78 * k, 22 * k);
    else stampWindow(L, u * W, rowA, 24 * k, 24 * k);
  }
  for (let i = 0; i < 18; i++) {
    const u = (i + 0.25) / 18; if (inGH(u)) continue;
    stampWindow(L, u * W, rowB, i % 3 === 0 ? 50 * k : 18 * k, 18 * k);
  }
  for (let i = 0; i < 14; i++) {
    const u = (i + 0.7) / 14; if (inGH(u)) continue;
    stampWindow(L, u * W, rowC, 64 * k, 20 * k);
  }

  // 온실 유리 구간
  const gx0 = GH[0] * W, gx1 = GH[1] * W, gy0 = yOf(Math.PI * 1.02, H), gy1 = yOf(Math.PI * 0.02, H);
  const { col, bump, rough, emi } = L;
  const inside = col.createLinearGradient(0, gy0, 0, gy1);
  inside.addColorStop(0, '#e9dcc0'); inside.addColorStop(0.35, '#b8a47a'); inside.addColorStop(1, '#3d4a31');
  col.fillStyle = inside; col.fillRect(gx0, gy0, gx1 - gx0, gy1 - gy0);
  for (let i = 0; i < 900 * k * k; i++) {
    const x = gx0 + rand() * (gx1 - gx0), y = gy0 + (0.3 + rand() * 0.7) * (gy1 - gy0), r = (4 + rand() * 16) * k;
    const g = 70 + rand() * 90;
    col.fillStyle = `rgba(${30 + rand() * 40},${g},${30 + rand() * 25},${0.55 + rand() * 0.4})`;
    col.beginPath(); col.ellipse(x, y, r * 1.4, r, rand() * 3, 0, 7); col.fill();
  }
  const glow = emi.createLinearGradient(0, gy0, 0, gy1);
  glow.addColorStop(0, '#6d5c3c'); glow.addColorStop(1, '#16180f');
  emi.fillStyle = glow; emi.fillRect(gx0, gy0, gx1 - gx0, gy1 - gy0);
  rough.fillStyle = '#141414'; rough.fillRect(gx0, gy0, gx1 - gx0, gy1 - gy0);
  bump.fillStyle = '#707070'; bump.fillRect(gx0, gy0, gx1 - gx0, gy1 - gy0);
  // 멀리언 격자
  const bar = (x, y, w, h) => {
    col.fillStyle = '#f1f1ed'; col.fillRect(x, y, w, h);
    bump.fillStyle = '#d4d4d4'; bump.fillRect(x, y, w, h);
    rough.fillStyle = '#7a7a7a'; rough.fillRect(x, y, w, h);
    emi.fillStyle = '#000'; emi.fillRect(x, y, w, h);
  };
  const cols = 11, rows = 5, bw = 7 * k;
  for (let i = 0; i <= cols; i++) bar(gx0 + ((gx1 - gx0) * i) / cols - bw / 2, gy0, bw, gy1 - gy0);
  for (let j = 0; j <= rows; j++) bar(gx0, gy0 + ((gy1 - gy0) * j) / rows - bw / 2, gx1 - gx0, bw);
  bar(gx0 - 10 * k, gy0, 14 * k, gy1 - gy0); bar(gx1 - 4 * k, gy0, 14 * k, gy1 - gy0);

  return toTextures(L, C, anisotropy);
}

/** 점(구) — 같은 선체 언어의 캡슐 모듈 */
export function dotHullTextures(anisotropy = 8, hi = true) {
  const W = hi ? 2048 : 1024, H = W / 2, k = W / 2048;
  const [L, C] = layers(W, H);
  hullBase(L, W, H);
  for (let i = 0; i < 10; i++) seam(L, (i / 10) * W, H * 0.16, (i / 10) * W, H * 0.84);
  for (const y of [H * 0.3, H * 0.7]) seam(L, 0, y, W, y);
  // 정면(u=0.25) 둥근 현창 + 해치
  stampWindow(L, W * 0.25, H * 0.45, 120 * k, 120 * k);
  stampWindow(L, W * 0.75, H * 0.5, 160 * k, 44 * k);
  const { col, bump } = L;
  col.strokeStyle = 'rgba(120,120,116,0.6)'; col.lineWidth = 2.5;
  roundRect(col, W * 0.42, H * 0.36, 150 * k, 190 * k, 22 * k); col.stroke();
  bump.strokeStyle = '#3a3a3a'; bump.lineWidth = 3;
  roundRect(bump, W * 0.42, H * 0.36, 150 * k, 190 * k, 22 * k); bump.stroke();
  return toTextures(L, C, anisotropy);
}

/** 점화용 부드러운 광륜 */
export function haloTexture() {
  const [c, g] = makeCanvas(256, 256);
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.25, 'rgba(220,236,255,0.45)');
  gr.addColorStop(1, 'rgba(200,225,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
