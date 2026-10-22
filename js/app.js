(() => {
  const slides = [...document.querySelectorAll(".slide")];
  const bar = document.getElementById("bar");
  const counter = document.getElementById("counter");
  const themeBtn = document.getElementById("themeBtn");
  const overview = document.getElementById("overview");
  let i = 0;
  let animating = false;

  const savedTheme = localStorage.getItem("autosense-theme");
  if (savedTheme === "light") {
    document.documentElement.classList.add("light");
    themeBtn.textContent = "Light";
  } else {
    themeBtn.textContent = "Dark";
  }

  function show(n, dir = 1) {
    if (animating) return;
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === i && slides[n].classList.contains("active")) {
      updateChrome();
      return;
    }
    const prev = slides[i];
    const next = slides[n];
    animating = true;
    prev.classList.remove("active");
    prev.classList.add("leaving");
    setTimeout(() => {
      prev.classList.remove("leaving");
      prev.style.display = "";
      i = n;
      next.classList.add("active");
      updateChrome();
      animating = false;
    }, 180);
  }

  function updateChrome() {
    bar.style.width = `${((i + 1) / slides.length) * 100}%`;
    counter.textContent = `${i + 1} / ${slides.length}`;
    document.querySelectorAll(".thumb").forEach((t, idx) => {
      t.classList.toggle("current", idx === i);
    });
  }

  function go(d) { show(i + d, d); }

  document.getElementById("prevBtn").onclick = () => go(-1);
  document.getElementById("nextBtn").onclick = () => go(1);

  themeBtn.onclick = () => {
    const light = document.documentElement.classList.toggle("light");
    themeBtn.textContent = light ? "Light" : "Dark";
    localStorage.setItem("autosense-theme", light ? "light" : "dark");
  };

  slides.forEach((s, idx) => {
    const t = document.createElement("button");
    t.className = "thumb";
    t.innerHTML = `<small>SLIDE ${String(idx + 1).padStart(2, "0")}</small><p>${s.dataset.title || "Slide"}</p>`;
    t.onclick = () => {
      overview.classList.remove("open");
      show(idx);
    };
    overview.appendChild(t);
  });

  document.getElementById("overviewBtn").onclick = () => {
    overview.classList.toggle("open");
  };

  document.getElementById("pdfBtn").onclick = exportPdf;

  function exportPdf() {
    overview.classList.remove("open");
    const hint = document.querySelector(".hint");
    const chrome = document.querySelector(".chrome");
    hint.style.display = "none";
    chrome.style.display = "none";
    document.body.classList.add("print-mode");
    slides.forEach((s) => s.classList.add("active"));
    const restore = () => {
      document.body.classList.remove("print-mode");
      hint.style.display = "";
      chrome.style.display = "";
      slides.forEach((s, idx) => s.classList.toggle("active", idx === i));
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    setTimeout(() => window.print(), 80);
  }

  window.addEventListener("keydown", (e) => {
    if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
    if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
      e.preventDefault(); go(1);
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault(); go(-1);
    } else if (e.key === "Home") show(0);
    else if (e.key === "End") show(slides.length - 1);
    else if (e.key === "o" || e.key === "O") overview.classList.toggle("open");
    else if (e.key === "t" || e.key === "T") themeBtn.click();
    else if (e.key === "Escape") overview.classList.remove("open");
    else if (e.key === "p" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      exportPdf();
    }
  });

  let touchX = null;
  window.addEventListener("touchstart", (e) => { touchX = e.changedTouches[0].screenX; }, { passive: true });
  window.addEventListener("touchend", (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].screenX - touchX;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    touchX = null;
  }, { passive: true });

  updateChrome();
})();
