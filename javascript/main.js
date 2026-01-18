(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const container = $(".section-con-scroll");
  const sections = $$(".snap-section");
  const dots = $$(".dot-nav .dot");

  function headerH() {
    const bar = $(".top-bar");
    return bar ? bar.getBoundingClientRect().height : 0;
  }

  function syncTopbarHeight() {
    document.documentElement.style.setProperty("--topbar-h", headerH() + "px");
  }

  function sectionTop(sectionEl) {
    // Con padding-top en container, el top correcto es offsetTop directo
    return Math.max(0, sectionEl.offsetTop);
  }

  function nearestIndex() {
    const y = container.scrollTop;
    let best = 0;
    let bestDist = Infinity;

    for (let i = 0; i < sections.length; i++) {
      const d = Math.abs(sectionTop(sections[i]) - y);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  }

  function scrollToIndex(i, smooth = true) {
    const idx = Math.max(0, Math.min(sections.length - 1, i));
    const top = sectionTop(sections[idx]);
    container.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });

    // Corrección final para “clavar” el snap
    clearTimeout(scrollToIndex._t);
    scrollToIndex._t = setTimeout(() => {
      container.scrollTo({ top: sectionTop(sections[idx]), behavior: "auto" });
    }, 420);
  }

  function setActiveDot(idx) {
    dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
  }

  function initWheel() {
    let locked = false;

    container.addEventListener("wheel", (e) => {
      if (e.ctrlKey) return;

      const dir = Math.sign(e.deltaY);
      if (!dir) return;

      if (locked) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      locked = true;

      scrollToIndex(nearestIndex() + dir, true);

      setTimeout(() => (locked = false), 650);
    }, { passive: false });

    window.addEventListener("keydown", (e) => {
      const down = ["ArrowDown", "PageDown", " "];
      const up = ["ArrowUp", "PageUp"];

      if (down.includes(e.key)) { e.preventDefault(); scrollToIndex(nearestIndex() + 1, true); }
      if (up.includes(e.key)) { e.preventDefault(); scrollToIndex(nearestIndex() - 1, true); }
      if (e.key === "Home") { e.preventDefault(); scrollToIndex(0, true); }
      if (e.key === "End") { e.preventDefault(); scrollToIndex(sections.length - 1, true); }
    });
  }

  function initDots() {
    if (!dots.length) return;

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const sel = dot.getAttribute("data-target");
        const target = sel ? $(sel) : null;
        const idx = target ? sections.indexOf(target) : -1;
        if (idx >= 0) scrollToIndex(idx, true);
      });
    });

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const idx = sections.indexOf(visible.target);
        if (idx >= 0) setActiveDot(idx);
      },
      { root: container, threshold: [0.35, 0.5, 0.65] }
    );

    sections.forEach(s => io.observe(s));
    setActiveDot(0);
  }

  function initTitleAnime() {
    if (!window.anime) return;

    const title = $("#qsTitle");
    const section1 = $("#section1");
    if (!title || !section1) return;

    if (title.dataset.ready === "1") return;
    title.dataset.ready = "1";

    let words = [];

    if (typeof anime.splitText === "function") {
      const split = anime.splitText(title, { words: { wrap: "span", className: "word" } });
      words = split.words;
    } else {
      const text = title.textContent.trim().replace(/\s+/g, " ");
      title.innerHTML = text.split(" ").map(w => `<span class="word">${w}</span>`).join(" ");
      words = $$(".word", title);
    }

    const tl = anime.createTimeline({ autoplay: false, defaults: { ease: "inOutQuad" } })
      .add(title, { rotateX: [18, 0], rotateY: [-18, 0], duration: 600 }, 0)
      .add(words, {
        opacity: [0, 1],
        translateZ: ["-0.5rem", "2.25rem"],
        duration: 650,
        delay: anime.stagger(55, { from: "random" })
      }, 0);

    const play = () => tl.restart();

    const ioTitle = new IntersectionObserver(
      (entries) => { if (entries.some(e => e.isIntersecting)) play(); },
      { root: container, threshold: 0.35 }
    );
    ioTitle.observe(section1);
  }

  function init() {
    if (!container || !sections.length) return;

    syncTopbarHeight();
    window.addEventListener("resize", syncTopbarHeight);

    initWheel();
    initDots();
    initTitleAnime();

    // arrancar clavado en la primera
    scrollToIndex(0, false);
  }

  window.addEventListener("load", init);
})();
