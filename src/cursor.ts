export function initCursor() {
  const dot = document.createElement("div");
  dot.className = "cursor-dot";

  const outline = document.createElement("div");
  outline.className = "cursor-outline";

  document.body.appendChild(dot);
  document.body.appendChild(outline);

  let mouseX = 0;
  let mouseY = 0;
  let outlineX = 0;
  let outlineY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  function animate() {
    outlineX += (mouseX - outlineX) * 0.15;
    outlineY += (mouseY - outlineY) * 0.15;

    outline.style.left = `${outlineX}px`;
    outline.style.top = `${outlineY}px`;

    requestAnimationFrame(animate);
  }
  animate();

  document.addEventListener("mousedown", () => outline.classList.add("click"));
  document.addEventListener("mouseup", () => outline.classList.remove("click"));

  const hoverTargets = "a, button, kbd, .btn-primary, .btn-secondary, .hero-img, .showcase-img, input, [role='button']";
  document.querySelectorAll(hoverTargets).forEach((el) => {
    el.addEventListener("mouseenter", () => outline.classList.add("hover"));
    el.addEventListener("mouseleave", () => outline.classList.remove("hover"));
  });

  document.addEventListener("mouseleave", () => {
    dot.style.opacity = "0";
    outline.style.opacity = "0";
  });

  document.addEventListener("mouseenter", () => {
    dot.style.opacity = "1";
    outline.style.opacity = "1";
  });
}
