/* =========================================================
   LCG Boston, service 3D viewer (popup)
   Six procedural "architectural models on a board", one per
   service. Built on open, assembled with a short timed intro,
   then orbitable. Same visual language as build3d.js.
   ========================================================= */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeBack = (t) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

/* ---------------- procedural textures ---------------- */
function rng(seed) { return () => ((seed = (seed * 9301 + 49297) % 233280) / 233280); }

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

function shade(hex, pct) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + (pct / 100) * 255)));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

const texPlanks = () => canvasTex(512, 512, (g, w, h) => {
  const r = rng(3), rows = 6, rh = h / rows;
  for (let i = 0; i < rows; i++) {
    let x = -r() * 220;
    while (x < w) {
      const len = 180 + r() * 240, v = r();
      g.fillStyle = `hsl(29, ${30 + v * 10}%, ${44 + v * 12}%)`;
      g.fillRect(x, i * rh, len, rh);
      g.fillStyle = 'rgba(45,28,16,.5)';
      g.fillRect(x, i * rh, 2, rh);
      x += len;
    }
    g.fillStyle = 'rgba(45,28,16,.55)';
    g.fillRect(0, i * rh + rh - 2, w, 2);
  }
  for (let k = 0; k < 180; k++) {
    g.strokeStyle = `rgba(60,36,20,${0.03 + r() * 0.06})`;
    g.beginPath();
    const y = r() * h;
    g.moveTo(0, y); g.lineTo(w, y + r() * 6 - 3); g.stroke();
  }
});

const texTiles = (base, grout, n, seed = 5) => canvasTex(512, 512, (g, w, h) => {
  const r = rng(seed), s = w / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    g.fillStyle = shade(base, (r() - 0.5) * 8);
    g.fillRect(i * s, j * s, s, s);
  }
  g.fillStyle = grout;
  for (let i = 0; i <= n; i++) { g.fillRect(i * s - 2, 0, 4, h); g.fillRect(0, i * s - 2, w, 4); }
});

const texSubway = () => canvasTex(512, 512, (g, w, h) => {
  const r = rng(11), rows = 12, rh = h / rows, tw = w / 4;
  for (let i = 0; i < rows; i++) {
    const off = (i % 2) * tw / 2;
    for (let x = -tw; x < w + tw; x += tw) {
      g.fillStyle = shade('#eeece7', (r() - 0.5) * 6);
      g.fillRect(x + off, i * rh, tw, rh);
    }
  }
  g.fillStyle = '#c9c5bd';
  for (let i = 0; i <= rows; i++) g.fillRect(0, i * rh - 1.5, w, 3);
  for (let i = 0; i < rows; i++) {
    const off = (i % 2) * tw / 2;
    for (let x = -tw; x < w + tw; x += tw) g.fillRect(x + off - 1.5, i * rh, 3, rh);
  }
});

const texSiding = () => canvasTex(64, 256, (g, w, h) => {
  const boards = 5, bh = h / boards;
  for (let i = 0; i < boards; i++) {
    const y = i * bh, grd = g.createLinearGradient(0, y, 0, y + bh);
    grd.addColorStop(0, '#f1eee9'); grd.addColorStop(0.85, '#e2ded7'); grd.addColorStop(1, '#c9c4bc');
    g.fillStyle = grd; g.fillRect(0, y, w, bh);
    g.fillStyle = '#b3aea6'; g.fillRect(0, y + bh - 3, w, 3);
  }
});

const texShingles = () => canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#2b3035'; g.fillRect(0, 0, w, h);
  const r = rng(7), rows = 8, rh = h / rows, sw = 32;
  for (let i = 0; i < rows; i++) {
    const off = (i % 2) * sw / 2;
    for (let x = -sw; x < w + sw; x += sw) {
      const v = 38 + Math.floor(r() * 14);
      g.fillStyle = `rgb(${v},${v + 4},${v + 9})`;
      g.fillRect(x + off + 1, i * rh + 1, sw - 2, rh - 3);
    }
    g.fillStyle = '#1c2024'; g.fillRect(0, i * rh + rh - 3, w, 3);
  }
});

