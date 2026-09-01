import "./portfolio.js";

(() => {
  const config = window.PORTFOLIO_CONFIG;
  const mediaGrid = document.querySelector("#media-grid");
  const projectDialog = document.querySelector("#project-dialog");
  const contactDialog = document.querySelector("#contact-dialog");
  const toast = document.querySelector("[data-toast]");

  const escapeHtml = (value = "") =>
    value.replace(/[&<>'"]/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
    })[char]);

  const archiveMarkup = (item, index) => {
    const preview = toEmbed(item.mediaUrl);
    return `
    <article class="media-card reveal">
      <div class="media-preview">
        ${preview?.type === "iframe" ? `<iframe data-preview-src="${escapeHtml(preview.src)}" title="${escapeHtml(item.client)} ${escapeHtml(item.format)} thumbnail" scrolling="no" tabindex="-1" aria-hidden="true"></iframe>` : ""}
        <span class="preview-loading" aria-hidden="true">Loading preview</span>
        <button type="button" data-archive="${index}" aria-label="Play ${escapeHtml(item.client)} ${escapeHtml(item.format)} inside the portfolio">
          <span>${item.format === "Reel" ? "▶ Play" : "▦ View"}</span>
        </button>
      </div>
      <div class="media-info">
        <span>${escapeHtml(item.client)}</span>
        <span>${escapeHtml(item.format)}</span>
      </div>
    </article>`;
  };

  function renderArchive() {
    mediaGrid.innerHTML = config.mediaArchive.map(archiveMarkup).join("");
    observePreviews();
    observeReveals();
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

  function openArchive(index) {
    const item = config.mediaArchive[index];
    const embed = toEmbed(item.mediaUrl);
    const media = projectDialog.querySelector("[data-dialog-media]");
    media.className = "dialog-media archive-player";
    media.innerHTML = embed
      ? `<iframe src="${escapeHtml(embed.src)}" title="${escapeHtml(item.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
      : `<div class="dialog-placeholder"><strong>Media unavailable</strong></div>`;
    const platform = item.mediaUrl.includes("drive.google.com") ? "Google Drive" : "Instagram";
    projectDialog.querySelector("[data-dialog-index]").textContent = "Project / On-page playback";
    projectDialog.querySelector("[data-dialog-title]").textContent = `${item.client} / ${item.format}`;
    projectDialog.querySelector("[data-dialog-description]").textContent =
      "Published social content embedded directly inside this portfolio.";
    projectDialog.querySelector("[data-dialog-details]").innerHTML = `
      <div><dt>Client</dt><dd>${escapeHtml(item.client)}</dd></div>
      <div><dt>Format</dt><dd>${escapeHtml(item.format)}</dd></div>
      <div><dt>Playback</dt><dd>On-page ${platform} embed</dd></div>`;
    projectDialog.showModal();
    document.body.classList.add("modal-open");
  }

  mediaGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-archive]");
    if (button) openArchive(Number(button.dataset.archive));
  });

  let previewObserver;
  function observePreviews() {
    if (!previewObserver) {
      previewObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const frame = entry.target;
          frame.src = frame.dataset.previewSrc;
          frame.addEventListener("load", () => frame.closest(".media-preview")?.classList.add("loaded"), { once: true });
          previewObserver.unobserve(frame);
        });
      }, { rootMargin: "400px 0px" });
    }
    document.querySelectorAll("iframe[data-preview-src]").forEach((frame) => previewObserver.observe(frame));
  }

  document.querySelectorAll(".dialog-close").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog").close());
  });
  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
      document.body.classList.remove("modal-open");
      const media = dialog.querySelector("[data-dialog-media]");
      if (media) media.innerHTML = "";
    });
  });

  function setContact() {
    const socials = [
      config.whatsappNumber && `<a href="https://wa.me/${escapeHtml(config.whatsappNumber.replace(/\D/g, ""))}" target="_blank" rel="noreferrer">WhatsApp ↗</a>`,
      config.instagram && `<a href="${escapeHtml(config.instagram)}" target="_blank" rel="noreferrer">Instagram ↗</a>`,
      config.linkedin && `<a href="${escapeHtml(config.linkedin)}" target="_blank" rel="noreferrer">LinkedIn ↗</a>`,
    ].filter(Boolean);
    document.querySelector("[data-socials]").innerHTML = socials.length ? socials.join("") : "Visual × Sound × AI";

    const actions = [
      config.whatsappNumber && `<a class="primary" href="https://wa.me/${escapeHtml(config.whatsappNumber.replace(/\D/g, ""))}" target="_blank" rel="noreferrer">WhatsApp ${escapeHtml(config.whatsappDisplay)} ↗</a>`,
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

  renderArchive();
  setContact();
  observeReveals();
  initSignal();
})();
