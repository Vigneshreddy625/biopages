const hostname = window.location.hostname;
console.log(`Current hostname: ${hostname}`);
const isDev = hostname === "localhost" || hostname === "www.dev.onetr.ee";

const isProd = hostname === "www.onetr.ee";

let apiUrl = "https://cme.sh"; 
if (isDev) {
  apiUrl = "https://dev.cme.sh";
} else if (isProd) {
  apiUrl = "https://cme.sh";
} else {
  console.warn(`Unrecognized hostname: ${hostname}. Defaulting to production API.`);
  apiUrl = "https://cme.sh"; 
}

console.log(`Using API base URL: ${apiUrl}`);

export const CONFIG = {
  API_BASE_URL: "https://unwary-isolated-polio.ngrok-free.dev ",
  REDIRECT_URL: "https://cutmeshort.com",
  BIOPAGE_ENDPOINT: "/biopages"
};