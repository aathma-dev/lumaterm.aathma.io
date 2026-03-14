export function initLightbox() {
  const overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";

  const img = document.createElement("img");
  img.className = "lightbox-img";
  overlay.appendChild(img);

  document.body.appendChild(overlay);

  document.querySelectorAll<HTMLImageElement>(".hero-img, .showcase-img").forEach((el) => {
    el.style.cursor = "zoom-in";
    el.addEventListener("click", () => {
      img.src = el.src;
      img.alt = el.alt;
      overlay.classList.add("active");
    });
  });

  overlay.addEventListener("click", () => {
    overlay.classList.remove("active");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      overlay.classList.remove("active");
    }
  });
}
