/* ==========================================================================
   Hero 3D scene — "system constellation"
   Custom perspective-projected point/edge renderer. Zero dependencies.
   Nodes = services, edges = connections, pulses = data in flight.
   ========================================================================== */
(function () {
  "use strict";

  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- palette ---------- */
  const C = {
    node: [148, 165, 205],     // neutral steel
    accent: [92, 158, 255],    // azure
    mint: [67, 217, 163],      // mint
  };
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  /* ---------- scene state ---------- */
  let W = 0, H = 0, DPR = 1;
  let points = [];        // {x,y,z, r, col, tw}
  let edges = [];         // [i, j, strength]
  let pulses = [];        // {edge, t, speed, col}
  let rotY = 0, rotX = -0.18;
  let targetMX = 0, targetMY = 0, mx = 0, my = 0;
  let running = false, rafId = 0, lastT = 0, frameDt = 0.016;

  /* deterministic pseudo-random so layout is stable between resizes */
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function buildScene() {
    const rand = mulberry32(20261122);
    points = []; edges = []; pulses = [];

    const isNarrow = W < 880;
    const shellCount = isNarrow ? 56 : 96;
    const coreCount = isNarrow ? 16 : 26;
    const R = Math.min(W, H) * (isNarrow ? 0.34 : 0.30);

    // outer shell — Fibonacci sphere (the "infrastructure" lattice)
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < shellCount; i++) {
      const y = 1 - (i / (shellCount - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const th = golden * i;
      points.push({
        x: Math.cos(th) * rad * R,
        y: y * R,
        z: Math.sin(th) * rad * R,
        r: 1.1 + rand() * 0.7,
        col: C.node,
        tw: rand() * Math.PI * 2,
        shell: true,
      });
    }

    // inner core — clustered service nodes
    const clusters = 4;
    const coreStart = points.length;
    for (let c = 0; c < clusters; c++) {
      const cx = (rand() - 0.5) * R * 0.9;
      const cy = (rand() - 0.5) * R * 0.8;
      const cz = (rand() - 0.5) * R * 0.9;
      const n = Math.ceil(coreCount / clusters);
      for (let i = 0; i < n; i++) {
        points.push({
          x: cx + (rand() - 0.5) * R * 0.55,
          y: cy + (rand() - 0.5) * R * 0.5,
          z: cz + (rand() - 0.5) * R * 0.55,
          r: 1.7 + rand() * 1.3,
          col: rand() < 0.16 ? C.mint : (rand() < 0.5 ? C.accent : C.node),
          tw: rand() * Math.PI * 2,
          shell: false,
        });
      }
    }

    // edges — each core node to its 2 nearest core siblings
    const core = points.slice(coreStart);
    for (let i = 0; i < core.length; i++) {
      const dists = [];
      for (let j = 0; j < core.length; j++) {
        if (i === j) continue;
        const a = core[i], b = core[j];
        const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
        dists.push([d, j]);
      }
      dists.sort((p, q) => p[0] - q[0]);
      for (let k = 0; k < 2 && k < dists.length; k++) {
        const j = dists[k][1];
        const a = coreStart + Math.min(i, j), b = coreStart + Math.max(i, j);
        if (!edges.some(e => e[0] === a && e[1] === b)) edges.push([a, b, 0.5 + rand() * 0.5]);
      }
    }
    // a few long-range links shell ↔ core (system talking to the edge)
    for (let k = 0; k < (isNarrow ? 5 : 9); k++) {
      const s = Math.floor(rand() * coreStart);
      const c = coreStart + Math.floor(rand() * core.length);
      edges.push([s, c, 0.22]);
    }

    // pulses — packets traveling along random edges
    const pulseCount = isNarrow ? 5 : 9;
    for (let i = 0; i < pulseCount; i++) {
      pulses.push({
        edge: Math.floor(rand() * edges.length),
        t: rand(),
        speed: 0.12 + rand() * 0.2,
        col: rand() < 0.25 ? C.mint : C.accent,
      });
    }
  }

  /* ---------- projection ---------- */
  const FOV = 720;
  function project(p, cx, cy) {
    // rotate around Y then X (plus eased mouse offset)
    const ry = rotY + mx * 0.35;
    const rx = rotX + my * 0.22;
    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    const cosX = Math.cos(rx), sinX = Math.sin(rx);

    let x = p.x * cosY - p.z * sinY;
    let z = p.x * sinY + p.z * cosY;
    let y = p.y * cosX - z * sinX;
    z = p.y * sinX + z * cosX;

    const s = FOV / (FOV + z + 260);
    return { x: cx + x * s, y: cy + y * s, s, z };
  }

  /* ---------- frame ---------- */
  function frame(t) {
    if (!running) return;
    const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016);
    lastT = t;
    frameDt = dt;

    rotY += dt * 0.11;
    mx += (targetMX - mx) * 0.045;
    my += (targetMY - my) * 0.045;

    draw(t / 1000);
    rafId = requestAnimationFrame(frame);
  }

  function draw(time) {
    ctx.clearRect(0, 0, W, H);

    const isNarrow = W < 880;
    const cx = isNarrow ? W * 0.5 : W * 0.72;
    const cy = isNarrow ? H * 0.42 : H * 0.44;

    const proj = points.map(p => project(p, cx, cy));

    // edges
    ctx.lineWidth = 1;
    for (const [a, b, str] of edges) {
      const A = proj[a], B = proj[b];
      const depth = Math.min(A.s, B.s);
      const alpha = str * 0.44 * Math.max(0.1, (depth - 0.45)) * 1.6;
      if (alpha <= 0.012) continue;
      ctx.strokeStyle = rgba(C.node, alpha);
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.stroke();
    }

    // pulses
    for (const pu of pulses) {
      pu.t += pu.speed * frameDt;
      if (pu.t > 1) { pu.t = 0; pu.edge = (pu.edge + 7) % edges.length; }
      const [a, b] = edges[pu.edge];
      const A = proj[a], B = proj[b];
      const x = A.x + (B.x - A.x) * pu.t;
      const y = A.y + (B.y - A.y) * pu.t;
      const s = A.s + (B.s - A.s) * pu.t;
      const r = 1.7 * s;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 5);
      glow.addColorStop(0, rgba(pu.col, 0.55 * s));
      glow.addColorStop(1, rgba(pu.col, 0));
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(x, y, r * 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = rgba(pu.col, 0.9 * s);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }

    // nodes
    for (let i = 0; i < points.length; i++) {
      const p = points[i], P = proj[i];
      const depthA = Math.max(0, (P.s - 0.42)) * 1.9;
      if (depthA <= 0.02) continue;
      const twinkle = p.shell ? 0.75 + 0.25 * Math.sin(time * 1.3 + p.tw) : 1;
      const alpha = Math.min(1, depthA) * (p.shell ? 0.42 : 0.85) * twinkle;
      const r = p.r * P.s;
      ctx.fillStyle = rgba(p.col, alpha);
      ctx.beginPath(); ctx.arc(P.x, P.y, r, 0, Math.PI * 2); ctx.fill();
      // soft halo on accent core nodes
      if (!p.shell && p.col !== C.node && r > 1.2) {
        ctx.fillStyle = rgba(p.col, alpha * 0.16);
        ctx.beginPath(); ctx.arc(P.x, P.y, r * 3.1, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  /* ---------- lifecycle ---------- */
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = Math.round(rect.width);
    H = Math.round(rect.height);
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildScene();
    if (reduceMotion) draw(0.5); // single static frame
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    lastT = performance.now();
    rafId = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  window.addEventListener("pointermove", (e) => {
    targetMX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // only animate while the hero is on screen
  const hero = document.getElementById("home");
  if ("IntersectionObserver" in window && hero) {
    new IntersectionObserver((entries) => {
      entries.forEach(en => en.isIntersecting ? start() : stop());
    }, { threshold: 0.05 }).observe(hero);
  } else {
    start();
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (hero && hero.getBoundingClientRect().bottom > 0) start();
  });

  resize();
  if (!reduceMotion) start();
})();
