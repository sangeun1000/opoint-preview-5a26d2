/* 교체 자리 갤러리 — 내용 성격별로 연출을 나눈다 (2026-09-15 상은님 "둥그런 것만 반복되니 지루")
   drum    : 원통(퀸틴 방식) — 한 곳만(07 브랜드 필름)
   stack   : 카드 스택이 한 장씩 걷힌다 — 변형·구성 요소 나열(04·13)
   columns : 두 단이 엇갈려 흐른다 — 나란한 두 기능(05)
   reveal  : 가는 틈이 화면비로 열리고 다음 장이 밀어 올린다 — 트레일러·대표 비주얼(14·17)
   rail    : 옆으로 넘기는 가로 레일 — 문서 스프레드(15)  */

const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const ease = (t) => t * t * (3 - 2 * t);
const isVideo = (s) => /\.(mp4|webm|mov)(\?|$)/i.test(s);
const ytOf = (s = '') => (String(s).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/) || [])[1] || '';
// 유튜브 주소면 무음 자동재생·반복 임베드(스크롤을 막지 않게 클릭은 통과), 아니면 영상/이미지
const media = (src) => {
  const [url, fb] = String(src).split('|');   // 'YouTube 주소|사이트 안 대체 영상'
  const yt = ytOf(url);
  if (yt) return `<div class="g-media g-yt-embed">${fb ? `<video class="yt-fallback" src="${esc(fb)}" muted loop playsinline autoplay preload="auto"></video>` : ''}<iframe src="https://www.youtube.com/embed/${yt}?autoplay=1&mute=1&loop=1&playlist=${yt}&controls=0&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1&origin=${encodeURIComponent(location.origin)}" title="YouTube" allow="autoplay; encrypted-media; picture-in-picture" tabindex="-1"></iframe></div>`;
  return isVideo(src)
    ? `<video class="g-media" src="${esc(src)}" muted loop playsinline autoplay preload="metadata" data-lazyplay></video>`
    : `<img class="g-media" src="${esc(src)}" alt="" loading="lazy">`;
};
const pad = (n) => String(n).padStart(2, '0');

const live = [];
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 요소 윗변이 화면 start 지점 → 아랫변이 end 지점에 닿는 동안 0→1 (화면 높이 비율) */
function passing(el, start = 0.7, end = 0.3) {
  const r = el.getBoundingClientRect();
  return clamp01((innerHeight * start - r.top) / ((start - end) * innerHeight + r.height));
}
/** 고정 구간 진행도(0→1) */
function pinned(el, sticky) {
  const r = el.getBoundingClientRect();
  const top = parseFloat(getComputedStyle(sticky).top) || 0;
  return clamp01((top - r.top) / Math.max(1, r.height - sticky.offsetHeight));
}

/** 고정(pin) 섹션 전체 진행도 — 갤러리가 고정 구간 안에 있을 때 */
function sectionProgress(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const r = el.getBoundingClientRect();
  const span = el.offsetHeight - innerHeight;
  if (span < 40) return passing(el, 0.8, 0.2);
  return clamp01(-r.top / span / (1 - (+el.dataset.hold || 0)));   // data-hold: 끝부분은 멈춰 있는 구간
}