/* ---------------- shared materials ---------------- */
function makeMaterials() {
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, ...o });
  return {
    plinth: std(0x1f2327, { roughness: 0.9 }),
    lawn: std(0x34463a, { roughness: 1 }),
    wall: std(0xe8e5df, { roughness: 0.95 }),
    slate: std(0x2c3338, { roughness: 0.55 }),
    quartz: std(0xf2f0eb, { roughness: 0.22 }),
    // matte "clay model" finishes, same as the How We Build scene (no env map needed)
    brass: std(0xc0976f, { metalness: 0.3, roughness: 0.45, side: THREE.DoubleSide }),
    steel: std(0xc3c7ca, { metalness: 0.25, roughness: 0.45 }),
    black: std(0x1c1f22, { roughness: 0.5 }),
    ceramic: std(0xf7f6f3, { roughness: 0.16, side: THREE.DoubleSide }),
    wood: std(0xa57b55, { roughness: 0.6 }),
    woodLight: std(0xcfa679, { roughness: 0.7 }),
    fabric: std(0x8d9196, { roughness: 1 }),
    fabricTan: std(0xc9b49a, { roughness: 1 }),
    rug: std(0x5f5246, { roughness: 1 }),
    leaf: std(0x4f6a4d, { flatShading: true }),
    leaf2: std(0x60775a, { flatShading: true }),
    trunk: std(0x5b4637),
    pot: std(0xd9d4cc, { roughness: 0.6 }),
    glass: std(0xd6e6ec, { roughness: 0.1, transparent: true, opacity: 0.24, depthWrite: false }),
    mirror: std(0xaebcc3, { metalness: 0.2, roughness: 0.15 }),
    bulb: std(0xfff1d6, { emissive: 0xffc98a, emissiveIntensity: 2.2 }),
    daylight: std(0xdfe9f1, { emissive: 0xcfe2f0, emissiveIntensity: 0.7 }),
    winGlass: std(0x1e252b, { roughness: 0.1, metalness: 0.5 }),
    winWarm: std(0x2a2f34, { emissive: 0xffb062, emissiveIntensity: 1.5 }),
    trim: std(0xf5f3ef, { roughness: 0.6 }),
    door: std(0xc0976f, { roughness: 0.5 }),
    concrete: std(0xa3a39e, { roughness: 0.95 }),
    stone: std(0x8b8b86, { roughness: 1 }),
    osb: std(0xc9a677, { roughness: 0.9 }),
    underlay: std(0x38475a, { roughness: 0.7 }),
    tan: std(0xc0976f, { roughness: 0.5 }),
    floorWood: std(0xffffff, { map: texPlanks(), roughness: 0.65 }),
    tileFloor: std(0xffffff, { map: texTiles('#cfccc6', '#a9a59e', 2), roughness: 0.4 }),
    tileDark: std(0xffffff, { map: texTiles('#55595d', '#3a3d40', 4, 9), roughness: 0.4 }),
    tileWall: std(0xffffff, { map: texSubway(), roughness: 0.3 }),
    siding: std(0xffffff, { map: texSiding() }),
    roof: std(0xffffff, { map: texShingles(), roughness: 0.9 }),
    edge: new THREE.LineBasicMaterial({ color: 0xc0976f, transparent: true, opacity: 0.9 }),
  };
}

/* ---------------- builder kit ---------------- */
function makeKit(root, anims, M) {
  const shadowed = (o) => { o.castShadow = true; o.receiveShadow = true; return o; };
  const scaleUV = (geo, su, sv) => {
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
    return geo;
  };
  /* box anchored at its bottom face; uv = texture tile size in meters [u, v] */
  const bx = (w, h, d, m, x = 0, y = 0, z = 0, uv) => {
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(0, h / 2, 0);
    if (uv) scaleUV(g, Math.max(w, d) / uv[0], (h < 0.1 ? d : h) / uv[1]);
    const o = shadowed(new THREE.Mesh(g, m));
    o.position.set(x, y, z);
    return o;
  };
  /* centered box */
  const cb = (w, h, d, m, x = 0, y = 0, z = 0) => {
    const o = shadowed(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m));
    o.position.set(x, y, z);
    return o;
  };
  /* cylinder anchored at its bottom */
  const cy = (r, h, m, x = 0, y = 0, z = 0, r2 = r, seg = 28) => {
    const g = new THREE.CylinderGeometry(r, r2, h, seg);
    g.translate(0, h / 2, 0);
    const o = shadowed(new THREE.Mesh(g, m));
    o.position.set(x, y, z);
    return o;
  };
  const grp = (...kids) => { const g = new THREE.Group(); kids.forEach((k) => g.add(k)); return g; };
  const at = (obj, x = 0, y = 0, z = 0, ry = 0) => { obj.position.set(x, y, z); obj.rotation.y = ry; return obj; };

  const add = (obj, delay = 0, type = 'pop', h = 2.5) => {
    root.add(obj);
    if (type !== 'none') anims.push({ obj, delay, type, h, dur: type === 'rise' ? 0.75 : 0.65, base: obj.position.clone(), bs: obj.scale.clone() });
    return obj;
  };

  /* dark model board with a bronze edge, like an architect's presentation model */
  // board top sits just below y=0 so floors and lawns never share a plane with it (no z-fighting)
  const plinth = (w, d, top) => {
    add(bx(w, 0.3, d, M.plinth, 0, -0.37, 0), 0, 'none');
    if (top) add(bx(w - 0.3, 0.07, d - 0.3, top, 0, -0.07, 0), 0, 'none');
    const pts = [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].map(([x, z]) => new THREE.Vector3(x, -0.068, z));
    add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), M.edge), 0, 'none');
  };

  /* window: glass, frame, sill and a cross mullion; centered on its origin, facing +z */
  const win = (w, h, glass = M.winGlass) => grp(
    cb(w, h, 0.04, glass),
    cb(w + 0.16, 0.08, 0.06, M.trim, 0, h / 2 + 0.04, 0.02),
    cb(w + 0.24, 0.06, 0.12, M.trim, 0, -h / 2 - 0.03, 0.05),
    cb(0.08, h, 0.06, M.trim, -w / 2 - 0.04, 0, 0.02),
    cb(0.08, h, 0.06, M.trim, w / 2 + 0.04, 0, 0.02),
    cb(0.03, h, 0.02, M.trim, 0, 0, 0.025),
    cb(w, 0.03, 0.02, M.trim, 0, 0, 0.025),
  );

  /* gable roof planes, ridge along x, origin at the eave line (wall top) */
  const gableRoof = (w, d, rise, mat = M.roof, ov = 0.35, t = 0.12) => {
    const g = new THREE.Group();
    const run = d / 2, slope = rise / run, ang = Math.atan(slope), span = run + ov, L = Math.hypot(span, span * slope);
    [1, -1].forEach((s) => {
      const geo = new THREE.BoxGeometry(w + 2 * ov, t, L);
      if (mat.map) scaleUV(geo, (w + 2 * ov) / 2.3, L / 2.4);
      const p = shadowed(new THREE.Mesh(geo, mat));
      p.position.set(0, rise - (span / 2) * slope + Math.cos(ang) * t / 2, s * span / 2 + s * Math.sin(ang) * t / 2);
      p.rotation.x = s * ang;
      g.add(p);
    });
    return g;
  };
  /* gable end triangles for a body of size w x d, origin at the eave line */
  const gableEnds = (w, d, rise, mat = M.siding) => {
    const g = new THREE.Group();
    const run = d / 2;
    const shape = new THREE.Shape([new THREE.Vector2(-run, 0), new THREE.Vector2(run, 0), new THREE.Vector2(0, rise)]);
    [-1, 1].forEach((s) => {
      const m = shadowed(new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false }), mat));
      m.rotation.y = Math.PI / 2;
      m.position.set(s === -1 ? -w / 2 : w / 2 - 0.1, 0, 0);
      g.add(m);
    });
    return g;
  };

  const ico = (r, m, x, y, z) => at(shadowed(new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), m)), x, y, z);
  const plant = (x, y, z, s = 1) => at(grp(
    blob(0.2 * s),
    cy(0.11 * s, 0.22 * s, M.pot, 0, 0, 0, 0.09 * s),
    ico(0.2 * s, M.leaf, 0, 0.36 * s, 0),
    ico(0.14 * s, M.leaf2, 0.1 * s, 0.5 * s, 0.04 * s),
  ), x, y, z);

  // soft contact shadow so trees and plants sit on the lawn
  const blobTex = canvasTex(128, 128, (g, w, h) => {
    const grd = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grd.addColorStop(0, 'rgba(0,0,0,.55)'); grd.addColorStop(0.6, 'rgba(0,0,0,.22)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
  });
  const blobMat = new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false });
  const blob = (r) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), blobMat);
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.006;
    m.renderOrder = 1;
    return m;
  };

  const tree = (x, z, h, kind = 'pine') => {
    // trunk runs up into the crown so the foliage never reads as floating
    const g = grp(blob(h * 0.22), cy(0.1, h * 0.52 + 0.08, M.trunk, 0, -0.08, 0, 0.13, 8));
    if (kind === 'pine') {
      [[1.4, 0.28], [1.05, 0.5], [0.7, 0.7]].forEach(([r, y], i) => {
        const c = shadowed(new THREE.Mesh(new THREE.ConeGeometry(r * h / 5, h * 0.42, 7), i % 2 ? M.leaf : M.leaf2));
        c.position.y = h * y; g.add(c);
      });
    } else {
      const c = ico(h * 0.28, M.leaf2, 0, h * 0.62, 0);
      c.scale.set(1, 1.15, 1); g.add(c);
    }
    return at(g, x, 0, z);
  };

  return { THREE, M, add, bx, cb, cy, grp, at, plinth, win, gableRoof, gableEnds, plant, tree, shadowed };
}

