const REPO = "aathma-dev/lumaterm";
const API = `https://api.github.com/repos/${REPO}/releases`;

interface Asset {
  name: string;
  browser_download_url: string;
  size: number;
}

interface Release {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  assets: Asset[];
  prerelease: boolean;
  draft: boolean;
}

interface PlatformAsset {
  url: string;
  name: string;
  size: string;
}

interface PlatformDownloads {
  macos?: PlatformAsset;
  macosArm?: PlatformAsset;
  linux?: PlatformAsset;
  linuxDeb?: PlatformAsset;
  linuxRpm?: PlatformAsset;
  windows?: PlatformAsset;
}

function detectPlatform(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "macos";
  if (ua.includes("win")) return "windows";
  return "linux";
}

function formatSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function classifyAssets(assets: Asset[]): PlatformDownloads {
  const downloads: PlatformDownloads = {};

  for (const asset of assets) {
    const name = asset.name.toLowerCase();
    const entry: PlatformAsset = {
      url: asset.browser_download_url,
      name: asset.name,
      size: formatSize(asset.size),
    };

    if (name.endsWith(".dmg") && name.includes("arm")) {
      downloads.macosArm = entry;
    } else if (name.endsWith(".dmg") || (name.includes("macos") && name.endsWith(".zip"))) {
      downloads.macos = entry;
    } else if (name.endsWith(".msi") || name.endsWith(".exe")) {
      downloads.windows = entry;
    } else if (name.endsWith(".deb")) {
      downloads.linuxDeb = entry;
    } else if (name.endsWith(".rpm")) {
      downloads.linuxRpm = entry;
    } else if (name.endsWith(".appimage") || (name.includes("linux") && name.endsWith(".tar.gz"))) {
      downloads.linux = entry;
    }
  }

  return downloads;
}

function getPrimaryDownload(downloads: PlatformDownloads, platform: string): PlatformAsset | undefined {
  switch (platform) {
    case "macos":
      return downloads.macosArm || downloads.macos;
    case "windows":
      return downloads.windows;
    default:
      return downloads.linux || downloads.linuxDeb;
  }
}

function platformLabel(platform: string): string {
  switch (platform) {
    case "macos": return "macOS";
    case "windows": return "Windows";
    default: return "Linux";
  }
}

function renderDownloadButton(release: Release, downloads: PlatformDownloads) {
  const platform = detectPlatform();
  const primary = getPrimaryDownload(downloads, platform);

  // Update all primary download buttons
  const buttons = document.querySelectorAll<HTMLAnchorElement>("[data-download='primary']");
  buttons.forEach((btn) => {
    if (primary) {
      btn.href = primary.url;
      btn.innerHTML = `Download for ${platformLabel(platform)} <span class="btn-hint">${release.tag_name} · ${primary.size}</span>`;
    } else {
      btn.href = release.html_url;
      btn.innerHTML = `Download ${release.tag_name}`;
    }
  });

  // Update version badges
  const badges = document.querySelectorAll("[data-version]");
  badges.forEach((badge) => {
    badge.textContent = `Latest: ${release.tag_name}`;
  });
}

function platformGroup(platform: string): string[] {
  switch (platform) {
    case "macos": return ["macOS (Apple Silicon)", "macOS (Intel)"];
    case "windows": return ["Windows"];
    default: return ["Linux (AppImage)", "Linux (.deb)", "Linux (.rpm)"];
  }
}

function renderAllDownloads(downloads: PlatformDownloads, version: string) {
  const grid = document.getElementById("downloads-grid");
  if (!grid) return;

  const platform = detectPlatform();
  const recommended = platformGroup(platform);

  const items: { label: string; asset?: PlatformAsset; icon: string }[] = [
    { label: "macOS (Apple Silicon)", asset: downloads.macosArm, icon: "🍎" },
    { label: "macOS (Intel)", asset: downloads.macos, icon: "🍎" },
    { label: "Windows", asset: downloads.windows, icon: "🪟" },
    { label: "Linux (AppImage)", asset: downloads.linux, icon: "🐧" },
    { label: "Linux (.deb)", asset: downloads.linuxDeb, icon: "🐧" },
    { label: "Linux (.rpm)", asset: downloads.linuxRpm, icon: "🐧" },
  ];

  const available = items.filter((i) => i.asset);

  if (available.length === 0) {
    grid.innerHTML = `<p class="no-assets">No binaries available yet. <a href="https://github.com/${REPO}/releases/tag/${version}">View release on GitHub</a></p>`;
    return;
  }

  // Sort: recommended platform first
  available.sort((a, b) => {
    const aRec = recommended.includes(a.label) ? 0 : 1;
    const bRec = recommended.includes(b.label) ? 0 : 1;
    return aRec - bRec;
  });

  grid.innerHTML = available
    .map((item) => {
      const isRecommended = recommended.includes(item.label);
      return `
    <a href="${item.asset!.url}" class="download-card${isRecommended ? " download-card--recommended" : ""}">
      ${isRecommended ? '<span class="download-badge">Recommended</span>' : ""}
      <span class="download-icon">${item.icon}</span>
      <span class="download-info">
        <span class="download-label">${item.label}</span>
        <span class="download-meta">${item.asset!.name} · ${item.asset!.size}</span>
      </span>
    </a>
  `;
    })
    .join("");
}

function renderVersionPicker(releases: Release[]) {
  const picker = document.getElementById("version-picker");
  if (!picker) return;

  const stable = releases.filter((r) => !r.prerelease && !r.draft);

  if (stable.length <= 1) {
    picker.style.display = "none";
    return;
  }

  picker.innerHTML = `
    <label for="version-select">Version:</label>
    <select id="version-select">
      ${stable.map((r, i) => `<option value="${i}">${r.tag_name}${i === 0 ? " (latest)" : ""}</option>`).join("")}
    </select>
  `;

  const select = document.getElementById("version-select") as HTMLSelectElement;
  select.addEventListener("change", () => {
    const release = stable[parseInt(select.value)];
    const downloads = classifyAssets(release.assets);
    renderAllDownloads(downloads, release.tag_name);
    renderDownloadButton(release, downloads);
  });
}

export async function initReleases() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);

    const releases: Release[] = await res.json();
    const stable = releases.filter((r) => !r.prerelease && !r.draft);

    if (stable.length === 0) return;

    const latest = stable[0];
    const downloads = classifyAssets(latest.assets);

    renderDownloadButton(latest, downloads);
    renderAllDownloads(downloads, latest.tag_name);
    renderVersionPicker(stable);
  } catch (err) {
    console.warn("Failed to fetch releases:", err);
    // Buttons remain pointing to GitHub releases page as fallback
  }
}
