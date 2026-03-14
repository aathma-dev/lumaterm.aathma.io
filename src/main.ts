import { initReleases } from "./releases";
import { initMoon } from "./moon";
import { initSpace } from "./space";
import { initLightbox } from "./lightbox";
import { initCursor } from "./cursor";

document.addEventListener("DOMContentLoaded", () => {
  initReleases();
  initMoon();
  initSpace();
  initLightbox();
  initCursor();
});