/* =========================================================
   Scenes
   ========================================================= */
const BUILDERS = {
  /* ---------- Kitchen: L run, waterfall island, stools, pendants ---------- */
  kitchen({ M, add, bx, cb, cy, grp, at, plinth, plant, shadowed, THREE }) {
    const W = 6, D = 5, H = 2.8, back = -D / 2, left = -W / 2;
    plinth(W + 0.9, D + 0.9);
    add(bx(W, 0.06, D, M.floorWood, 0, -0.06, 0, [1.2, 1.2]), 0, 'none');
    add(bx(W, H, 0.15, M.wall, 0, 0, back), 0.1, 'rise');
    add(bx(0.15, H, D, M.wall, left, 0, 0), 0.18, 'rise');
    add(at(grp(cb(1.5, 1.2, 0.04, M.daylight), cb(1.62, 0.08, 0.08, M.black, 0, 0.64, 0), cb(1.62, 0.08, 0.08, M.black, 0, -0.64, 0), cb(0.04, 1.2, 0.05, M.black)), 1.75, 1.55, back + 0.09), 0.5);

    // back run: cooktop and hood, open shelves, sink with gooseneck faucet
    const runW = 3.7, rx = left + 0.075 + runW / 2, rz = back + 0.4;
    add(bx(runW, 0.86, 0.62, M.slate, rx, 0, rz), 0.45, 'rise');
    add(bx(runW + 0.04, 0.05, 0.66, M.quartz, rx, 0.86, rz + 0.02), 0.75, 'drop');
    add(bx(runW, 0.62, 0.02, M.tileWall, rx, 0.91, back + 0.085, [1.2, 1.2]), 0.8, 'rise');
    add(bx(0.7, 0.015, 0.48, M.black, -2.05, 0.91, rz), 0.95);
    add(at(grp(bx(0.85, 0.38, 0.5, M.steel), bx(0.3, 0.6, 0.26, M.steel, 0, 0.38, -0.12)), -2.05, 1.72, back + 0.33), 1.0, 'drop', 1.5);
    [1.5, 1.95].forEach((y, i) => add(bx(1.5, 0.05, 0.28, M.wood, -0.45, y, back + 0.22), 1.05 + i * 0.08, 'drop', 1));
    [-0.9, -0.62, -0.1].forEach((x, i) => add(cy(0.07, 0.2 + i * 0.05, M.ceramic, x, 1.55, back + 0.22), 1.25 + i * 0.05));
    add(bx(0.6, 0.02, 0.42, M.black, -0.45, 0.905, rz), 0.95);
    const spout = shadowed(new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.018, 8, 20, Math.PI), M.brass));
    spout.rotation.y = -Math.PI / 2;
    spout.position.set(0, 0.34, 0.11);
    add(at(grp(cy(0.022, 0.34, M.brass), spout), -0.45, 0.91, back + 0.17), 1.15);

    // left run and fridge column
    add(bx(0.62, 0.86, 1.9, M.slate, left + 0.385, 0, -1.05), 0.55, 'rise');
    add(bx(0.66, 0.05, 1.94, M.quartz, left + 0.4, 0.86, -1.05), 0.8, 'drop');
    add(at(grp(bx(0.78, 2.15, 0.78, M.steel), bx(0.03, 1.2, 0.03, M.black, 0.36, 0.7, 0.2), bx(0.03, 1.2, 0.03, M.black, 0.36, 0.7, -0.2)), left + 0.47, 0, 0.42), 0.65, 'rise');

    // waterfall island and stools
    const ix = 0.7, iz = 0.55;
    add(bx(2.2, 0.88, 0.95, M.slate, ix, 0, iz), 0.85, 'rise');
    add(bx(2.5, 0.06, 1.08, M.quartz, ix, 0.88, iz), 1.1, 'drop');
    [-1, 1].forEach((s) => add(bx(0.06, 0.88, 1.08, M.quartz, ix + s * 1.22, 0, iz), 1.15, 'rise'));
    add(plant(ix + 0.7, 0.94, iz - 0.15, 0.9), 1.6);
    [-0.7, 0, 0.7].forEach((dx, i) => add(at(grp(cy(0.18, 0.03, M.black), cy(0.03, 0.72, M.black), cy(0.21, 0.07, M.wood, 0, 0.72)), ix + dx, 0, iz + 0.95), 1.3 + i * 0.08));

    // pendants over the island
    [-0.7, 0, 0.7].forEach((dx, i) => {
      const shadeM = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.2, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.brass));
      shadeM.position.y = 1.62;
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 10), M.bulb);
      bulb.position.y = 1.62;
      add(at(grp(cy(0.008, H - 1.82, M.black, 0, 1.82), shadeM, bulb), ix + dx, 0, iz), 1.5 + i * 0.1, 'drop', 1.5);
    });
    return { cam: [7.4, 6.0, 8.2], target: [0, 0.9, 0], size: 6 };
  },

  /* ---------- Bathroom: glass shower, floating vanity, freestanding tub ---------- */
  bathroom({ M, add, bx, cb, cy, grp, at, plinth, plant, shadowed, THREE }) {
    const W = 4.8, D = 4.2, H = 2.7, back = -D / 2, left = -W / 2;
    plinth(W + 0.9, D + 0.9);
    add(bx(W, 0.06, D, M.tileFloor, 0, -0.06, 0, [1.2, 1.2]), 0, 'none');
    add(bx(W, H, 0.15, M.tileWall, 0, 0, back, [1.2, 1.2]), 0.1, 'rise');
    add(bx(0.15, H, D, M.tileWall, left, 0, 0, [1.2, 1.2]), 0.18, 'rise');
    add(cb(0.04, 0.9, 1.1, M.daylight, left + 0.09, 1.65, 0.6), 0.5);

    // shower: dark tile tray, frameless glass with black top rail, brass rain head
    const sx = left + 0.075 + 0.75, sz = back + 0.075 + 0.7;
    add(bx(1.5, 0.04, 1.4, M.tileDark, sx, 0, sz, [0.6, 0.6]), 0.45, 'rise');
    add(bx(1.5, 2.0, 0.02, M.glass, sx, 0.04, sz + 0.7), 0.7, 'rise');
    add(bx(0.02, 2.0, 0.9, M.glass, sx + 0.75, 0.04, sz + 0.25), 0.78, 'rise');
    add(at(grp(cb(1.5, 0.03, 0.03, M.black, 0, 0, 0.7), cb(0.03, 0.03, 1.4, M.black, 0.75, 0, 0), cb(0.03, 2.04, 0.03, M.black, 0.75, -1.02, 0.7)), sx, 2.06, sz), 0.95, 'drop', 1);
    add(at(grp(cb(0.04, 0.04, 0.38, M.brass, 0, 0, 0.19), cy(0.13, 0.02, M.brass, 0, -0.04, 0.38)), sx, 2.15, back + 0.075), 1.1);
    add(cb(0.5, 0.32, 0.03, M.black, sx, 1.3, back + 0.09), 1.0);

    // floating vanity, vessel sinks, round mirrors
    const vx = 1.0, vz = back + 0.075 + 0.27;
    add(bx(1.6, 0.48, 0.52, M.wood, vx, 0.36, vz), 0.6, 'rise');
    add(bx(1.66, 0.04, 0.55, M.quartz, vx, 0.84, vz), 0.85, 'drop');
    [-0.4, 0.4].forEach((dx, i) => {
      add(cy(0.2, 0.13, M.ceramic, vx + dx, 0.88, vz + 0.03, 0.15, 36), 1.05 + i * 0.08);
      add(cb(0.03, 0.03, 0.2, M.brass, vx + dx, 1.14, back + 0.17), 1.15 + i * 0.08);
      const mirror = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.02, 48), M.mirror));
      mirror.rotation.x = Math.PI / 2;
      const rim = shadowed(new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.016, 8, 48), M.brass));
      add(at(grp(mirror, rim), vx + dx, 1.65, back + 0.09), 1.2 + i * 0.08);
    });

    // freestanding tub: a lathe profile stretched into an oval
    const prof = [[0, 0.02], [0.42, 0.02], [0.5, 0.1], [0.55, 0.55], [0.58, 0.6], [0.53, 0.6], [0.48, 0.2], [0, 0.16]].map(([x, y]) => new THREE.Vector2(x, y));
    const tub = shadowed(new THREE.Mesh(new THREE.LatheGeometry(prof, 56), M.ceramic));
    tub.scale.set(1.5, 1, 0.82);
    tub.position.set(0.75, 0, 0.75);
    add(tub, 0.9);
    add(at(grp(cy(0.024, 0.95, M.brass), cb(0.025, 0.025, 0.24, M.brass, 0, 0.94, 0.12)), 0.75 - 1.05, 0, 0.75), 1.3);

    // towel, plant, globe pendant
    add(at(grp(cb(0.04, 0.04, 0.6, M.brass, 0, 0.7, 0), cb(0.05, 0.72, 0.46, M.fabricTan, 0.03, 0.34, 0)), left + 0.13, 0.9, -0.35), 1.35);
    add(plant(2.0, 0, 1.55, 1.3), 1.45);
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), M.bulb);
    globe.position.y = 1.95;
    add(at(grp(cy(0.008, H - 2.1, M.black, 0, 2.1), globe), 0.75, 0, 0.75), 1.5, 'drop', 1.2);
    return { cam: [6.0, 5.0, 6.6], target: [-0.1, 0.9, -0.1], size: 5 };
  },

  /* ---------- Full home: open plan, the removed wall drawn as a dashed bronze outline ---------- */
  full({ M, add, bx, cb, cy, grp, at, plinth, plant, THREE }) {
    const W = 9, D = 7, H = 2.8, back = -D / 2, left = -W / 2;
    plinth(W + 0.9, D + 0.9);
    add(bx(W, 0.06, D, M.floorWood, 0, -0.06, 0, [1.2, 1.2]), 0, 'none');
    add(bx(W, H, 0.15, M.wall, 0, 0, back), 0.1, 'rise');
    add(bx(0.15, H, D, M.wall, left, 0, 0), 0.18, 'rise');
    [-1.6, 2.6].forEach((x, i) => add(cb(1.6, 1.4, 0.04, M.daylight, x, 1.55, back + 0.09), 0.45 + i * 0.05));
    add(cb(0.04, 1.4, 1.6, M.daylight, left + 0.09, 1.55, 1.2), 0.55);

    // the wall that used to split kitchen and living
    const ghostMat = new THREE.LineDashedMaterial({ color: 0xc0976f, dashSize: 0.16, gapSize: 0.1, transparent: true, opacity: 0 });
    const ghost = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.14, H, 4)), ghostMat);
    ghost.computeLineDistances();
    ghost.position.set(0.9, H / 2, back + 2.1);
    add(ghost, 0, 'none');
    add(bx(0.14, 0.006, 4, M.tan, 0.9, 0, back + 2.1), 0.6, 'rise');

    // kitchen zone
    add(bx(3, 0.88, 0.62, M.slate, 2.8, 0, back + 0.39), 0.7, 'rise');
    add(bx(3.04, 0.05, 0.66, M.quartz, 2.8, 0.88, back + 0.41), 0.9, 'drop');
    add(bx(1.4, 0.7, 0.36, M.slate, 1.8, 1.55, back + 0.26), 0.95, 'drop');
    add(bx(1.9, 0.9, 0.9, M.slate, 2.8, 0, back + 2.0), 0.95, 'rise');
    add(bx(2.1, 0.05, 1.0, M.quartz, 2.8, 0.9, back + 2.0), 1.1, 'drop');

    // dining
    const dx = 1.6, dz = 1.4;
    add(bx(1.9, 0.05, 0.95, M.wood, dx, 0.72, dz), 1.15, 'drop');
    [[-0.85, -0.4], [0.85, -0.4], [-0.85, 0.4], [0.85, 0.4]].forEach(([x, z]) => add(bx(0.06, 0.72, 0.06, M.black, dx + x, 0, dz + z), 1.05, 'rise'));
    [[-0.45, -0.72, 0], [0.45, -0.72, 0], [-0.45, 0.72, Math.PI], [0.45, 0.72, Math.PI]].forEach(([x, z, r], i) => {
      add(at(grp(bx(0.44, 0.45, 0.42, M.fabricTan), bx(0.44, 0.45, 0.06, M.fabricTan, 0, 0.45, -0.18)), dx + x, 0, dz + z, r), 1.25 + i * 0.05);
    });
    add(at(grp(cb(1.3, 0.05, 0.12, M.black), cy(0.006, H - 1.95, M.black, -0.5, 0.02), cy(0.006, H - 1.95, M.black, 0.5, 0.02)), dx, 1.92, dz), 1.5, 'drop', 1);

    // living
    const lx = -2.3, lz = 1.0;
    add(bx(3.0, 0.012, 2.4, M.rug, lx, 0, lz), 0.8, 'rise');
    add(at(grp(bx(0.95, 0.42, 2.4, M.fabric), bx(0.24, 0.42, 2.4, M.fabric, 0.36, 0.42, 0), bx(0.95, 0.58, 0.2, M.fabric, 0, 0, -1.1), bx(0.95, 0.58, 0.2, M.fabric, 0, 0, 1.1)), lx + 1.1, 0, lz), 1.0);
    add(bx(0.75, 0.36, 1.15, M.wood, lx - 0.2, 0, lz), 1.15);
    add(bx(0.45, 0.5, 2.1, M.slate, left + 0.32, 0, lz), 1.05, 'rise');
    add(cb(0.05, 0.72, 1.3, M.black, left + 0.12, 1.3, lz), 1.2);
    add(at(grp(cy(0.015, 1.5, M.black), cy(0.17, 0.26, M.fabricTan, 0, 1.45, 0, 0.22)), lx + 0.8, 0, lz - 1.5), 1.3);
    add(plant(left + 0.45, 0, -0.4, 1.6), 1.4);

    // stair along the left wall
    for (let i = 0; i < 9; i++) add(bx(1.0, (i + 1) * 0.19, 0.28, M.woodLight, left + 0.6, 0, -0.9 - i * 0.28), 0.6 + i * 0.04, 'rise');

    return {
      cam: [10.5, 8.6, 11], target: [0, 0.8, -0.3], size: 8,
      tick(t) { ghostMat.opacity = t < 0.4 ? 0 : 0.45 + 0.4 * (0.5 + 0.5 * Math.sin(t * 2.4)); },
    };
  },

  /* ---------- Addition: the side wing assembles onto an existing house ---------- */
  addition({ M, add, bx, at, plinth, win, gableRoof, gableEnds, tree, THREE }) {
    plinth(15, 11, M.lawn);
    // the existing house
    const hx = -2.2, hw = 6, hd = 5.4, hh = 5.4;
    add(bx(hw + 0.2, 0.3, hd + 0.2, M.concrete, hx, 0, 0), 0, 'none');
    add(bx(hw, hh, hd, M.siding, hx, 0.3, 0, [hw, 1]), 0, 'none');
    add(at(gableRoof(hw, hd, 2.2), hx, 0.3 + hh, 0), 0, 'none');
    add(at(gableEnds(hw, hd, 2.2), hx, 0.3 + hh, 0), 0, 'none');
    [[-1.6, 1.8], [1.6, 1.8], [-1.6, 4.4], [0, 4.4], [1.6, 4.4]].forEach(([x, y]) => add(at(win(0.9, 1.4), hx + x, y, hd / 2 + 0.02), 0, 'none'));
    add(bx(1.0, 2.1, 0.06, M.door, hx, 0.3, hd / 2), 0, 'none');

    // the addition: outline, foundation, studs, siding, roof, windows
    const ax = 2.9, aw = 4.2, ad = 4.4, ah = 3.1;
    const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(aw, ah, ad)), M.edge);
    frame.position.set(ax, 0.3 + ah / 2, 0);
    add(frame, 0.2, 'pop');
    add(bx(aw + 0.2, 0.3, ad + 0.2, M.concrete, ax, 0, 0), 0.4, 'rise');
    for (let i = 0; i < 6; i++) add(bx(0.1, ah, 0.1, M.woodLight, ax - aw / 2 + 0.1 + i * (aw - 0.2) / 5, 0.3, ad / 2 - 0.1), 0.6 + i * 0.05, 'rise');
    for (let i = 0; i < 5; i++) add(bx(0.1, ah, 0.1, M.woodLight, ax + aw / 2 - 0.1, 0.3, -ad / 2 + 0.1 + i * (ad - 0.2) / 4), 0.75 + i * 0.05, 'rise');
    add(bx(aw, ah, ad, M.siding, ax, 0.3, 0, [aw, 1]), 1.3, 'rise');
    add(at(gableRoof(aw, ad, 1.5), ax, 0.3 + ah, 0), 1.8, 'drop', 3);
    add(at(gableEnds(aw, ad, 1.5), ax, 0.3 + ah, 0), 1.75, 'drop', 3);
    [-0.9, 0.9].forEach((x, i) => add(at(win(1.3, 1.5), ax + x, 1.9, ad / 2 + 0.02), 2.2 + i * 0.1));
    add(at(win(1.2, 1.3), ax + aw / 2 + 0.02, 1.9, 0, Math.PI / 2), 2.4);

    add(tree(-7, 3.8, 5.2), 0, 'none');
    add(tree(-6.2, -4, 6.4), 0, 'none');
    add(tree(6.4, -4.1, 4.6, 'round'), 0, 'none');
    return { cam: [12.5, 8.8, 13.5], target: [0.2, 2.6, 0], size: 9 };
  },

  /* ---------- ADU: detached backyard cottage with a deck ---------- */
  adu({ M, add, bx, cb, cy, grp, at, plinth, win, gableRoof, gableEnds, tree, plant }) {
    plinth(14, 11, M.lawn);
    // corner of the main house and the back fence
    add(bx(5.2, 6, 4.2, M.siding, -4.3, 0, -3.3, [5.2, 1]), 0, 'none');
    add(at(gableRoof(5.2, 4.2, 2), -4.3, 6, -3.3), 0, 'none');
    add(at(gableEnds(5.2, 4.2, 2), -4.3, 6, -3.3), 0, 'none');
    add(at(win(1.0, 1.3), -3.2, 1.6, -1.18), 0, 'none');
    add(bx(8.6, 1.6, 0.06, M.wood, 2.4, 0, -5.1), 0, 'none');
    for (let i = 0; i < 9; i++) add(bx(0.12, 1.75, 0.12, M.wood, -1.9 + i * 1.07, 0, -5.06), 0, 'none');

    // the cottage
    const cx = 2.4, cz = 0.4, w = 4.4, d = 3.6, h = 2.7;
    add(bx(w + 0.2, 0.35, d + 0.2, M.concrete, cx, 0, cz), 0.3, 'rise');
    add(bx(w, h, d, M.siding, cx, 0.35, cz, [w, 1]), 0.6, 'rise');
    add(at(gableRoof(w, d, 1.5), cx, 0.35 + h, cz), 1.1, 'drop', 3);
    add(at(gableEnds(w, d, 1.5), cx, 0.35 + h, cz), 1.05, 'drop', 3);
    add(bx(w + 0.6, 0.25, 1.7, M.woodLight, cx, 0, cz + d / 2 + 0.85), 0.8, 'rise');
    add(bx(1.4, 0.12, 0.45, M.woodLight, cx - 0.9, 0, cz + d / 2 + 1.9), 0.95, 'rise');
    add(bx(0.95, 2.05, 0.06, M.door, cx - 0.9, 0.35, cz + d / 2), 1.4);
    add(at(win(1.3, 1.2, M.winWarm), cx + 0.9, 1.55, cz + d / 2 + 0.02), 1.5);
    add(at(win(1.1, 1.1, M.winWarm), cx + w / 2 + 0.02, 1.55, cz, Math.PI / 2), 1.6);
    add(cb(0.12, 0.12, 0.12, M.bulb, cx - 0.25, 2.5, cz + d / 2 + 0.08), 1.7);

    // path from the main house to the deck, with lamps
    for (let i = 0; i < 6; i++) add(cy(0.32, 0.04, M.stone, -2.6 + i * 0.75, 0, -0.6 + i * 0.62, 0.32, 10), 1.6 + i * 0.05);
    [[-1.6, 1.3], [0.6, 2.6]].forEach(([x, z], i) => add(at(grp(cy(0.04, 0.8, M.black), cb(0.14, 0.14, 0.14, M.bulb, 0, 0.86, 0)), x, 0, z), 1.8 + i * 0.05));
    add(plant(cx + 2.2, 0, cz + d / 2 + 0.6, 1.8), 1.9);
    add(tree(6.2, -2.8, 5.6), 0, 'none');
    add(tree(-6, 3.2, 4.4, 'round'), 0, 'none');
    return { cam: [11, 7.4, 11.5], target: [1.2, 1.5, 0], size: 8 };
  },

  /* ---------- Exterior: roof system shown as breathing exploded layers ---------- */
  exterior({ M, add, bx, grp, at, plinth, win, gableRoof, gableEnds, tree }) {
    plinth(12, 10, M.lawn);
    const w = 6.4, d = 4.8, h = 3.4, eave = 0.3 + h, rise = 1.9;
    add(bx(w + 0.2, 0.3, d + 0.2, M.concrete, 0, 0, 0), 0, 'none');
    add(bx(w, h, d, M.siding, 0, 0.3, 0, [w, 1]), 0.1, 'rise');
    add(at(gableEnds(w, d, rise), 0, eave, 0), 0.3, 'drop', 2);
    [-1.9, 1.9].forEach((x, i) => add(at(win(1.1, 1.4), x, 2.0, d / 2 + 0.02), 0.5 + i * 0.05));
    add(bx(1.0, 2.1, 0.06, M.door, 0, 0.3, d / 2), 0.55);
    [[-w / 2, d / 2], [w / 2, d / 2], [-w / 2, -d / 2], [w / 2, -d / 2]].forEach(([x, z], i) => add(bx(0.2, h, 0.2, M.trim, x, 0.3, z), 0.6 + i * 0.04, 'rise'));

    // roof layers: sheathing, underlayment, shingles (the ridge cap rides on the shingles)
    const GAP = 1.0;
    const layers = [
      gableRoof(w, d, rise, M.osb, 0.3, 0.06),
      gableRoof(w, d, rise, M.underlay, 0.33, 0.04),
      grp(gableRoof(w, d, rise, M.roof, 0.38, 0.1), bx(w + 0.8, 0.1, 0.36, M.black, 0, rise + 0.08, 0)),
    ];
    const bases = layers.map((_, i) => eave + 0.02 + i * 0.03);
    layers.forEach((l, i) => {
      l.position.y = bases[i] + i * GAP;
      add(l, 0.8 + i * 0.25, 'drop', 4);
    });

    // gutters and downspouts
    [1, -1].forEach((s, i) => {
      add(bx(w + 0.8, 0.12, 0.14, M.trim, 0, eave - 0.12, s * (d / 2 + 0.45)), 1.9 + i * 0.1);
      add(bx(0.1, eave - 0.1, 0.1, M.trim, -w / 2 - 0.25, 0.1, s * (d / 2 + 0.2)), 2.0 + i * 0.1, 'rise');
    });
    add(tree(-4.6, -3, 5.2), 0, 'none');
    add(tree(4.8, 3.2, 4.2, 'round'), 0, 'none');

    return {
      cam: [9.6, 7.8, 10.8], target: [0, 3.2, 0], size: 7,
      tick(t) {
        if (t < 2.2) return;
        // breathe between exploded and assembled so each layer reads on its own
        const gap = GAP * (0.5 + 0.5 * Math.cos((t - 2.2) * 0.9));
        layers.forEach((l, i) => (l.position.y = bases[i] + i * gap));
      },
    };
  },
};

