const faviconCache = (() => {
  try {
    const cached = localStorage.getItem("favicon_cache");
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
})();

const runtimeEnvironment =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "development"
    : "production";

const environmentConfig = {
  development: {
    apiBaseUrl: "https://unwary-isolated-polio.ngrok-free.dev",
  },
  production: {
    apiBaseUrl: "https://unwary-isolated-polio.ngrok-free.dev",
  },
};

function getApiBaseUrl() {
  return environmentConfig[runtimeEnvironment].apiBaseUrl;
}

function mapRadius(radius) {
  const radiusMap = {
    sm: "0px",
    md: "16px",
    lg: "36px",
  };
  return radiusMap[radius] || "8px";
}

function mapFontWeight(weight) {
  const weightMap = {
    Light: "300",
    Normal: "400",
    Bold: "700",
    "Extra Bold": "800",
  };
  return weightMap[weight] || "400";
}

function applyTheme(theme) {
  const root = document.documentElement;
  const safeTheme = theme || {};
  const safeButton = safeTheme.button || {};

  root.style.setProperty("--font-family", `"${safeTheme.fontFamily || "Arial"}", sans-serif`);
  root.style.setProperty("--bg-color", safeTheme.backgroundColor || "white");
  root.style.setProperty("--bg-image", safeTheme.backgroundImage ? `url(${safeTheme.backgroundImage})` : "none");
  root.style.setProperty("--text-color", safeTheme.textColor || "#000000");
  root.style.setProperty("--button-bg", safeButton.color || "white");
  root.style.setProperty("--button-text", safeButton.textColor || "#000000");
  root.style.setProperty("--button-radius", mapRadius(safeButton.radius));
  root.style.setProperty(
    "--button-font-weight",
    mapFontWeight(safeButton.fontWeight),
  );
}

function injectScripts(scriptContent) {
  if (!scriptContent) return;

  const scriptTag = document.createElement("script");
  scriptTag.textContent = scriptContent;
  scriptTag.type = "text/javascript";
  scriptTag.async = true;
  document.head.appendChild(scriptTag);
}

function populateProfile(profile) {
  document.getElementById("avatar-img").src = profile.avatarUrl;
  document.getElementById("avatar-img").loading = "lazy";
  document.getElementById("display-name").textContent = profile.displayName;
  document.getElementById("bio-text").textContent = profile.bio;
}

function generateLinks(links, showPreviewImage, slug) {
  const container = document.getElementById("links-container");
  const fragment = document.createDocumentFragment();

  links.forEach((link) => {
    const linkInfo = document.createElement("div");
    linkInfo.className = "links-info";

    const label = link.label || link.url;
    const linkBtn = document.createElement("a");
    linkBtn.href = link.url;
    linkBtn.target = "_blank";
    linkBtn.rel = "noopener noreferrer";
    linkBtn.className = "link-btn";
    
    try {
      const url = new URL(link.url);
      const domain = url.hostname;
      const faviconUrl = `https://icon.horse/icon/${domain}?size=36`;
      
      if (showPreviewImage) {
        linkBtn.innerHTML = `<span>${label}</span>`;
      } else {
        linkBtn.innerHTML = `
          <img src="${faviconUrl}" alt="${label}" class="link-preview" loading="lazy" onerror="this.style.display='none'" />
          <span>${label}</span>
        `;
      }
    } catch {
      linkBtn.innerHTML = `<span>${label}</span>`;
    }

    linkBtn.addEventListener("click", () => {
      trackLinkClick({
        linkId: link.id,
        clickType: "link_click",
        socialPlatform: null,
        slug,
      });
    });

    linkInfo.appendChild(linkBtn);
    fragment.appendChild(linkInfo);
  });

  container.innerHTML = "";
  container.appendChild(fragment);
}

function generateSocials(socials, slug) {
  const container = document.getElementById("social-icons-container");
  const fragment = document.createDocumentFragment();

  const platformIcons = {
    facebook: "assets/facebook.svg",
    instagram: "assets/instagram.svg",
    twitter: "assets/x.svg",
    x: "assets/x.svg",
    linkedin: "assets/linkedin.svg",
    youtube: "assets/youtube.svg",
    github: "assets/github.svg",
  };

  socials.forEach((social) => {
    const socialLink = document.createElement("a");
    socialLink.href = social.url;
    socialLink.target = "_blank";
    socialLink.rel = "noopener noreferrer";
    socialLink.className = "social-icon";

    const iconPath = platformIcons[social.platform] || "assets/github.svg";
    const img = document.createElement("img");
    img.src = iconPath;
    img.alt = social.label;
    img.loading = "lazy";
    
    socialLink.addEventListener("click", () => {
      trackLinkClick({
        linkId: social.id,
        clickType: "social_click",
        socialPlatform: social.label,
        slug,
      });
    });
    
    socialLink.appendChild(img);
    fragment.appendChild(socialLink);
  });

  container.innerHTML = "";
  container.appendChild(fragment);
}

async function fetchBiopageData(slug) {
  const apiBaseUrl = getApiBaseUrl();
  const apiEndpoint = `${apiBaseUrl}/biopages/${slug}`;

  console.log(`Fetching biopage data from: ${apiEndpoint}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); 

    const response = await fetch(apiEndpoint, {
      method: "POST",
      mode: "cors",
      headers: {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clickType : "bio_click",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Biopage data fetched successfully");
    return data.data || data;
  } catch (error) {
    console.error("Failed to fetch biopage data:", error);
    return null;
  }
}

async function trackLinkClick({linkId, clickType, socialPlatform, slug}) {
  const apiBaseUrl = getApiBaseUrl();
  const apiEndpoint = `${apiBaseUrl}/biopages/${slug}`;

  console.log(`Tracking link click: ${linkId} - ${clickType}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(apiEndpoint, {
      method: "POST",
      mode: "cors",
      headers: {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        linkId,
        clickType,
        socialPlatform,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Link click tracked successfully");
    return data;
  } catch (error) {
    console.error("Failed to track link click:", error);
    return null;
  }
}

function getBiopageSlugFromUrl() {
  const pathname = window.location.pathname;

  const segments = pathname
    .split("/")
    .filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  return segments[0];

  return segments[0];
}

document.addEventListener("DOMContentLoaded", async () => {
  const slug = getBiopageSlugFromUrl();
  const data = await fetchBiopageData(slug);
  
  const loaderContainer = document.getElementById("loader-container");
  const contentContainer = document.getElementById("content-container");

  if (!data) {
    loaderContainer.innerHTML = `
      <div class="error-container">
        <h1>Failed to Load Biopage</h1>
        <p>Could not fetch data from the server. Please check that the API is running and try again.</p>
      </div>
    `;
    loaderContainer.classList.remove("hidden");
    contentContainer.style.display = "none";
    return;
  }

  applyTheme(data.theme);
  populateProfile(data.profile);
  
  loaderContainer.classList.add("hidden");
  contentContainer.style.display = "flex";
  
  document.body.classList.add("loaded");

  if (window.requestIdleCallback) {
    requestIdleCallback(() => {
      generateLinks(data.links, data.showPreviewImage, slug);
      generateSocials(data.socials, slug);
      if (data.scripts) {
        injectScripts(data.scripts);
      }
    });
  } else {
    requestAnimationFrame(() => {
      generateLinks(data.links, data.showPreviewImage, slug);
      generateSocials(data.socials, slug);
      if (data.scripts) {
        injectScripts(data.scripts);
      }
    });
  }
});
