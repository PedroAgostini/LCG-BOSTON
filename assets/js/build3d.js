/* =========================================================
   LCG Boston, "From bare lot to final walkthrough"
   Procedural New England colonial with a side addition,
   assembled by scroll progress (0 to 1).
   ========================================================= */
import * as THREE from 'three';

/* Stage starts on the 0..1 timeline. Kept in sync with the copy in index.html */
export const STAGES = [0, 0.14, 0.30, 0.52, 0.72, 0.88];

const COL = {
  bg: 0x15181b,
  ground: 0x121518,
  earth: 0x3a322a,
  lawn: 0x2b3a2e,
  concrete: 0xa3a39e,
  wood: 0xcfa679,
  trim: 0xf5f3ef,
  glass: 0x1d242a,
  door: 0xc0976f,
  shutter: 0x2f353a,
  brick: 0x75604f,
  leaf: 0x46574a,
  leaf2: 0x5b6d55,
  trunk: 0x5b4637,
  stone: 0x8b8b86,
  tan: 0xc0976f,
};

/* ---------- math helpers ---------- */
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const range = (p, a, b) => clamp01((p - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeBack = (t) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

/* ---------- house dimensions (meters) ---------- */
const T = 0.2;                 // wall thickness
const F = 0.6;                 // foundation top
const H1 = 2.9, DECK = 0.25, H2 = 2.9;
const Y1 = F, Y2 = F + H1 + DECK, E = Y2 + H2;   // floor 1, floor 2, eave
const R = 2.6;                 // main roof rise
const X0 = -5, X1 = 5, Z0 = -3.5, Z1 = 3.5;      // main footprint
const AX0 = 5, AX1 = 9.6, AZ0 = -2.5, AZ1 = 3.0; // addition footprint
const AH = 3.0, AR = 1.6;      // addition wall height, roof rise
const AXC = (AX0 + AX1) / 2;   // addition ridge x
const OV = 0.4;                // roof overhang

/* ---------- procedural textures ---------- */
function sidingTexture() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 256;
  const g = c.getContext('2d');
  const boards = 5, bh = c.height / boards;
  for (let i = 0; i < boards; i++) {
    const y = i * bh;
    const grd = g.createLinearGradient(0, y, 0, y + bh);
    grd.addColorStop(0, '#f1eee9');
    grd.addColorStop(0.85, '#e2ded7');
    grd.addColorStop(1, '#c9c4bc');
    g.fillStyle = grd;
    g.fillRect(0, y, c.width, bh);
    g.fillStyle = '#b3aea6';
    g.fillRect(0, y + bh - 3, c.width, 3);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function shingleTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#2b3035';
  g.fillRect(0, 0, 256, 256);
  const rows = 8, rh = 256 / rows, sw = 32;
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * sw / 2;
    for (let x = -sw; x < 256 + sw; x += sw) {
      const v = 38 + Math.floor(rnd() * 14);
      g.fillStyle = `rgb(${v},${v + 4},${v + 9})`;
      g.fillRect(x + off + 1, r * rh + 1, sw - 2, rh - 3);
    }
    g.fillStyle = '#1c2024';
    g.fillRect(0, r * rh + rh - 3, 256, 3);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/* =========================================================
   Scene factory
   ========================================================= */
export function createBuildScene(canvas) {
  const isSmall = window.matchMedia('(max-width: 860px)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COL.bg);
  scene.fog = new THREE.Fog(COL.bg, 48, 95);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.5, 200);
  const target = new THREE.Vector3();

  /* ---------- lights ---------- */
  const hemi = new THREE.HemisphereLight(0xe4e9ef, 0x3b342e, 1.0);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff0dc, 2.5);
  sun.position.set(-14, 24, 17);
  sun.castShadow = true;
  sun.shadow.mapSize.set(isSmall ? 1024 : 2048, isSmall ? 1024 : 2048);
  const sc = sun.shadow.camera;
  sc.left = -18; sc.right = 18; sc.top = 18; sc.bottom = -18; sc.near = 1; sc.far = 70;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  sun.target.position.set(2, 0, 0);
  scene.add(sun, sun.target);

  const sunDay = new THREE.Color(0xfff0dc), sunDusk = new THREE.Color(0x8fa6cf);

  const porchLights = [];
  [[-2.4, 1.4, 6.2], [2.4, 1.4, 6.2], [7.3, 1.2, 5.4]].forEach(([x, y, z]) => {
    const l = new THREE.PointLight(0xffb36b, 0, 9, 1.8);
    l.position.set(x, y, z);
    scene.add(l);
    porchLights.push(l);
  });

  /* ---------- materials ---------- */
  const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.86, metalness: 0, ...extra });
  const sidingTex = sidingTexture();
  const shingleTex = shingleTexture();
  const shingleTexAdd = shingleTex.clone();
  shingleTexAdd.center.set(0.5, 0.5);
  shingleTexAdd.rotation = Math.PI / 2;
  shingleTexAdd.repeat.set(2.6, 1.3);
  shingleTexAdd.needsUpdate = true;
  shingleTex.repeat.set(4.6, 2.0);

  const M = {
    ground: std(COL.ground, { roughness: 1 }),
    lot: std(COL.earth, { roughness: 1 }),
    concrete: std(COL.concrete, { roughness: 0.95 }),
    wood: std(COL.wood, { roughness: 0.75 }),
    siding: std(0xffffff, { map: sidingTex }),
    reveal: std(COL.trim),
    trim: std(COL.trim, { roughness: 0.6 }),
    roofMain: std(0xffffff, { map: shingleTex, roughness: 0.9 }),
    roofAdd: std(0xffffff, { map: shingleTexAdd, roughness: 0.9 }),
    ridge: std(0x24282c),
    glass: std(COL.glass, { roughness: 0.15, metalness: 0.4, emissive: 0xffb062, emissiveIntensity: 0 }),
    door: std(COL.door, { roughness: 0.55 }),
    shutter: std(COL.shutter, { roughness: 0.7 }),
    brick: std(COL.brick, { roughness: 0.95 }),
    leaf: std(COL.leaf, { flatShading: true }),
    leaf2: std(COL.leaf2, { flatShading: true }),
    trunk: std(COL.trunk),
    stone: std(COL.stone, { roughness: 1 }),
    tan: std(COL.tan, { roughness: 0.6 }),
    lamp: std(0x2a2a2a, { emissive: 0xffc27f, emissiveIntensity: 0 }),
  };

  const earthCol = new THREE.Color(COL.earth), lawnCol = new THREE.Color(COL.lawn);

  /* ---------- animation registry ---------- */
  const anims = [];
  const anim = (obj, t0, t1, type, opts = {}) => {
    anims.push({ obj, t0, t1, type, out: opts.out, h: opts.h ?? 5, base: obj.position.clone(), bscale: obj.scale.clone() });
    return obj;
  };

  const root = new THREE.Group();
  scene.add(root);

  const mesh = (geo, mat, { cast = true, receive = true } = {}) => {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = cast; m.receiveShadow = receive;
    return m;
  };
  /* box anchored at its bottom face, so scale.y "rises" from the ground */
  const boxB = (w, h, d, mat) => {
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(0, h / 2, 0);
    return mesh(g, mat);
  };
  const box = (w, h, d, mat) => mesh(new THREE.BoxGeometry(w, h, d), mat);
  const shadowAll = (g) => g.traverse((c) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });

  /* =========================================================
     SITE: ground, lot, survey grid, stakes and string lines
     ========================================================= */
  const ground = mesh(new THREE.CircleGeometry(90, 64), M.ground, { cast: false });
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.13;
  root.add(ground);

  const lot = mesh(new THREE.BoxGeometry(30, 0.12, 24), M.lot, { cast: false });
  lot.position.set(2.3, -0.06, 0.5);
  root.add(lot);

  const lotEdgePts = [[-12.7, -11.5], [17.3, -11.5], [17.3, 12.5], [-12.7, 12.5]].map(([x, z]) => new THREE.Vector3(x, 0.01, z));
  const lotEdge = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(lotEdgePts), new THREE.LineBasicMaterial({ color: COL.tan, transparent: true, opacity: 0.7 }));
  root.add(lotEdge);

  const grid = new THREE.GridHelper(24, 24, COL.tan, COL.tan);
  grid.material.transparent = true;
  grid.material.opacity = 0;
  grid.material.depthWrite = false;
  grid.position.set(2.3, 0.012, 0.25);
  root.add(grid);

  // stakes and string lines around both footprints
  const outline = [
    [[X0 - 0.3, Z1 + 0.3], [X1 + 0.3, Z1 + 0.3], [X1 + 0.3, Z0 - 0.3], [X0 - 0.3, Z0 - 0.3]],
    [[AX0, AZ1 + 0.3], [AX1 + 0.3, AZ1 + 0.3], [AX1 + 0.3, AZ0 - 0.3], [AX0, AZ0 - 0.3]],
  ];
  outline.forEach((pts, oi) => {
    pts.forEach(([x, z], i) => {
      const s = boxB(0.09, 0.75, 0.09, M.tan);
      s.position.set(x, 0, z);
      root.add(anim(s, 0.02 + oi * 0.02 + i * 0.008, 0.06 + oi * 0.02 + i * 0.008, 'rise', { out: [0.2, 0.24] }));
      if (oi === 1 && i === 3) return; // this edge sits on the main wall
      const [nx, nz] = pts[(i + 1) % pts.length];
      const len = Math.hypot(nx - x, nz - z);
      const g = new THREE.BoxGeometry(len, 0.02, 0.02);
      g.translate(len / 2, 0, 0);
      const str = mesh(g, M.trim, { cast: false });
      str.position.set(x, 0.58, z);
      str.rotation.y = -Math.atan2(nz - z, nx - x);
      root.add(anim(str, 0.06 + oi * 0.02 + i * 0.01, 0.11 + oi * 0.02 + i * 0.01, 'stretchX', { out: [0.2, 0.24] }));
    });
  });

  /* =========================================================
     FOUNDATION
     ========================================================= */
  const fMain = boxB(X1 - X0 + 0.2, F, Z1 - Z0 + 0.2, M.concrete);
  root.add(anim(fMain, 0.15, 0.23, 'rise'));

  const fAdd = boxB(AX1 - AX0 + 0.1, F, AZ1 - AZ0 + 0.2, M.concrete);
  fAdd.position.set(AXC + 0.05, 0, (AZ0 + AZ1) / 2);
  root.add(anim(fAdd, 0.19, 0.26, 'rise'));

  const landing = boxB(2.6, F, 1.2, M.concrete);
  landing.position.set(0, 0, Z1 + 0.6);
  root.add(anim(landing, 0.23, 0.28, 'rise'));
  const step = boxB(2.6, F / 2, 0.55, M.concrete);
  step.position.set(0, 0, Z1 + 1.47);
  root.add(anim(step, 0.25, 0.29, 'rise'));

  /* =========================================================
     WALL SPECS and OPENINGS (shared by framing, walls, windows)
     n = outward normal, a0..a1 = span along the wall axis
     ========================================================= */
  const W = [
    { id: 'f1', n: '+z', a0: X0, a1: X1, outer: Z1, yb: Y1, h: H1, ph: 0 },
    { id: 'b1', n: '-z', a0: X0, a1: X1, outer: Z0, yb: Y1, h: H1, ph: 0.012 },
    { id: 'l1', n: '-x', a0: Z0 + T, a1: Z1 - T, outer: X0, yb: Y1, h: H1, ph: 0.006 },
    { id: 'r1', n: '+x', a0: Z0 + T, a1: Z1 - T, outer: X1, yb: Y1, h: H1, ph: 0.018 },
    { id: 'f2', n: '+z', a0: X0, a1: X1, outer: Z1, yb: Y2, h: H2, ph: 0.05 },
    { id: 'b2', n: '-z', a0: X0, a1: X1, outer: Z0, yb: Y2, h: H2, ph: 0.062 },
    { id: 'l2', n: '-x', a0: Z0 + T, a1: Z1 - T, outer: X0, yb: Y2, h: H2, ph: 0.056 },
    { id: 'r2', n: '+x', a0: Z0 + T, a1: Z1 - T, outer: X1, yb: Y2, h: H2, ph: 0.068 },
    { id: 'af', n: '+z', a0: AX0, a1: AX1, outer: AZ1, yb: Y1, h: AH, ph: 0.03 },
    { id: 'ar', n: '+x', a0: AZ0 + T, a1: AZ1 - T, outer: AX1, yb: Y1, h: AH, ph: 0.036 },
    { id: 'ab', n: '-z', a0: AX0, a1: AX1, outer: AZ0, yb: Y1, h: AH, ph: 0.042 },
  ];

  const win = (wall, c, y, w = 0.95, h = 1.5, extra = {}) => ({ wall, c, y, w, h, kind: 'win', ...extra });
  const W1 = Y1 + 0.9, W2 = Y2 + 0.8;
  const OPEN = [
    win('f1', -3.3, W1, 0.95, 1.5, { shut: true }), win('f1', -1.7, W1, 0.95, 1.5, { shut: true }),
    win('f1', 1.7, W1, 0.95, 1.5, { shut: true }), win('f1', 3.3, W1, 0.95, 1.5, { shut: true }),
    { wall: 'f1', c: 0, y: Y1, w: 1.1, h: 2.3, kind: 'door' },
    win('f2', -3.3, W2, 0.95, 1.5, { shut: true }), win('f2', -1.7, W2, 0.95, 1.5, { shut: true }),
    win('f2', 0, W2, 0.95, 1.5, { shut: true }), win('f2', 1.7, W2, 0.95, 1.5, { shut: true }),
    win('f2', 3.3, W2, 0.95, 1.5, { shut: true }),
    win('b1', -3, W1), win('b1', 0, W1), win('b1', 3, W1),
    win('b2', -3, W2), win('b2', 0, W2), win('b2', 3, W2),
    win('l1', 1.2, W1), win('l1', -1.2, W1), win('l2', 1.2, W2), win('l2', -1.2, W2),
    win('r2', 1.2, W2), win('r2', -1.2, W2),
    win('af', 6.3, Y1 + 0.8, 1.1, 1.6), win('af', 8.3, Y1 + 0.8, 1.1, 1.6),
    win('ar', 0.25, Y1 + 0.9, 1.6, 1.4),
    win('ab', AXC, Y1 + 0.9, 1.0, 1.4),
  ];
  const openingsOf = (id) => OPEN.filter((o) => o.wall === id);

  // world point on the wall centerline at axis coordinate a and height y
  const lineCoord = (w) => (w.n[0] === '+' ? w.outer - T / 2 : w.outer + T / 2);
  const along = (w, a, y) => (w.n[1] === 'z' ? new THREE.Vector3(a, y, lineCoord(w)) : new THREE.Vector3(lineCoord(w), y, a));
  const axisDir = (w) => (w.n[1] === 'z' ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1));

  /* =========================================================
     FRAMING: one instanced mesh for every piece of lumber.
     Each piece grows from its start point along its direction.
     ========================================================= */
  const pieces = [];
  const UP = new THREE.Vector3(0, 1, 0);
  const lumber = (start, dir, len, s, t0, t1) => {
    const d = dir.clone().normalize();
    pieces.push({ p: start.clone(), q: new THREE.Quaternion().setFromUnitVectors(UP, d), len, s, t0, t1 });
  };

  const SP = 0.8; // stud spacing
  W.forEach((w) => {
    const isAdd = w.id[0] === 'a';
    const start = isAdd ? 0.33 : w.yb === Y1 ? 0.30 : 0.41;
    const span = 0.06;
    const ops = openingsOf(w.id);
    const ax = axisDir(w);

    // bottom and top plates
    lumber(along(w, w.a0, w.yb + 0.06), ax, w.a1 - w.a0, 0.12, start, start + 0.02);
    lumber(along(w, w.a0, w.yb + w.h - 0.06), ax, w.a1 - w.a0, 0.12, start + span, start + span + 0.02);

    // studs, skipping openings, plus king studs beside each opening
    const blocked = (a) => ops.some((o) => Math.abs(a - o.c) < o.w / 2 + 0.08);
    const positions = [];
    for (let a = w.a0 + 0.08; a <= w.a1 - 0.07; a += SP) if (!blocked(a)) positions.push(a);
    positions.push(w.a1 - 0.08);
    ops.forEach((o) => positions.push(o.c - o.w / 2 - 0.08, o.c + o.w / 2 + 0.08));
    positions.sort((a, b) => a - b);
    positions.forEach((a, i) => {
      const t0 = start + 0.01 + (i / positions.length) * span;
      lumber(along(w, a, w.yb + 0.12), UP, w.h - 0.24, 0.1, t0, t0 + 0.022);
    });

    // headers and sills
    ops.forEach((o, i) => {
      const t0 = start + span * 0.6 + i * 0.004;
      lumber(along(w, o.c - o.w / 2 - 0.12, o.y + o.h + 0.1), ax, o.w + 0.24, 0.16, t0, t0 + 0.02);
      if (o.kind === 'win') lumber(along(w, o.c - o.w / 2 - 0.04, o.y - 0.06), ax, o.w + 0.08, 0.1, t0, t0 + 0.02);
    });
  });

  // floor 2 joists (along z) and subfloor deck
  for (let x = X0 + 0.25, i = 0; x <= X1 - 0.2; x += 0.6, i++) {
    const t0 = 0.37 + i * 0.002;
    lumber(new THREE.Vector3(x, Y1 + H1 + 0.12, Z0 + T), new THREE.Vector3(0, 0, 1), Z1 - Z0 - 2 * T, 0.12, t0, t0 + 0.02);
  }
  const deck = box(X1 - X0, 0.06, Z1 - Z0, M.wood);
  deck.position.set(0, Y2 - 0.03, 0);
  root.add(anim(deck, 0.40, 0.43, 'drop', { h: 3 }));

  // main rafters (grow from eave to ridge) and ridge board
  const ridgeY = E + R;
  for (let x = X0 + 0.06, i = 0; x <= X1; x += SP, i++) {
    const t0 = 0.465 + i * 0.0035;
    [[Z1 - T / 2, -1], [Z0 + T / 2, 1]].forEach(([z, s]) => {
      const dir = new THREE.Vector3(0, R, s * Math.abs(z));
      lumber(new THREE.Vector3(x, E, z), dir, dir.length(), 0.1, t0, t0 + 0.022);
    });
  }
  lumber(new THREE.Vector3(X0, ridgeY, 0), new THREE.Vector3(1, 0, 0), X1 - X0, 0.16, 0.46, 0.48);

  // addition rafters (ridge along z)
  const aTop = Y1 + AH, aRidge = aTop + AR, aHalf = (AX1 - AX0) / 2;
  for (let z = AZ0 + 0.06, i = 0; z <= AZ1; z += SP, i++) {
    const t0 = 0.44 + i * 0.004;
    const dl = new THREE.Vector3(aHalf - T / 2, AR, 0);
    const dr = new THREE.Vector3(-(aHalf - T / 2), AR, 0);
    lumber(new THREE.Vector3(AX0 + T / 2, aTop, z), dl, dl.length(), 0.1, t0, t0 + 0.022);
    lumber(new THREE.Vector3(AX1 - T / 2, aTop, z), dr, dr.length(), 0.1, t0, t0 + 0.022);
  }
  lumber(new THREE.Vector3(AXC, aRidge, AZ0), new THREE.Vector3(0, 0, 1), AZ1 - AZ0, 0.14, 0.44, 0.46);

  const lumberGeo = new THREE.BoxGeometry(1, 1, 1);
  lumberGeo.translate(0, 0.5, 0);
  const lumberMesh = new THREE.InstancedMesh(lumberGeo, M.wood, pieces.length);
  lumberMesh.castShadow = true;
  lumberMesh.receiveShadow = true;
  lumberMesh.frustumCulled = false;
  root.add(lumberMesh);

  /* =========================================================
     ENVELOPE: walls with real openings, gables, roof
     ========================================================= */
  function wallGeometry(w, h, holes, shape) {
    const s = shape || new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(w, 0), new THREE.Vector2(w, h), new THREE.Vector2(0, h)]);
    holes.forEach((o) => {
      s.holes.push(new THREE.Path([
        new THREE.Vector2(o.x, o.y), new THREE.Vector2(o.x, o.y + o.h),
        new THREE.Vector2(o.x + o.w, o.y + o.h), new THREE.Vector2(o.x + o.w, o.y),
      ]));
    });
    return new THREE.ExtrudeGeometry(s, { depth: T, bevelEnabled: false });
  }

  // places an extruded wall (local x runs along the wall, local z points inward)
  function placeWall(m, w, yb) {
    switch (w.n) {
      case '+z': m.position.set(w.a0, yb, w.outer - T); break;
      case '-z': m.position.set(w.a0, yb, w.outer); break;
      case '-x': m.rotation.y = Math.PI / 2; m.position.set(w.outer, yb, w.a1); break;
      case '+x': m.rotation.y = -Math.PI / 2; m.position.set(w.outer, yb, w.a0); break;
    }
  }
  const localX = (w, a) => (w.n === '-x' ? w.a1 - a : a - w.a0);

  W.forEach((w) => {
    const holes = openingsOf(w.id).map((o) => ({ x: localX(w, o.c) - o.w / 2, y: o.y - w.yb, w: o.w, h: o.h }));
    // ground-floor siding also covers the floor deck band, so no gap shows between floors
    const wh = w.h + (w.yb === Y1 && w.id[0] !== 'a' ? DECK : 0);
    const m = mesh(wallGeometry(w.a1 - w.a0, wh, holes), [M.siding, M.reveal]);
    placeWall(m, w, w.yb);
    const t0 = 0.525 + w.ph;
    root.add(anim(m, t0, t0 + 0.045, 'drop', { h: 4.5 }));
  });

  // gable ends
  const tri = (base, rise) => new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(base, 0), new THREE.Vector2(base / 2, rise)]);
  const gL = mesh(wallGeometry(0, 0, [{ x: 3.5 - 0.3, y: 0.7, w: 0.6, h: 0.6 }], tri(Z1 - Z0, R)), [M.siding, M.reveal]);
  placeWall(gL, { n: '-x', outer: X0, a0: Z0, a1: Z1 }, E);
  const gR = mesh(wallGeometry(0, 0, [], tri(Z1 - Z0, R)), [M.siding, M.reveal]);
  placeWall(gR, { n: '+x', outer: X1, a0: Z0, a1: Z1 }, E);
  const gAF = mesh(wallGeometry(0, 0, [], tri(AX1 - AX0, AR)), [M.siding, M.reveal]);
  placeWall(gAF, { n: '+z', outer: AZ1, a0: AX0, a1: AX1 }, aTop);
  const gAB = mesh(wallGeometry(0, 0, [], tri(AX1 - AX0, AR)), [M.siding, M.reveal]);
  placeWall(gAB, { n: '-z', outer: AZ0, a0: AX0, a1: AX1 }, aTop);
  [[gL, 0.615], [gR, 0.625], [gAF, 0.6], [gAB, 0.605]].forEach(([g, t]) => root.add(anim(g, t, t + 0.04, 'drop', { h: 4 })));

  // main roof planes
  const run = (Z1 - Z0) / 2, slope = R / run, ang = Math.atan(slope), RT = 0.16;
  const spanZ = run + OV, L = Math.hypot(spanZ, spanZ * slope);
  [1, -1].forEach((s, i) => {
    const r = box(X1 - X0 + 0.7, RT, L, M.roofMain);
    const cz = s * spanZ / 2, cy = ridgeY - (spanZ / 2) * slope;
    r.position.set(0, cy + Math.cos(ang) * RT / 2, cz + s * Math.sin(ang) * RT / 2);
    r.rotation.x = s * ang;
    root.add(anim(r, 0.645 + i * 0.012, 0.69 + i * 0.012, 'drop', { h: 5 }));
  });
  const ridgeCap = box(X1 - X0 + 0.7, 0.14, 0.34, M.ridge);
  ridgeCap.position.set(0, ridgeY + 0.1, 0);
  root.add(anim(ridgeCap, 0.68, 0.71, 'drop', { h: 3 }));

  // addition roof planes
  const aSlope = AR / aHalf, aAng = Math.atan(aSlope), aSpan = aHalf + 0.35;
  const aL = Math.hypot(aSpan, aSpan * aSlope);
  [1, -1].forEach((s, i) => {
    const r = box(aL, RT, AZ1 - AZ0 + 0.6, M.roofAdd);
    const cx = AXC + s * aSpan / 2, cy = aRidge - (aSpan / 2) * aSlope;
    r.position.set(cx + s * Math.sin(aAng) * RT / 2, cy + Math.cos(aAng) * RT / 2, (AZ0 + AZ1) / 2);
    r.rotation.z = -s * aAng;
    root.add(anim(r, 0.665 + i * 0.01, 0.705 + i * 0.01, 'drop', { h: 4 }));
  });

  /* =========================================================
     FINISHES: windows, door, portico, trim, chimney, gutters
     ========================================================= */
  const faceRot = { '+z': 0, '-z': Math.PI, '+x': Math.PI / 2, '-x': -Math.PI / 2 };

  function windowGroup(o) {
    const g = new THREE.Group();
    const { w, h } = o;
    if (o.kind === 'door') {
      const d = box(w - 0.04, h - 0.02, 0.07, M.door);
      d.position.set(0, 0, -0.07);
      g.add(d);
      const knob = box(0.06, 0.06, 0.06, M.trim);
      knob.position.set(w / 2 - 0.18, -0.1, -0.01);
      g.add(knob);
    } else {
      const gl = box(w, h, 0.04, M.glass);
      gl.position.z = -T / 2;
      g.add(gl);
      const mv = box(0.04, h, 0.03, M.trim); mv.position.z = -T / 2 + 0.035; g.add(mv);
      const mh = box(w, 0.04, 0.03, M.trim); mh.position.z = -T / 2 + 0.035; g.add(mh);
      const sill = box(w + 0.34, 0.07, 0.16, M.trim);
      sill.position.set(0, -h / 2 - 0.035, 0.06);
      g.add(sill);
    }
    const top = box(w + 0.26, 0.14, 0.08, M.trim); top.position.set(0, h / 2 + 0.07, 0.04); g.add(top);
    [-1, 1].forEach((s) => {
      const side = box(0.12, h, 0.08, M.trim);
      side.position.set(s * (w / 2 + 0.06), 0, 0.04);
      g.add(side);
      if (o.shut) {
        const sh = box(w * 0.48, h, 0.04, M.shutter);
        sh.position.set(s * (w / 2 + 0.14 + w * 0.24), 0, 0.03);
        g.add(sh);
      }
    });
    shadowAll(g);
    return g;
  }

  OPEN.forEach((o, i) => {
    const w = W.find((x) => x.id === o.wall);
    const g = windowGroup(o);
    const cy = o.y + o.h / 2;
    if (w.n[1] === 'z') g.position.set(o.c, cy, w.outer);
    else g.position.set(w.outer, cy, o.c);
    g.rotation.y = faceRot[w.n];
    const t0 = 0.725 + (i / OPEN.length) * 0.06;
    root.add(anim(g, t0, t0 + 0.025, 'pop'));
  });

  // portico over the front door
  const portico = new THREE.Group();
  [-0.95, 0.95].forEach((x) => {
    const col = boxB(0.16, 2.55, 0.16, M.trim);
    col.position.set(x, F, Z1 + 1.05);
    portico.add(col);
  });
  const pRoof = box(2.5, 0.14, 1.35, M.trim);
  pRoof.position.set(0, F + 2.62, Z1 + 0.62);
  portico.add(pRoof);
  const pCap = box(2.6, 0.06, 1.45, M.ridge);
  pCap.position.set(0, F + 2.72, Z1 + 0.62);
  portico.add(pCap);
  shadowAll(portico);
  root.add(anim(portico, 0.76, 0.8, 'drop', { h: 3 }));

  // corner boards and band trim
  const corners = [[X0, Z1, E - F], [X1, Z1, E - F], [X0, Z0, E - F], [X1, Z0, E - F], [AX1, AZ1, AH], [AX1, AZ0, AH]];
  corners.forEach(([x, z, h], i) => {
    const c = boxB(0.24, h, 0.24, M.trim);
    c.position.set(x, F, z);
    root.add(anim(c, 0.73 + i * 0.005, 0.77 + i * 0.005, 'rise'));
  });
  [Z1 + 0.04, Z0 - 0.04].forEach((z, i) => {
    const sk = box(X1 - X0 + 0.2, 0.24, 0.08, M.trim);
    sk.position.set(0, F + 0.12, z);
    root.add(anim(sk, 0.75 + i * 0.01, 0.79 + i * 0.01, 'stretchX'));
    const fr = box(X1 - X0 + 0.1, 0.26, 0.08, M.trim);
    fr.position.set(0, E - 0.13, z);
    root.add(anim(fr, 0.76 + i * 0.01, 0.8 + i * 0.01, 'stretchX'));
  });

  // chimney on the left gable
  const chim = boxB(1.0, ridgeY + 1.0, 1.15, M.brick);
  chim.position.set(X0 - 0.5, 0, 0);
  root.add(anim(chim, 0.745, 0.8, 'rise'));
  const chimCap = box(1.2, 0.12, 1.35, M.concrete);
  chimCap.position.set(X0 - 0.5, ridgeY + 1.06, 0);
  root.add(anim(chimCap, 0.79, 0.81, 'pop'));

  // gutters and downspouts
  const eaveY = E - OV * slope - 0.08;
  [1, -1].forEach((s, i) => {
    const gu = box(X1 - X0 + 0.7, 0.14, 0.16, M.trim);
    gu.position.set(0, eaveY, s * (run + OV + 0.05));
    root.add(anim(gu, 0.79 + i * 0.01, 0.83 + i * 0.01, 'stretchX'));
    const ds = boxB(0.1, eaveY - 0.1, 0.1, M.trim);
    ds.position.set(X0 + 0.25, 0.1, s * (run + 0.12));
    root.add(anim(ds, 0.81 + i * 0.01, 0.84 + i * 0.01, 'rise'));
  });

  /* =========================================================
     WALKTHROUGH: walkway, lamps, shrubs, trees, lights on
     ========================================================= */
  for (let i = 0; i < 7; i++) {
    const st = box(1.3, 0.05, 0.62, M.stone);
    st.position.set(0, 0.025, Z1 + 2.15 + i * 0.95);
    root.add(anim(st, 0.8 + i * 0.006, 0.83 + i * 0.006, 'pop'));
  }
  [[-1.15, Z1 + 4.4], [1.15, Z1 + 4.4], [-1.15, Z1 + 7.2], [1.15, Z1 + 7.2]].forEach(([x, z], i) => {
    const post = boxB(0.12, 0.7, 0.12, M.shutter);
    post.position.set(x, 0, z);
    const lamp = box(0.18, 0.14, 0.18, M.lamp);
    lamp.position.set(x, 0.77, z);
    root.add(anim(post, 0.83 + i * 0.006, 0.86 + i * 0.006, 'rise'));
    root.add(anim(lamp, 0.85 + i * 0.006, 0.87 + i * 0.006, 'pop'));
  });

  const shrubGeo = new THREE.IcosahedronGeometry(0.5, 0);
  [[-4.2, Z1 + 0.55], [-2.7, Z1 + 0.5], [2.7, Z1 + 0.5], [4.2, Z1 + 0.55], [6.2, AZ1 + 0.5], [8.4, AZ1 + 0.5], [-5.9, 1.6]].forEach(([x, z], i) => {
    const s = mesh(shrubGeo, i % 2 ? M.leaf : M.leaf2);
    s.position.set(x, 0.38, z);
    s.scale.set(1.1, 0.85, 1.1);
    s.rotation.y = i;
    root.add(anim(s, 0.84 + i * 0.006, 0.88 + i * 0.006, 'pop'));
  });

  function tree(x, z, h, kind) {
    const g = new THREE.Group();
    g.add(boxB(0.22, h * 0.46, 0.22, M.trunk)); // runs into the crown so it never floats
    if (kind === 'pine') {
      [[1.5, 0.3], [1.15, 0.52], [0.75, 0.72]].forEach(([r, y], i) => {
        const c = mesh(new THREE.ConeGeometry(r * h / 5, h * 0.42, 7), i % 2 ? M.leaf : M.leaf2);
        c.position.y = h * y;
        g.add(c);
      });
    } else {
      const c = mesh(new THREE.IcosahedronGeometry(h * 0.3, 0), M.leaf2);
      c.position.y = h * 0.6;
      c.scale.set(1, 1.15, 1);
      g.add(c);
    }
    shadowAll(g);
    g.position.set(x, 0, z);
    return g;
  }
  [[-9.5, 5.8, 5.4, 'pine'], [-10.4, -2.6, 6.8, 'pine'], [-7.8, -8.2, 5.2, 'round'], [13.4, -5.2, 6.2, 'pine'], [13.2, 5.6, 4.6, 'round'], [5.2, -9.4, 5.8, 'pine'], [-2.6, -9.6, 4.6, 'round']]
    .forEach(([x, z, h, k], i) => root.add(anim(tree(x, z, h, k), 0.855 + i * 0.008, 0.91 + i * 0.008, 'pop')));

  /* =========================================================
     Update / camera
     ========================================================= */
  const mat4 = new THREE.Matrix4();
  const vScale = new THREE.Vector3();

  function applyProgress(p) {
    for (const a of anims) {
      let e = range(p, a.t0, a.t1);
      if (a.out) e *= 1 - range(p, a.out[0], a.out[1]);
      const o = a.obj;
      o.visible = e > 0.0005;
      if (!o.visible) continue;
      switch (a.type) {
        case 'rise': o.scale.y = a.bscale.y * Math.max(easeOut(e), 0.0005); break;
        case 'drop': o.position.y = a.base.y + (1 - easeOut(e)) * a.h; break;
        case 'pop': o.scale.copy(a.bscale).multiplyScalar(Math.max(easeBack(e), 0.0005)); break;
        case 'stretchX': o.scale.x = a.bscale.x * Math.max(easeOut(e), 0.0005); break;
      }
    }

    for (let i = 0; i < pieces.length; i++) {
      const pc = pieces[i];
      const e = easeOut(range(p, pc.t0, pc.t1));
      if (e <= 0) vScale.set(0.0001, 0.0001, 0.0001);
      else vScale.set(pc.s, pc.len * e, pc.s);
      mat4.compose(pc.p, pc.q, vScale);
      lumberMesh.setMatrixAt(i, mat4);
    }
    lumberMesh.instanceMatrix.needsUpdate = true;

    // survey grid only during site and foundation
    grid.material.opacity = 0.32 * range(p, 0.0, 0.06) * (1 - range(p, 0.26, 0.36));
    grid.visible = grid.material.opacity > 0.001;

    // ground turns to lawn, daylight turns to dusk, lights come on
    lot.material.color.copy(earthCol).lerp(lawnCol, easeInOut(range(p, 0.82, 0.95)));
    const d = easeInOut(range(p, 0.87, 0.98));
    sun.intensity = lerp(2.5, 0.42, d);
    sun.color.copy(sunDay).lerp(sunDusk, d);
    hemi.intensity = lerp(1.0, 0.34, d);
    M.glass.emissiveIntensity = lerp(0, 2.4, d);
    M.lamp.emissiveIntensity = lerp(0, 3, d);
    porchLights.forEach((l) => (l.intensity = lerp(0, 7, d)));
  }

  let fit = 1;
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };

  function placeCamera(p) {
    const k = easeInOut(p);
    const az = lerp(-0.9, 0.58, k) + ptr.x * 0.06;
    const r = lerp(43, 34, k) * fit;
    const h = lerp(24, 10, k) * (fit > 1 ? 1.05 : 1) + ptr.y * 0.7;
    target.set(2.3, lerp(1.4, 3.9, k), 0.2);
    camera.position.set(target.x + Math.sin(az) * r, h, target.z + Math.cos(az) * r);
    camera.lookAt(target);
  }

  /* ---------- loop ---------- */
  let target01 = 0, current = 0, active = false, raf = 0, dirty = true, last = 0;

  function resize() {
    const el = canvas.parentElement;
    const w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // portrait screens need the camera further back
    fit = camera.aspect < 1 ? lerp(1.0, 2.3, clamp01((1 - camera.aspect) / 0.55)) : camera.aspect < 1.3 ? 1.12 : 1;
    // wide screens: push the house right so the copy column stays clear
    if (camera.aspect > 1.15) camera.setViewOffset(w, h, -w * 0.09, 0, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    dirty = true;
    if (!active) { applyProgress(current); placeCamera(current); renderer.render(scene, camera); }
  }

  function frame(now) {
    raf = 0;
    if (!active) return;
    // frame-rate independent smoothing: same feel at 30, 60 or 120 fps
    const dt = Math.min(0.25, last ? (now - last) / 1000 : 1 / 60);
    last = now;
    const k = 1 - Math.exp(-dt * 5.5), kp = 1 - Math.exp(-dt * 3);
    const dp = target01 - current;
    current = Math.abs(dp) < 0.0002 ? target01 : current + dp * k;
    ptr.x += (ptr.tx - ptr.x) * kp;
    ptr.y += (ptr.ty - ptr.y) * kp;
    const moving = Math.abs(dp) > 0.0002 || Math.abs(ptr.tx - ptr.x) > 0.001 || Math.abs(ptr.ty - ptr.y) > 0.001;
    if (moving || dirty) {
      applyProgress(current);
      placeCamera(current);
      renderer.render(scene, camera);
      dirty = false;
    }
    raf = requestAnimationFrame(frame);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();

  return {
    setProgress(p) { target01 = clamp01(p); },
    jumpTo(p) {
      target01 = current = clamp01(p);
      applyProgress(current); placeCamera(current); renderer.render(scene, camera);
    },
    setPointer(x, y) { ptr.tx = x; ptr.ty = y; },
    setActive(on) {
      active = on;
      if (on && !raf) { dirty = true; last = 0; raf = requestAnimationFrame(frame); }
    },
    dispose() {
      active = false;
      ro.disconnect();
      renderer.dispose();
    },
  };
}
