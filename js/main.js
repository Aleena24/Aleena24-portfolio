/* ==========================================================================
   Portfolio interactions — nav, reveals, pipeline + architecture explorers.
   Vanilla JS, no dependencies.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------------- nav ---------------- */
  const nav = document.getElementById("nav");
  const burger = document.getElementById("nav-burger");
  const links = document.getElementById("nav-links");

  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  burger.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  links.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => {
      links.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    })
  );

  // active section highlight
  const sectionIds = ["about", "experience", "celerscet", "projects", "skills", "research", "contact"];
  const navAnchors = new Map(
    sectionIds.map(id => [id, links.querySelector(`a[href="#${id}"]`)]).filter(([, a]) => a)
  );
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        navAnchors.forEach(a => a.classList.remove("is-active"));
        const a = navAnchors.get(en.target.id);
        if (a) a.classList.add("is-active");
      });
    }, { rootMargin: "-38% 0px -55% 0px" });
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  /* ---------------- scroll reveals ---------------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add("is-in"));
  }

  /* ---------------- misc ---------------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  const toTop = document.getElementById("to-top");
  window.addEventListener("scroll", () => {
    toTop.classList.toggle("is-visible", window.scrollY > 900);
  }, { passive: true });
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ==========================================================================
     CelerSCET — lifecycle pipeline explorer
     ========================================================================== */
  const PIPELINE = [
    {
      name: "Admissions",
      sub: "enquiry → admitted",
      desc: "The complete admission funnel: applicants register with OTP-verified accounts, work through a multi-step application, pay online, and move through a controlled status machine to an admission number.",
      items: [
        "Admission enquiries & applicant portal",
        "Multi-step application — student, parents, academics, entrance, preferences",
        "Quota handling: government · management · NRI · TFW · lapsed",
        "Degree-aware rules (M.Tech & lateral-entry exemptions)",
        "Razorpay payment collection & tracking",
        "Offer → acceptance → admission-number status machine",
        "QR document verification & branded PDF exports",
        "Reports & analytics with live, reconciling counts",
      ],
    },
    {
      name: "Provisioning",
      sub: "applicant → student",
      desc: "The bridge from an admitted applicant to a working student account — built as a guided wizard that follows the real dependency chain instead of leaving admins to guess the order.",
      items: [
        "Program-based batch creation",
        "Class creation with capacity & section splitting",
        "Class teacher assignment",
        "Student allocation to classes",
        "Deterministic SR number generation",
        "One shared roll-number ordering rule",
        "Institutional email provisioning",
        "Per-student “account is live” notifications",
      ],
    },
    {
      name: "Student records",
      sub: "one student, one truth",
      desc: "A single student record that every module trusts — with strict identity handling, storage in the right places, and history instead of overwrites.",
      items: [
        "Student profiles & academic information",
        "Parent / guardian information",
        "AI-validated profile photos with a review queue",
        "Documents & photos in Google Cloud Storage",
        "Status lifecycle with audit-shaped history",
        "Search, filtering & guarded bulk operations",
        "Strict two-ID space (profile ↔ student) with full FK integrity",
      ],
    },
    {
      name: "Academics",
      sub: "the daily engine",
      desc: "Everything teaching runs on — timetables, attendance, assessment and course planning — sharing the same terms, batches and classes the provisioning stage created.",
      items: [
        "Timetable builder with publishing & versioned windows",
        "Attendance registers, thresholds, corrections & disputes",
        "Assessment Studio, rubrics & gradebook",
        "Internal marks & course progress",
        "Course plans with CO/SLO mapping",
        "Curriculum with approval chains",
        "Academic years, terms & semesters",
        "Academic calendar & events",
      ],
    },
    {
      name: "Governance",
      sub: "roles, rights & workflows",
      desc: "The layer that makes the ERP safe to hand to hundreds of users: precise permissions, one approvals engine, registry-driven notifications, and an audit trail with restore.",
      items: [
        "Role dashboards — student, faculty, HoD, admin",
        "3-layer permission engine + relational scoped rights",
        "User management, bulk import & profile completion",
        "One generic approvals engine across every module",
        "Registry-driven notifications with per-record fan-out",
        "Session control — device limits, revocation, heartbeat",
        "Data supervision — audit trail, restore, nightly backups",
      ],
    },
    {
      name: "Campus life",
      sub: "beyond the classroom",
      desc: "The modules that round out campus operations — plus a dedicated support environment being stood up outside the ERP so tickets never depend on the system they report on.",
      items: [
        "Leave management & library",
        "Placement & internship tracking",
        "Holistic development (HDP) & engagement hub",
        "Forums & direct messages",
        "Notice board with approval gating",
        "Online fee payments",
        "Support desk — support.celerscet.com (rolling out)",
      ],
    },
  ];

  const pipeTrack = document.getElementById("pipe-track");
  const pipeDetail = document.getElementById("pipe-detail");
  if (pipeTrack && pipeDetail) {
    PIPELINE.forEach((st, i) => {
      const b = document.createElement("button");
      b.className = "pipe-step";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", i === 0 ? "true" : "false");
      b.setAttribute("tabindex", i === 0 ? "0" : "-1");
      b.id = `pipe-tab-${i}`;
      b.innerHTML = `<span class="num">0${i + 1}</span><span class="name">${st.name}</span>`;
      b.addEventListener("click", () => selectPipe(i));
      b.addEventListener("keydown", (e) => tabKeys(e, i, PIPELINE.length, selectPipe));
      pipeTrack.appendChild(b);
    });

    function selectPipe(i) {
      pipeTrack.querySelectorAll(".pipe-step").forEach((el, j) => {
        el.setAttribute("aria-selected", String(i === j));
        el.setAttribute("tabindex", i === j ? "0" : "-1");
      });
      const st = PIPELINE[i];
      pipeDetail.setAttribute("aria-labelledby", `pipe-tab-${i}`);
      pipeDetail.innerHTML = `
        <div class="pipe-detail-head">
          <h5>${st.name}</h5>
          <span class="sub mono">${st.sub}</span>
        </div>
        <p>${st.desc}</p>
        <ul>${st.items.map(x => `<li>${x}</li>`).join("")}</ul>`;
    }
    selectPipe(0);
  }

  /* ==========================================================================
     CelerSCET — architecture explorer
     ========================================================================== */
  const ARCH = {
    tiers: [
      { label: "Clients", nodes: ["spa", "pwa", "auth"] },
      { label: "API layer — Cloud Run", nodes: ["api", "authz", "engines"] },
      { label: "Data layer", nodes: ["pg", "redis", "gcs"] },
      { label: "Platform — Google Cloud", nodes: ["build", "registry", "ops"] },
      { label: "Integrations", nodes: ["pay", "mail", "bio"] },
    ],
    nodes: {
      spa: {
        t: "React SPA", s: "react 18 · vite · mui",
        h: "The ERP frontend",
        d: "A single-page app where every feature is a self-contained service module — 90+ of them, auto-discovered by the build and resolved per user through the permission engine.",
        b: [
          "Service modules export metadata + component; the registry finds them",
          "Role-aware dashboard shell with configurable widgets",
          "Shared TTL caches for master data with in-flight deduplication",
        ],
        c: ["React 18", "Vite", "MUI 7", "React Router 7"],
      },
      pwa: {
        t: "PWA layer", s: "installable · cache policy",
        h: "Installable, and honest about updates",
        d: "The app installs like a native one — with a deliberately engineered cache story so a deploy never leaves users on a stale build.",
        b: [
          "Hashed assets cached immutable for a year; index.html never cached",
          "App reloads go through one audited path — no mystery refreshes",
        ],
        c: ["Service worker", "Web manifest"],
      },
      auth: {
        t: "Auth surfaces", s: "erp · admission · exam",
        h: "Three isolated login worlds",
        d: "Staff/students, admission applicants and exam sessions each get an isolated Supabase auth client with separate storage — a login in one surface can never leak into another.",
        b: [
          "ERP sessions in localStorage; applicant & exam sessions isolated per tab",
          "OTP-verified applicant accounts for the admission portal",
        ],
        c: ["Supabase Auth", "JWT", "OTP"],
      },
      api: {
        t: "Express REST API", s: "node.js · ~79 segments",
        h: "One backend for every client",
        d: "An Express service on Cloud Run exposing ~79 mounted route segments in a controller/service pattern. All database writes flow through here — the browser never writes directly.",
        b: [
          "Server-anchored time — client clocks are never trusted",
          "Centralized date validation on every endpoint that accepts a date",
          "Structured request logging to Cloud Logging",
        ],
        c: ["Express 4", "Node.js", "REST"],
      },
      authz: {
        t: "AuthZ & sessions", s: "3-layer · revocable",
        h: "Authority shaped like the institution",
        d: "Permissions resolve through role defaults, designation extensions and admin overrides — plus relational rights (HoD, class teacher, coordinators) for authority that is scoped, not global.",
        b: [
          "JWTs verified server-side with the service-role client",
          "Two-device limit with real revocation: per-request check, realtime kill, 60s heartbeat",
          "Every request identifies its session — nothing unrevokable",
        ],
        c: ["Supabase JWT", "RBAC", "Sessions"],
      },
      engines: {
        t: "Platform engines", s: "notifications · approvals",
        h: "Cross-cutting behavior, written once",
        d: "No module hand-writes a notification or an approval flow. A registry decides who gets notified about what; one generic engine runs every approval chain in the product.",
        b: [
          "Personal / general / announcement audiences + per-record fan-out resolvers",
          "Approval steps copied at submit time — config edits can't rewrite history",
          "“What needs my decision” answered across all modules in one query",
        ],
        c: ["Registry-driven", "Append-only audit"],
      },
      pg: {
        t: "PostgreSQL", s: "supabase · rls",
        h: "The source of truth",
        d: "Supabase-hosted Postgres with row-level security. The browser's anon key can only read what RLS allows; every write goes through the backend's service-role client and is attributable to a user.",
        b: [
          "CHECK constraints + validated vocabularies on identity columns",
          "Full FK discipline — all 37 student-id columns constrained",
          "Audit schema reachable only through guarded RPCs",
        ],
        c: ["PostgreSQL", "RLS", "Supabase"],
      },
      redis: {
        t: "Redis cache", s: "optional · degrades",
        h: "Fast, but never required",
        d: "An ioredis-backed cache layer that the system treats as optional — if Redis is unreachable, everything still works. TTL caches guard the database's disk-IO budget.",
        b: [
          "60s auth-context caches with in-flight deduplication",
          "Graceful degradation is tested behavior, not an accident",
        ],
        c: ["ioredis", "TTL caches"],
      },
      gcs: {
        t: "Cloud Storage", s: "photos · documents",
        h: "Files where files belong",
        d: "Student photographs, documents and attachments live in Google Cloud Storage buckets — not in the database — with structured paths per record type.",
        b: [
          "AI-assisted photo validation with a human review queue",
          "Nightly pg_dump database backups archived to GCS",
        ],
        c: ["GCS", "Structured buckets"],
      },
      build: {
        t: "Cloud Build", s: "ci/cd · buildpacks",
        h: "Push to deploy — both lanes",
        d: "Cloud Build triggers turn a push to dev into a staging deploy and a merge to main into production — built with buildpacks, no Dockerfile to maintain.",
        b: [
          "Strict npm lockfile discipline (npm ci fails hard on drift)",
          "Build time held at ~4 minutes — fixed a runaway that had hit 45+",
          "Deploy-env checks fail the pipeline, not the running container",
        ],
        c: ["Cloud Build", "Buildpacks", "Staging + Prod"],
      },
      registry: {
        t: "Artifact Registry", s: "images per commit",
        h: "Every build, addressable",
        d: "Each build publishes a container image tagged by commit SHA to Artifact Registry, which Cloud Run then serves — making any revision individually deployable and roll-back-able.",
        b: ["Image per commit SHA", "Cloud Run revisions for rollback"],
        c: ["Artifact Registry", "Cloud Run"],
      },
      ops: {
        t: "Ops & config", s: "secrets · dns · logs",
        h: "The unglamorous parts, done right",
        d: "Secret Manager holds runtime credentials, Cloud DNS runs the celerscet.com domains, and Cloud Logging aggregates structured logs from every service.",
        b: [
          "Boolean env flags parsed by one shared utility and logged at boot",
          "One canonical public URL rule — emailed links never point at staging",
        ],
        c: ["Secret Manager", "Cloud DNS", "Cloud Logging"],
      },
      pay: {
        t: "Razorpay", s: "admission & fees",
        h: "Money, handled carefully",
        d: "Online payment collection for admissions and fees through Razorpay, integrated via South Indian Bank — with payment status tracked on the application record.",
        b: [
          "Payer-only personal notifications — nobody's money is broadcast",
          "Post-submit locks so a paid application can't be silently edited",
        ],
        c: ["Razorpay", "Payment tracking"],
      },
      mail: {
        t: "Email", s: "smtp · nodemailer",
        h: "Transactional email that lands",
        d: "Account activation, set-password links, credentials and reminders go out via SMTP — built from one canonical URL source so a real user is never emailed a staging link.",
        b: ["Set-password & activation flows", "Failure surfacing instead of silent drops"],
        c: ["Nodemailer", "SMTP"],
      },
      bio: {
        t: "Biometric bridge", s: "on-prem → cloud",
        h: "The physical campus, connected",
        d: "A scheduled agent reads Matrix COSEC biometric punches from an on-prem SQL Server and pushes them into staff attendance every 10 minutes — read-only against the source.",
        b: ["Windows agent + task scheduler", "Read-only SQL access by design"],
        c: ["COSEC", "SQL Server", "Automation"],
      },
    },
  };

  const archMap = document.getElementById("arch-map");
  const archInfo = document.getElementById("arch-info");
  if (archMap && archInfo) {
    const order = [];
    ARCH.tiers.forEach(tier => {
      const tierEl = document.createElement("div");
      tierEl.className = "arch-tier";
      tierEl.innerHTML = `<div class="arch-tier-label">${tier.label}</div>`;
      const row = document.createElement("div");
      row.className = "arch-row";
      tier.nodes.forEach(key => {
        const n = ARCH.nodes[key];
        const b = document.createElement("button");
        b.className = "arch-node";
        b.setAttribute("role", "tab");
        b.id = `arch-tab-${key}`;
        b.dataset.key = key;
        b.innerHTML = `<span class="t">${n.t}</span><span class="s">${n.s}</span>`;
        const idx = order.length;
        order.push(key);
        b.addEventListener("click", () => selectArch(idx));
        b.addEventListener("keydown", (e) => tabKeys(e, idx, ARCH.tiers.reduce((a, t) => a + t.nodes.length, 0), selectArch));
        row.appendChild(b);
      });
      tierEl.appendChild(row);
      archMap.appendChild(tierEl);
    });

    const allNodes = () => archMap.querySelectorAll(".arch-node");
    function selectArch(idx) {
      const key = order[idx];
      allNodes().forEach((el, j) => {
        el.setAttribute("aria-selected", String(j === idx));
        el.setAttribute("tabindex", j === idx ? "0" : "-1");
      });
      const n = ARCH.nodes[key];
      archInfo.setAttribute("aria-labelledby", `arch-tab-${key}`);
      archInfo.innerHTML = `
        <p class="mono">${n.s}</p>
        <h5>${n.h}</h5>
        <p>${n.d}</p>
        <ul>${n.b.map(x => `<li>${x}</li>`).join("")}</ul>
        <p class="meta-line">${n.c.join(" · ")}</p>`;
    }
    selectArch(0);
  }

  /* shared arrow-key handling for tab groups */
  function tabKeys(e, i, len, select) {
    let next = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % len;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + len) % len;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = len - 1;
    if (next === null) return;
    e.preventDefault();
    select(next);
    const group = e.currentTarget.parentElement.closest('[role="tablist"]') || e.currentTarget.closest('[role="tablist"]');
    const tabs = group ? group.querySelectorAll('[role="tab"]') : [];
    if (tabs[next]) tabs[next].focus();
  }

  /* ==========================================================================
     Project card decorative visuals (inline SVG, deterministic)
     ========================================================================== */
  const AZ = "#5c9eff", MN = "#43d9a3", ST = "rgba(151,168,205,";
  const VISUALS = {
    erp: `
      <svg viewBox="0 0 340 170" width="100%" height="100%" fill="none" preserveAspectRatio="xMidYMid meet">
        ${[0, 1, 2, 3].map(r => [0, 1, 2, 3, 4].map(c => {
          const hot = (r === 1 && c === 1) || (r === 2 && c === 3);
          const mint = r === 0 && c === 3;
          return `<rect x="${18 + c * 62}" y="${14 + r * 38}" width="50" height="26" rx="6"
            stroke="${hot ? AZ : mint ? MN : ST + '0.25)'}" fill="${hot ? 'rgba(92,158,255,0.12)' : mint ? 'rgba(67,217,163,0.08)' : 'rgba(151,168,205,0.04)'}"/>`;
        }).join("")).join("")}
        <path d="M 105 53 L 130 53 M 229 91 L 205 91 M 143 66 L 143 84 M 267 66 L 267 84" stroke="${ST}0.4)" stroke-dasharray="3 4"/>
        <circle cx="143" cy="53" r="3" fill="${AZ}"/>
        <circle cx="267" cy="91" r="3" fill="${AZ}"/>
        <circle cx="205" cy="27" r="3" fill="${MN}"/>
      </svg>`,
    cloud: `
      <svg viewBox="0 0 340 170" width="100%" height="100%" fill="none" preserveAspectRatio="xMidYMid meet">
        <path d="M 60 60 a 24 24 0 0 1 46 -9 a 19 19 0 0 1 11 35 h -50 a 17 17 0 0 1 -7 -26" stroke="${AZ}" stroke-width="1.6"/>
        ${[0, 1, 2].map(i => `
          <rect x="40" y="${100 + i * 22}" width="260" height="14" rx="5" stroke="${ST}0.25)" fill="rgba(151,168,205,0.04)"/>
          <rect x="46" y="${104 + i * 22}" width="${[150, 96, 200][i]}" height="6" rx="3" fill="${i === 1 ? MN : AZ}" opacity="0.6"/>
          <circle cx="290" cy="${107 + i * 22}" r="3" fill="${i === 2 ? ST + '0.5)' : MN}"/>`).join("")}
        <path d="M 130 86 v 10 M 170 74 v 22 M 210 82 v 14" stroke="${ST}0.4)" stroke-dasharray="3 4"/>
        <text x="150" y="52" font-family="monospace" font-size="11" fill="${ST}0.75)">deploy · monitor</text>
      </svg>`,
    ml: `
      <svg viewBox="0 0 340 170" width="100%" height="100%" fill="none" preserveAspectRatio="xMidYMid meet">
        <rect x="22" y="26" width="86" height="112" rx="8" stroke="${ST}0.3)"/>
        ${[0, 1, 2, 3, 4].map(i => `<rect x="32" y="${38 + i * 20}" width="${[64, 48, 58, 40, 52][i]}" height="7" rx="3" fill="${ST}0.3)"/>`).join("")}
        <path d="M 108 82 h 34" stroke="${AZ}" stroke-dasharray="4 4"/>
        <path d="m 136 76 8 6 -8 6" stroke="${AZ}" fill="none"/>
        <rect x="146" y="56" width="56" height="52" rx="10" stroke="${AZ}" fill="rgba(92,158,255,0.08)"/>
        <circle cx="166" cy="74" r="3.5" fill="${AZ}"/><circle cx="184" cy="74" r="3.5" fill="${AZ}"/>
        <circle cx="166" cy="92" r="3.5" fill="${AZ}"/><circle cx="184" cy="92" r="3.5" fill="${MN}"/>
        <path d="M 202 82 h 32" stroke="${AZ}" stroke-dasharray="4 4"/>
        <path d="m 228 76 8 6 -8 6" stroke="${AZ}" fill="none"/>
        <rect x="240" y="34" width="80" height="100" rx="8" stroke="${ST}0.3)"/>
        <path d="M 250 116 l 16 -22 14 10 18 -34 12 14" stroke="${MN}" stroke-width="1.8" stroke-linejoin="round"/>
        ${[0, 1, 2, 3].map(i => `<circle cx="${256 + i * 18}" cy="${124 - i * 4}" r="2" fill="${ST}0.45)"/>`).join("")}
      </svg>`,
    gan: `
      <svg viewBox="0 0 340 170" width="100%" height="100%" fill="none" preserveAspectRatio="xMidYMid meet">
        <rect x="28" y="34" width="104" height="104" rx="10" stroke="${ST}0.35)"/>
        <path d="M 40 118 l 22 -30 18 14 24 -38 18 24" stroke="${ST}0.4)" stroke-width="1.6"/>
        <ellipse cx="66" cy="62" rx="21" ry="11" fill="rgba(151,168,205,0.28)"/>
        <ellipse cx="102" cy="84" rx="16" ry="9" fill="rgba(151,168,205,0.22)"/>
        <ellipse cx="82" cy="104" rx="13" ry="7" fill="rgba(151,168,205,0.18)"/>
        <path d="M 146 86 h 36 m -8 -7 8 7 -8 7" stroke="${AZ}" stroke-width="1.6"/>
        <text x="140" y="72" font-family="monospace" font-size="10" fill="${AZ}">GAN</text>
        <rect x="206" y="34" width="104" height="104" rx="10" stroke="${MN}"/>
        <path d="M 218 118 l 22 -30 18 14 24 -38 18 24" stroke="${MN}" stroke-width="1.8"/>
        <circle cx="292" cy="56" r="9" stroke="${MN}" opacity="0.8"/>
      </svg>`,
  };
  document.querySelectorAll(".pv-body[data-visual]").forEach(el => {
    const v = VISUALS[el.dataset.visual];
    if (v) el.innerHTML = v;
  });
})();
