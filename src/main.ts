import { initReleases } from "./releases";
import { initMoon } from "./moon";
import { initSpace } from "./space";
import { initLightbox } from "./lightbox";
import { initCursor } from "./cursor";
import { initGrid } from "./grid";

document.addEventListener("DOMContentLoaded", () => {
  initReleases();
  initMoon();
  initSpace();
  initLightbox();
  initCursor();
  initGrid();
});
