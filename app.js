import "./portfolio.js";

(() => {
  const config = window.PORTFOLIO_CONFIG;
  const grid = document.querySelector("#project-grid");
  const projectDialog = document.querySelector("#project-dialog");
  const contactDialog = document.querySelector("#contact-dialog");
  const toast = document.querySelector("[data-toast]");
  let activeFilter = "all";

  const escapeHtml = (value = "") =>
    value.replace(/[&<>'"]/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
    })[char]);

  const projectMarkup = (project, index) => `
    <article class="project-card reveal" data-category="${project.category.join(" ")}" style="--accent:${project.accent}">
      <button type="button" data-project="${index}" aria-label="Open ${escapeHtml(project.title)} project">
        <div class="project-cover cover-${project.cover}">
          <span class="cover-index">${String(index + 1).padStart(2, "0")}</span>
          <div class="cover-art" aria-hidden="true"><i></i><i></i><i></i></div>
          <span class="cover-client">${escapeHtml(project.client)}</span>
          <span class="view-cue">View case ↗</span>
        </div>
        <div class="project-info">
          <div><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.discipline)}</p></div>
          <span>${escapeHtml(project.year)}</span>
        </div>
      </button>
    </article>`;

  function renderProjects() {
    grid.innerHTML = config.projects.map(projectMarkup).join("");
    applyFilter();
    observeReveals();
  }

  function applyFilter() {
    document.querySelectorAll(".project-card").forEach((card) => {
      const visible = activeFilter === "all" || card.dataset.category.split(" ").includes(activeFilter);
      card.hidden = !visible;
    });
  }

  function toEmbed(url) {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("instagram.com")) {
        const match = parsed.pathname.match(/\/(reel|p)\/([^/]+)/);
        return match ? { type: "iframe", src: `https://www.instagram.com/${match[1]}/${match[2]}/embed` } : null;
      }
      if (parsed.hostname.includes("drive.google.com")) {
        const match = parsed.pathname.match(/\/file\/d\/([^/]+)/);
        return match ? { type: "iframe", src: `https://drive.google.com/file/d/${match[1]}/preview` } : null;
      }
      if (parsed.hostname.includes("youtu.be") || parsed.hostname.includes("youtube.com")) {
        const id = parsed.hostname.includes("youtu.be") ? parsed.pathname.slice(1) : parsed.searchParams.get("v");
        return id ? { type: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}` } : null;
      }
      if (/\.(mp4|webm)$/i.test(parsed.pathname)) return { type: "video", src: url };
      if (/\.(jpg|jpeg|png|webp|gif)$/i.test(parsed.pathname)) return { type: "image", src: url };
    } catch (_) {
      return null;
    }
    return null;
  }

  function openProject(index) {
    const project = config.projects[index];
    const embed = toEmbed(project.mediaUrl);
    const media = projectDialog.querySelector("[data-dialog-media]");
    media.className = `dialog-media cover-${project.cover}`;
    media.style.setProperty("--accent", project.accent);
    media.innerHTML = embed
      ? embed.type === "iframe"
        ? `<iframe src="${escapeHtml(embed.src)}" title="${escapeHtml(project.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`
        : embed.type === "video"
          ? `<video src="${escapeHtml(embed.src)}" controls playsinline></video>`
          : `<img src="${escapeHtml(embed.src)}" alt="${escapeHtml(project.title)}" />`
      : `<div class="dialog-placeholder"><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(project.client)}</strong><small>Add the live media URL in portfolio.js</small></div>`;

    projectDialog.querySelector("[data-dialog-index]").textContent = `${String(index + 1).padStart(2, "0")} / ${project.category.join(" · ")}`;
    projectDialog.querySelector("[data-dialog-title]").textContent = project.title;
    projectDialog.querySelector("[data-dialog-description]").textContent = project.description;
    projectDialog.querySelector("[data-dialog-details]").innerHTML = `
      <div><dt>Client</dt><dd>${escapeHtml(project.client)}</dd></div>
      <div><dt>Contribution</dt><dd>${escapeHtml(project.contribution)}</dd></div>
      <div><dt>Year</dt><dd>${escapeHtml(project.year)}</dd></div>`;
    const original = projectDialog.querySelector("[data-dialog-link]");
    original.hidden = !project.mediaUrl;
    if (project.mediaUrl) original.href = project.mediaUrl;
    projectDialog.showModal();
    document.body.classList.add("modal-open");
  }

  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-project]");
    if (button) openProject(Number(button.dataset.project));
  });

  document.querySelectorAll(".filter").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      document.querySelectorAll(".filter").forEach((item) => item.classList.toggle("active", item === button));
      applyFilter();
    });
  });

  document.querySelectorAll(".dialog-close").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog").close());
  });
  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => document.body.classList.remove("modal-open"));
  });

  function setContact() {
    const socials = [
      config.instagram && `<a href="${escapeHtml(config.instagram)}" target="_blank" rel="noreferrer">Instagram ↗</a>`,
      config.linkedin && `<a href="${escapeHtml(config.linkedin)}" target="_blank" rel="noreferrer">LinkedIn ↗</a>`,
    ].filter(Boolean);
    document.querySelector("[data-socials]").innerHTML = socials.length ? socials.join("") : "Visual × Sound × AI";

    const actions = [
      config.email && `<a class="primary" href="mailto:${escapeHtml(config.email)}?subject=Project%20enquiry">Email me ↗</a>`,
      config.instagram && `<a href="${escapeHtml(config.instagram)}" target="_blank" rel="noreferrer">Instagram ↗</a>`,
      config.linkedin && `<a href="${escapeHtml(config.linkedin)}" target="_blank" rel="noreferrer">LinkedIn ↗</a>`,
    ].filter(Boolean);
    document.querySelector("[data-contact-actions]").innerHTML = actions.length
      ? actions.join("")
      : `<button type="button" data-copy-note>Copy setup note</button>`;
  }

  document.querySelector("[data-contact]").addEventListener("click", () => contactDialog.showModal());
  document.addEventListener("click", async (event) => {
    if (!event.target.matches("[data-copy-note]")) return;
    await navigator.clipboard.writeText("Add your email and social URLs at the top of portfolio.js");
    toast.textContent = "Setup note copied";
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1800);
  });

  const menu = document.querySelector(".menu-toggle");
  menu.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    menu.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll("nav a").forEach((link) => link.addEventListener("click", () => document.body.classList.remove("menu-open")));
  document.querySelector("[data-top]").addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
  document.querySelector("[data-year]").textContent = new Date().getFullYear();

  let revealObserver;
  function observeReveals() {
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
    }
    document.querySelectorAll(".reveal:not(.visible)").forEach((element) => revealObserver.observe(element));
  }

  const header = document.querySelector("[data-header]");
  let previousY = 0;
  addEventListener("scroll", () => {
    const y = scrollY;
    header.classList.toggle("compact", y > 50);
    header.classList.toggle("hidden", y > previousY && y > 500);
    previousY = y;
  }, { passive: true });

  const cursor = document.querySelector(".cursor");
  if (matchMedia("(pointer:fine)").matches) {
    addEventListener("pointermove", (event) => {
      cursor.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
    });
    document.addEventListener("pointerover", (event) => cursor.classList.toggle("active", Boolean(event.target.closest("a,button"))));
  }

  function initSignal() {
    const canvas = document.querySelector("#signal-canvas");
    const context = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let frame = 0;
    const resize = () => {
      const ratio = Math.min(devicePixelRatio, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const shouldAnimate = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.strokeStyle = "rgba(215,255,63,.78)";
      context.lineWidth = 1;
      for (let row = 0; row < 18; row += 1) {
        context.beginPath();
        for (let x = 0; x <= width; x += 8) {
          const focus = Math.exp(-Math.pow((x - width * 0.58) / (width * 0.25), 2));
          const wave = Math.sin(x * 0.025 + row * 0.7 + frame * 0.025) * 32 * focus;
          const y = height * 0.22 + row * 14 + wave;
          x === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
        }
        context.stroke();
      }
      frame += 1;
      if (shouldAnimate) requestAnimationFrame(draw);
    };
    resize();
    addEventListener("resize", resize);
    draw();
  }

  renderProjects();
  setContact();
  observeReveals();
  initSignal();
})();
