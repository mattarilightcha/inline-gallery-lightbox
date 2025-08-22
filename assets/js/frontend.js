// Inline Gallery Lightbox - Frontend
document.addEventListener("DOMContentLoaded", () => {
  if (window.__IGL_INIT__ || document.querySelector(".game-mod-lightbox")) {
    return;
  }
  window.__IGL_INIT__ = true;
  // ===== Lightbox scaffold =====
  const lightbox = document.createElement("div");
  lightbox.className = "game-mod-lightbox";
  lightbox.innerHTML = `
    <div class="game-mod-lightbox-overlay" role="dialog" aria-modal="true">
      <div class="game-mod-lightbox-content">
        <button class="game-mod-lightbox-close" aria-label="閉じる"></button>
        <div class="game-mod-lightbox-media-container">
          <img class="game-mod-lightbox-image" alt="preview">
          <div class="game-mod-lightbox-video" style="display:none;">
            <iframe src="" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
          </div>
        </div>
        <button class="game-mod-lightbox-prev" aria-label="前へ"></button>
        <button class="game-mod-lightbox-next" aria-label="次へ"></button>
      </div>
      <div class="game-mod-lightbox-thumbnails">
        <div class="game-mod-lightbox-thumbnails-container"></div>
      </div>
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector(".game-mod-lightbox-image");
  const lightboxVideo = lightbox.querySelector(".game-mod-lightbox-video");
  const lightboxFrame = lightboxVideo.querySelector("iframe");
  const btnPrev = lightbox.querySelector(".game-mod-lightbox-prev");
  const btnNext = lightbox.querySelector(".game-mod-lightbox-next");
  const btnClose = lightbox.querySelector(".game-mod-lightbox-close");
  const overlay = lightbox.querySelector(".game-mod-lightbox-overlay");
  const thumbs = lightbox.querySelector(".game-mod-lightbox-thumbnails-container");

  let items = [];
  let index = 0;

  function setMedia(i) {
    if (!items[i]) return;
    const m = items[i];

    if (m.type === "youtube") {
      lightboxImage.style.display = "none";
      lightboxVideo.style.display = "block";
      lightboxFrame.src = `https://www.youtube.com/embed/${m.videoId}?autoplay=1`;
    } else {
      lightboxVideo.style.display = "none";
      lightboxFrame.src = "";
      lightboxImage.style.display = "block";
      lightboxImage.src = m.href || m.url;
    }
    renderThumbs();
    btnPrev.style.display = items.length > 1 ? "block" : "none";
    btnNext.style.display = items.length > 1 ? "block" : "none";
  }

  function renderThumbs() {
    thumbs.innerHTML = "";
    items.forEach((m, i) => {
      const el = document.createElement("div");
      el.className = "game-mod-lightbox-thumbnail" + (i === index ? " active" : "");
      if (m.type === "youtube") {
        el.innerHTML = `<img src="${m.thumbnail}" alt=""><div class="play-overlay"></div>`;
      } else {
        el.innerHTML = `<img src="${m.href || m.url}" alt="">`;
      }
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        index = i;
        setMedia(index);
      });
      thumbs.appendChild(el);
    });
  }

  function open() {
    lightbox.style.display = "block";
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => lightbox.classList.add("show"));
  }

  function close() {
    lightbox.classList.remove("show");
    document.body.style.overflow = "";
    lightboxFrame.src = "";
    setTimeout(() => {
      lightbox.style.display = "none";
    }, 250);
  }

  btnPrev.addEventListener("click", (e) => {
    e.stopPropagation();
    index = (index - 1 + items.length) % items.length;
    setMedia(index);
  });
  btnNext.addEventListener("click", (e) => {
    e.stopPropagation();
    index = (index + 1) % items.length;
    setMedia(index);
  });
  btnClose.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    const box = overlay.querySelector(".game-mod-lightbox-media-container");
    const thumbsBar = overlay.querySelector(".game-mod-lightbox-thumbnails");
    if (!box.contains(e.target) && !thumbsBar.contains(e.target)) close();
  });
  window.addEventListener("keydown", (e) => {
    if (lightbox.style.display !== "block") return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") { btnNext.click(); }
    if (e.key === "ArrowLeft") { btnPrev.click(); }
  });

  // Hook galleries
  document.querySelectorAll(".igl-block").forEach((block) => {
    const images = block.querySelectorAll(".game-mod-image-link");
    const videos = block.querySelectorAll(".game-mod-video");
    const media = [];
    images.forEach((a) => {
      media.push({ type: "image", href: a.href, element: a });
    });
    videos.forEach((v) => {
      media.push({
        type: "youtube",
        videoId: v.dataset.videoId,
        thumbnail: v.dataset.thumbnail,
        element: v,
      });
    });
    if (media.length) {
      media.forEach((m, i) => {
        m.element.addEventListener("click", (e) => {
          e.preventDefault();
          items = media;
          index = i;
          setMedia(index);
          open();
        });
      });
    }

    // "続き" toggle
    const btnMore = block.querySelector(".game-mod-show-more");
    const more = block.querySelector(".game-mod-images-more");
    if (btnMore && more) {
      const cnt = more.querySelectorAll(".game-mod-image, .game-mod-video").length;
      more.style.display = "none";
      btnMore.addEventListener("click", () => {
        const active = btnMore.classList.toggle("active");
        more.style.display = active ? "grid" : "none";
        btnMore.textContent = active ? "閉じる" : `続き (${cnt})`;
      });
    }
  });
});
