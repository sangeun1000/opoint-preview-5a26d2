import * as THREE from 'three';

/* 원통 갤러리(Quintin Lodge 방식) — 이미지를 가로축 원통에 감아 스크롤로 굴린다.
   한 WebGL 캔버스에서 요소마다 scissor로 그려 컨텍스트를 하나만 쓴다. */

const VERT = /* glsl */`
  varying vec2 vUv;
  varying float vFace;
  void main() {
    vUv = uv;
    vec3 n = normalize(mat3(modelMatrix) * normal);
    vFace = clamp(n.z, 0.0, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  }`;
const FRAG = /* glsl */`
  uniform sampler2D map;
  uniform vec2 uRepeat;
  uniform vec2 uOffset;
  uniform vec3 uBg;
  uniform float uLoaded;
  varying vec2 vUv;
  varying float vFace;
  void main() {
    vec3 tex = texture2D(map, vUv * uRepeat + uOffset).rgb;
    vec3 c = mix(vec3(0.06), tex, uLoaded);
    float s = smoothstep(0.1, 0.985, vFace);
    gl_FragColor = vec4(mix(uBg, c, 0.08 + 0.92 * s), 1.0);
    #include <colorspace_fragment>
  }`;

const isVideo = (s) => /\.(mp4|webm|mov)(\?|$)/i.test(s);
const loader = new THREE.TextureLoader();

class Drum {
  constructor(el, items, ratio, bg) {
    this.el = el;
    this.items = items.length ? items : [''];
    this.ratio = ratio;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(26, 1, 0.01, 50);
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.bg = bg;
    this.alpha = 0;
    this.aspect = 0;
    this.meshes = [];
    this.videos = [];
    this.textures = this.items.map((src, i) => this.load(src, i));
  }

  load(src, i) {
    const u = { map: { value: null }, uRepeat: { value: new THREE.Vector2(1, 1) }, uOffset: { value: new THREE.Vector2() }, uBg: { value: this.bg }, uLoaded: { value: 0 } };
    const fit = (tw, th) => {
      const ta = tw / th, pa = this.ratio;
      if (ta > pa) { u.uRepeat.value.set(pa / ta, 1); u.uOffset.value.set((1 - pa / ta) / 2, 0); }
      else { u.uRepeat.value.set(1, ta / pa); u.uOffset.value.set(0, (1 - ta / pa) / 2); }
      u.uLoaded.value = 1;
    };
    if (!src) return u;
    if (isVideo(src)) {
      const v = Object.assign(document.createElement('video'), { src, muted: true, loop: true, playsInline: true, crossOrigin: 'anonymous', preload: 'auto' });
      v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('autoplay', '');
      // 사파리 등은 DOM 밖 영상의 프레임을 넘겨주지 않는다 → 화면 안에 거의 보이지 않게 붙여 둔다
      v.style.cssText = 'position:absolute;left:0;top:0;width:2px;height:2px;opacity:0.01;pointer-events:none;';
      this.el.appendChild(v);
      v.addEventListener('loadeddata', () => fit(v.videoWidth, v.videoHeight));
      const t = new THREE.VideoTexture(v); t.colorSpace = THREE.SRGBColorSpace;
      u.map.value = t; this.videos.push(v); this.vtex = (this.vtex || []).concat(t);
      return u;
    }
    loader.load(src, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; u.map.value = t; fit(t.image.width, t.image.height); });
    return u;
  }

  build(aspect) {
    this.aspect = aspect;
    this.meshes.forEach((m) => { m.geometry.dispose(); m.material.dispose(); this.group.remove(m); });
    this.meshes = [];
    // 컨테이너 높이 = 월드 1, 카메라는 정면 판이 폭을 채우도록
    const fov = THREE.MathUtils.degToRad(this.camera.fov);
    const d = 0.5 / Math.tan(fov / 2);
    this.camera.position.set(0, 0, d);
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    const pw = aspect * 0.9;
    const ph = pw / this.ratio;
    const R = ph * 1.18;
    this.step = (ph * 1.05) / R;
    this.group.position.z = -R;
    this.items.forEach((_, i) => {
      const g = new THREE.PlaneGeometry(pw, ph, 1, 48);
      const pos = g.attributes.position, nor = g.attributes.normal;
      const base = -i * this.step;
      for (let k = 0; k < pos.count; k++) {
        const th = base + pos.getY(k) / R;
        pos.setXYZ(k, pos.getX(k), R * Math.sin(th), R * Math.cos(th));
        nor.setXYZ(k, 0, Math.sin(th), Math.cos(th));
      }
      const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: this.textures[i], toneMapped: false });
      const mesh = new THREE.Mesh(g, mat);
      this.group.add(mesh);
      this.meshes.push(mesh);
    });
  }

  dispose() {
    this.meshes.forEach((m) => { m.geometry.dispose(); m.material.dispose(); });
    this.textures.forEach((u) => u.map.value?.dispose());
    this.videos.forEach((v) => { v.pause(); v.removeAttribute('src'); v.load(); v.remove(); });
  }
}

export class Drums {
  constructor(renderer, bgHex) {
    this.renderer = renderer;
    this.bg = new THREE.Color(bgHex);
    this.list = new Map();
  }

  mount(el, items, ratio) {
    this.list.get(el)?.dispose();
    this.list.set(el, new Drum(el, items, ratio, this.bg));
  }

  /** 뷰포트에 걸친 원통만 그린다. W,H = CSS px */
  render(W, H, reduce, t) {
    const r = this.renderer;
    for (const drum of [...this.list.values()]) {
      if (!drum.el.isConnected) { drum.dispose(); this.list.delete(drum.el); continue; }   // 교체된 피처 등
      const rect = drum.el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > H || rect.width < 2) {
        drum.videos.forEach((v) => !v.paused && v.pause());
        continue;
      }
      drum.videos.forEach((v) => v.paused && v.play().catch(() => {}));
      (drum.vtex || []).forEach((t) => { if (t.image && t.image.readyState >= 2) t.needsUpdate = true; });
      const aspect = rect.width / rect.height;
      if (Math.abs(aspect - drum.aspect) > 0.002) drum.build(aspect);
      // 요소가 화면 아래→위로 지나는 동안 첫 장→마지막 장이 정면을 지난다
      const p = THREE.MathUtils.clamp((H - rect.top) / (H + rect.height), 0, 1);
      const n = drum.items.length;
      const target = -THREE.MathUtils.lerp(-0.35, n - 1 + 0.35, p) * drum.step;
      drum.alpha += (target - drum.alpha) * (reduce ? 1 : 0.1);
      drum.group.rotation.x = drum.alpha + (reduce ? 0 : Math.sin(t * 0.4) * 0.006);
      r.setViewport(rect.left, H - rect.bottom, rect.width, rect.height);
      r.setScissor(rect.left, H - rect.bottom, rect.width, rect.height);
      r.setScissorTest(true);
      r.render(drum.scene, drum.camera);
    }
    r.setScissorTest(false);
    r.setViewport(0, 0, W, H);
  }
}

// 저전력 모드 등으로 자동재생이 막힌 경우 — 첫 터치·클릭·스크롤 키 입력 때 원통 영상을 다시 재생
const kick = () => document.querySelectorAll('.drum-stage video').forEach((v) => v.paused && v.play().catch(() => {}));
['pointerdown', 'touchstart', 'keydown', 'wheel'].forEach((ev) => addEventListener(ev, kick, { passive: true, capture: true }));
