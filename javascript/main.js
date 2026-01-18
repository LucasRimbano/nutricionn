(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const container = $(".section-con-scroll");
  const sections = $$(".snap-section");
  const dots = $$(".dot-nav .dot");

  function setActiveDot(idx) {
    dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
  }

  function initDots() {
    if (!dots.length) return;

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const sel = dot.getAttribute("data-target");
        const target = sel ? $(sel) : null;
        if (!target) return;
        container.scrollTo({ top: target.offsetTop, behavior: "smooth" });
      });
    });

    const io = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      const idx = sections.indexOf(visible.target);
      if (idx >= 0) setActiveDot(idx);
    }, { root: container, threshold: [0.35, 0.5, 0.65] });

    sections.forEach(s => io.observe(s));
    setActiveDot(0);
  }

  function initTitleAnime() {
    if (!window.anime) return;

    const titles = $$(".qs-title");
    titles.forEach((title) => {
      const section = title.closest(".snap-section");
      if (!section) return;

      if (title.dataset.ready === "1") return;
      title.dataset.ready = "1";

      // split en palabras
      const text = title.textContent.trim().replace(/\s+/g, " ");
      title.innerHTML = text.split(" ").map(w => `<span class="word">${w}</span>`).join(" ");
      const words = $$(".word", title);

      const tl = anime.timeline({ autoplay: false, easing: "easeInOutQuad" })
        .add({ targets: title, rotateX: [18, 0], rotateY: [-18, 0], duration: 600 }, 0)
        .add({
          targets: words,
          opacity: [0, 1],
          translateY: [10, 0],
          duration: 650,
          delay: anime.stagger(55, { from: "random" })
        }, 0);

      const io = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) tl.restart();
      }, { root: container, threshold: 0.35 });

      io.observe(section);
    });
  }

function initSection4SquaresAnime() {
  if (!window.anime) return;

  const section4 = document.querySelector("#section4");
  if (!section4) return;

  const play = () => {
    // ✅ resetear estado para que se vea desde el inicio SIEMPRE
    anime.set("#section4 #selector-demo .square", {
      translateX: 0,
      rotateY: 0
    });

    // ✅ ejecutar animación
    anime({
      targets: "#section4 #selector-demo .square",
      translateX: [-100, 150],
      rotateY: [0, 360],
      duration: 1100,
      easing: "easeInOutQuad",
      delay: anime.stagger(380)
    });
  };

  const io = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) {
      play();
    }
  }, { root: container, threshold: 0.45 });

  io.observe(section4);
}


  function init() {
    if (!container || !sections.length) return;
    initDots();
    initTitleAnime();
    initSection4SquaresAnime();
  }

  window.addEventListener("load", init);
})();