/* =========================================================
   Viewer
   ========================================================= */
export function createServiceViewer(canvas, { reduce = false } = {}) {
  const small = window.matchMedia('(max-width: 860px)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // same stage as the How We Build section: graphite background, soft fog, warm sun
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x15181b);
  scene.fog = new THREE.Fog(0x15181b, 40, 80);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = 1.36;
  controls.autoRotate = !reduce;
  controls.autoRotateSpeed = 0.7;
  let idle = 0;
  controls.addEventListener('start', () => { controls.autoRotate = false; clearTimeout(idle); });
  controls.addEventListener('end', () => { idle = setTimeout(() => (controls.autoRotate = !reduce), 2500); });

  scene.add(new THREE.HemisphereLight(0xe4e9ef, 0x3b342e, 1.0));
  const sun = new THREE.DirectionalLight(0xfff0dc, 2.4);
  sun.position.set(-8, 14, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  // low biases keep shadows attached to the base of every object (no "floating" look)
  sun.shadow.bias = -0.00015;
  sun.shadow.normalBias = 0.008;
  scene.add(sun, sun.target);

  const M = makeMaterials();
  let root = null, anims = [], tick = null, t0 = 0, raf = 0, view = null;

  /* fit the bounding sphere to the narrower of the two fields of view */
  function fit() {
    if (!view) return;
    const vf = THREE.MathUtils.degToRad(camera.fov);
    const hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
    const dist = (view.r * 0.86) / Math.sin(Math.min(vf, hf) / 2);
    controls.target.copy(view.center).y -= view.r * 0.06;
    camera.position.copy(controls.target).addScaledVector(view.dir, dist);
    controls.minDistance = dist * 0.6;
    controls.maxDistance = dist * 1.35;
    controls.update();
  }

  function clear() {
    if (!root) return;
    scene.remove(root);
    root.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
    root = null; anims = []; tick = null;
  }

  function applyAnims(t) {
    for (const a of anims) {
      const e = clamp01((t - a.delay) / a.dur);
      a.obj.visible = e > 0.001;
      if (!a.obj.visible) continue;
      if (a.type === 'pop') a.obj.scale.copy(a.bs).multiplyScalar(Math.max(easeBack(e), 0.001));
      else if (a.type === 'drop') a.obj.position.y = a.base.y + (1 - easeOut(e)) * a.h;
      else if (a.type === 'rise') a.obj.scale.y = a.bs.y * Math.max(easeOut(e), 0.001);
    }
  }

  function show(key) {
    const build = BUILDERS[key];
    if (!build) return;
    clear();
    root = new THREE.Group();
    scene.add(root);
    const spec = build(makeKit(root, anims, M));
    tick = spec.tick || null;

    // measure the finished model once, then frame it from the scene's preferred angle
    applyAnims(99);
    root.updateMatrixWorld(true);
    const sphere = new THREE.Box3().setFromObject(root).getBoundingSphere(new THREE.Sphere());
    view = {
      center: sphere.center.clone(),
      r: sphere.radius,
      dir: new THREE.Vector3(...spec.cam).sub(new THREE.Vector3(...spec.target)).normalize(),
    };
    fit();
    // shadow frustum hugs the model, so every texel goes to it
    const sc = sun.shadow.camera, s = view.r * 1.02;
    sun.target.position.copy(view.center);
    sun.position.copy(view.center).add(new THREE.Vector3(-0.45, 0.78, 0.55).multiplyScalar(view.r * 2.2));
    sun.target.updateMatrixWorld();
    sc.left = -s; sc.right = s; sc.top = s; sc.bottom = -s; sc.near = 0.5; sc.far = view.r * 5;
    sc.updateProjectionMatrix();
    controls.autoRotate = !reduce;
    t0 = performance.now();
    settled = false;
    dirty = true;
    applyAnims(reduce ? 99 : 0);
  }

  // render on demand: only while the intro plays, a loop animates, or the camera moves
  let dirty = true, settled = false;
  controls.addEventListener('change', () => (dirty = true));
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const t = reduce ? 99 : (now - t0) / 1000;
    const intro = t < 3.2;
    if (intro) applyAnims(t);
    else if (!settled) { applyAnims(99); settled = true; dirty = true; }
    if (tick && !reduce) tick(t);
    const moved = controls.update();
    if (intro || moved || dirty || (tick && !reduce)) {
      renderer.render(scene, camera);
      dirty = false;
    }
  }

  function resize() {
    const el = canvas.parentElement;
    const w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? 44 : 34;
    camera.updateProjectionMatrix();
    fit();
    dirty = true;
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);

  return {
    show,
    start() { resize(); if (!raf) raf = requestAnimationFrame(frame); },
    stop() { cancelAnimationFrame(raf); raf = 0; },
  };
}