export function buildGallery(fig, cfg, { mountDrum }) {
  const items = (cfg.images && cfg.images.length ? cfg.images : ['']);
  const [rw, rh] = String(cfg.ratio || '16 / 9').split('/').map(Number);
  const mode = cfg.mode || 'stack';
  const n = items.length;
  const label = cfg.caption ? esc(cfg.caption) : `[ 교체 ] ${esc(cfg.tag || '')} — ${esc(cfg.spec || '')}`;
  const cap = `<figcaption class="mono g-cap${cfg.caption ? ' is-real' : ''}"><span>${label}</span><span class="g-count">01 / ${pad(n)}</span></figcaption>`;
  fig.className = `slot g-${mode}${fig.classList.contains('wide') ? ' wide' : ''}`;
  fig.style.setProperty('--ratio', `${rw} / ${rh}`);
  fig.style.setProperty('--ar', (rw / rh).toFixed(4));
  fig.style.setProperty('--n', n);

  if (mode === 'drum') {
    fig.style.setProperty('--sar', (rw / (rh * 1.6)).toFixed(4));
    fig.innerHTML = `<div class="drum-stage" style="aspect-ratio:${rw} / ${(rh * 1.6).toFixed(3)}">
        ${items[0] && !isVideo(items[0]) ? `<img class="drum-fallback" src="${esc(items[0])}" alt="" loading="lazy">` : ''}</div>${cap}`;
    mountDrum(fig.firstElementChild, items, rw / rh);
    return;
  }

  if (mode === 'single') {    // 한 편을 크게 가운데(13장: 크루 4인)
    fig.innerHTML = `<div class="g-frame single-frame${cfg.fit === 'contain' ? ' is-contain' : ''}">${media(items[0])}</div>${cap.replace(/<span class="g-count">.*?<\/span>/, '')}`;
    return;
  }

  if (mode === 'yt') {        // 유튜브 영상 카드 레일(15장: POV) — 누르면 유튜브 새 창
    const vids = cfg.videos || [];
    const m = vids.length;
    const poster = cfg.poster ? `style="background-image:url('${esc(cfg.poster)}')"` : '';
    fig.style.setProperty('--n', m);
    fig.className = `slot g-rail g-yt${fig.classList.contains('wide') ? ' wide' : ''}`;
    const EMBED = (id) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&playsinline=1&rel=0&modestbranding=1`;
    fig.innerHTML = `<div class="rail-sticky"><div class="rail-track">${vids.map((v, i) => `<div class="rail-item yt-card" data-yt="${esc(v.id)}">
        <div class="g-frame yt-thumb" ${poster}><img src="${esc(v.thumb || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`)}" alt="" loading="lazy" onerror="this.remove()"><span class="yt-slot"></span>
          <a class="yt-hit" href="https://youtu.be/${esc(v.id)}" target="_blank" rel="noopener" aria-label="${esc(v.title)} — 유튜브에서 보기"></a>
          <span class="yt-ep mono">POV ${pad(i + 1)}</span>${v.dur ? `<span class="yt-dur mono">${esc(v.dur)}</span>` : ''}</div>
        <a class="yt-title" href="https://youtu.be/${esc(v.id)}" target="_blank" rel="noopener">${esc(v.title)}</a><span class="mono rail-no">${pad(i + 1)} / ${pad(m)} · YOUTUBE ↗</span></div>`).join('')}</div>${cap.replace(`01 / ${pad(n)}`, `01 / ${pad(m)}`)}</div>`;
    const sticky = fig.querySelector('.rail-sticky');
    const track = fig.querySelector('.rail-track');
    const count = fig.querySelector('.g-count');
    const cards = [...fig.querySelectorAll('.yt-card')];
    // 임베드가 막힌 환경(보안 정책)에서는 썸네일·포스터 카드로 되돌린다
    document.addEventListener('securitypolicyviolation', (e) => {
      if (/frame|child|default/.test(e.violatedDirective || e.effectiveDirective || '') && /youtube/.test(e.blockedURI || '')) {
        fig.classList.add('yt-blocked');
        fig.querySelectorAll('.yt-slot iframe').forEach((f) => f.remove());
      }
    });
    live.push({ fig, update() {
      const p = REDUCE ? 0 : pinned(fig, sticky);
      const travel = Math.max(0, track.scrollWidth - sticky.clientWidth);
      track.style.transform = `translate3d(${-p * travel}px, 0, 0)`;
      count.textContent = `${pad(Math.min(m, Math.floor(p * m * 0.999) + 1))} / ${pad(m)}`;
      // 화면에 들어온 카드만 무음 자동재생(유튜브 임베드)으로 바꾼다 — 한 번 붙이면 유지
      const fr = fig.getBoundingClientRect();
      if (fr.top > innerHeight || fr.bottom < 0 || fig.classList.contains('yt-blocked')) return;
      cards.forEach((c) => {
        if (c.dataset.on) return;
        const r = c.getBoundingClientRect();
        if (r.left < innerWidth * 1.05 && r.right > -innerWidth * 0.05) {
          c.dataset.on = '1';
          const f = document.createElement('iframe');
          f.src = EMBED(c.dataset.yt);
          f.title = 'YouTube';
          f.allow = 'autoplay; encrypted-media; picture-in-picture';
          f.setAttribute('tabindex', '-1');
          f.addEventListener('load', () => setTimeout(() => { if (!fig.classList.contains('yt-blocked')) c.classList.add('is-live'); }, 400));
          c.querySelector('.yt-slot').appendChild(f);
        }
      });
    } });
    return;
  }

  if (mode === 'duo') {       // 나란한 두 영상(13장: 로고 영상 ／ 크루 4인)
    const labels = cfg.labels || [];
    fig.innerHTML = `<div class="duo">${items.map((s, i) => `<div class="duo-item"><div class="g-frame">${media(s)}</div><span class="mono duo-label">${pad(i + 1)}${labels[i] ? ` — ${esc(labels[i])}` : ''}</span></div>`).join('')}</div>${cap}`;
    return;
  }

  if (mode === 'stack') {
    fig.innerHTML = `<div class="g-frame">${items.map((s, i) => `<div class="card" style="z-index:${n - i}">${media(s)}<span class="mono card-no">${pad(i + 1)}</span></div>`).join('')}</div>${cap}`;
    const cards = [...fig.querySelectorAll('.card')];
    const count = fig.querySelector('.g-count');
    live.push({ fig, update() {
      const f = REDUCE ? 0 : (cfg.driver ? clamp01((sectionProgress(cfg.driver) - 0.55) / 0.4) : passing(fig, 0.72, 0.28)) * (n - 1);
      cards.forEach((c, i) => {
        const d = i - f;
        if (d < 0) {                         // 걷힌 카드: 위로 빠지며 사라짐
          const k = Math.min(1, -d);
          c.style.transform = `translate3d(0, ${-k * 38}%, 0) rotate(${-k * 5}deg)`;
          c.style.opacity = String(1 - k);
        } else {                             // 대기 카드: 뒤로 밀려 층을 이룸
          const k = Math.min(d, 3);
          c.style.transform = `translate3d(${k * 2.6}%, ${-k * 3.4}%, 0) scale(${1 - k * 0.04})`;   // 뒤 카드는 우상단으로 층층이 — 캡션을 가리지 않게
          c.style.opacity = String(1 - Math.max(0, d - 3));
          c.style.filter = `brightness(${1 - k * 0.22})`;
        }
      });
      count.textContent = `${pad(Math.min(n, Math.round(f) + 1))} / ${pad(n)}`;
    } });
    return;
  }

  if (mode === 'columns') {
    const dir = cfg.dir === -1 ? -1 : 1;
    fig.innerHTML = `<div class="g-frame col-frame"><div class="col-track">${items.map((s, i) => `<div class="col-item">${media(s)}<span class="mono card-no">${pad(i + 1)}</span></div>`).join('')}</div></div>${cap}`;
    const frame = fig.querySelector('.col-frame');
    const track = fig.querySelector('.col-track');
    const count = fig.querySelector('.g-count');
    live.push({ fig, update() {
      const p = REDUCE ? 0 : passing(fig, 1, 0);
      const travel = Math.max(0, track.offsetHeight - frame.offsetHeight);
      const q = dir === 1 ? p : 1 - p;
      track.style.transform = `translate3d(0, ${-q * travel}px, 0)`;
      count.textContent = `${pad(Math.min(n, Math.floor(q * n * 0.999) + 1))} / ${pad(n)}`;
    } });
    return;
  }

  if (mode === 'reveal') {
    fig.innerHTML = `<div class="rv-sticky"><div class="g-frame rv-frame">${items.map((s, i) => `<div class="rv-layer" style="z-index:${i + 1}">${media(s)}</div>`).join('')}
        <div class="rv-hud mono"><span class="g-count">01 / ${pad(n)}</span><i class="rv-bar"><b></b></i></div></div>${cap.replace('g-count', 'g-count-cap')}</div>`;
    const layers = [...fig.querySelectorAll('.rv-layer')];
    const sticky = fig.querySelector('.rv-sticky');
    const count = fig.querySelector('.g-count');
    const bar = fig.querySelector('.rv-bar b');
    const capCount = fig.querySelector('.g-count-cap');
    live.push({ fig, update() {
      const p = REDUCE ? 1 : clamp01(pinned(fig, sticky) / (1 - (cfg.hold || 0)));   // hold: 마지막 장에서 머무는 구간
      const s = p * n;
      layers.forEach((L, i) => {
        const e = ease(clamp01(s - i));
        const m = L.firstElementChild;
        if (i === 0) {
          const open = REDUCE ? 1 : Math.max(0.06, e);
          L.style.clipPath = `inset(${(1 - open) * 50}% 0 ${(1 - open) * 50}% 0)`;
        } else {
          L.style.clipPath = `inset(${(1 - e) * 100}% 0 0 0)`;
        }
        m.style.transform = `scale(${1.16 - 0.16 * e})`;
      });
      count.textContent = `${pad(Math.min(n, Math.floor(s * 0.999) + 1))} / ${pad(n)}`;
      if (capCount) capCount.textContent = count.textContent;
      bar.style.transform = `scaleX(${p})`;
    } });
    return;
  }

  // rail
  fig.innerHTML = `<div class="rail-sticky"><div class="rail-track">${items.map((s, i) => `<div class="rail-item"><div class="g-frame">${media(s)}</div><span class="mono rail-no">${pad(i + 1)} / ${pad(n)}</span></div>`).join('')}</div>${cap}</div>`;
  const sticky = fig.querySelector('.rail-sticky');
  const track = fig.querySelector('.rail-track');
  const count = fig.querySelector('.g-count');
  live.push({ fig, update() {
    const p = REDUCE ? 0 : pinned(fig, sticky);
    const travel = Math.max(0, track.scrollWidth - sticky.clientWidth);
    track.style.transform = `translate3d(${-p * travel}px, 0, 0)`;
    count.textContent = `${pad(Math.min(n, Math.floor(p * n * 0.999) + 1))} / ${pad(n)}`;
  } });
}

