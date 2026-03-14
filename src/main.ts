import { initReleases } from "./releases";
import { initMoon } from "./moon";
import { initSpace } from "./space";

document.addEventListener("DOMContentLoaded", () => {
  initReleases();
  initMoon();
  initSpace();
});