export function updateGalleries() {
  for (let i = live.length - 1; i >= 0; i--) {
    const g = live[i];
    if (!g.fig.isConnected) { live.splice(i, 1); continue; }
    const r = g.fig.getBoundingClientRect();
    if (r.bottom < -innerHeight * 0.2 || r.top > innerHeight * 1.2) continue;
    g.update();
  }
}

/* 유튜브가 실제로 재생될 때만 유튜브를 보이고, 막히면(보안 정책·회사망·퍼가기 제한) 사이트 안 영상을 그대로 둔다 */
addEventListener('message', (e) => {
  if (!/youtube/.test(e.origin || '')) return;
  let d = e.data; try { d = typeof d === 'string' ? JSON.parse(d) : d; } catch { return; }
  const st = d && d.info && d.info.playerState;
  if (st !== 1) return;                                   // 1 = 재생 중
  document.querySelectorAll('.g-yt-embed iframe').forEach((f) => {
    if (f.contentWindow === e.source) {
      const box = f.closest('.g-yt-embed'); box.classList.add('yt-on');
      const v = box.querySelector('.yt-fallback'); if (v) v.pause();
    }
  });
});
function pingYT() {
  document.querySelectorAll('.g-yt-embed:not(.yt-on) iframe').forEach((f) => {
    try { f.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*'); } catch {}
  });
}
setInterval(pingYT, 700);
